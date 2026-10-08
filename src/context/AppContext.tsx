import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AppState, ClassItem, Student, Homework, Quiz, LearningResource, TeacherProfile, BankQuestion, ExamBankItem } from '../types/index.ts';
import * as api from '../services/api.ts';

export type MainNavView = 'classes' | 'exam_creator' | 'resources' | 'homework' | 'quizzes' | 'analytics' | 'happy_ai' | 'tools' | 'settings';
export type ClassSubTab = 'overview' | 'students' | 'homework' | 'quizzes' | 'analytics';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'teacher' | 'student';

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRealtimeConnected: boolean;
  currentView: MainNavView;
  selectedClassId: string | null;
  selectedClassTab: ClassSubTab;
  currentClass: ClassItem | null;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isTeacher: boolean;
  isStudent: boolean;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  setCurrentView: (view: MainNavView) => void;
  setSelectedClassTab: (tab: ClassSubTab) => void;
  openClass: (classId: string, tab?: ClassSubTab) => void;
  closeClass: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
  // Actions
  createNewClass: (data: Partial<ClassItem>) => Promise<ClassItem>;
  editClass: (id: string, data: Partial<ClassItem>) => Promise<ClassItem>;
  removeClass: (id: string) => Promise<void>;
  addStudentsToClass: (classId: string, students: Partial<Student> | Partial<Student>[]) => Promise<number>;
  editStudent: (id: string, data: Partial<Student>) => Promise<Student>;
  removeStudent: (id: string) => Promise<void>;
  removeStudentsBatch: (ids: string[]) => Promise<void>;
  createNewHomework: (data: Partial<Homework>) => Promise<Homework>;
  removeHomework: (id: string) => Promise<void>;
  toggleStudentHomework: (homeworkId: string, studentId: string, isCompleted: boolean, completedQuestions?: number, totalQuestions?: number) => Promise<void>;
  createNewQuiz: (data: Partial<Quiz>) => Promise<Quiz>;
  removeQuiz: (id: string) => Promise<void>;
  submitQuiz: (quizId: string, studentId: string, answers: Record<string, any>) => Promise<any>;
  createNewResource: (data: Partial<LearningResource>) => Promise<LearningResource>;
  removeResource: (id: string) => Promise<void>;
  
  // Question & Exam Bank Actions
  createQuestion: (data: Partial<BankQuestion>) => Promise<BankQuestion>;
  updateQuestion: (id: string, data: Partial<BankQuestion>) => Promise<BankQuestion>;
  removeQuestion: (id: string) => Promise<void>;
  assignQuestionsToClass: (params: {
    classId: string;
    questionIds: string[];
    title?: string;
    deadline?: string;
    description?: string;
    targetStudentIds?: string[];
  }) => Promise<Homework>;
  createExam: (data: Partial<ExamBankItem>) => Promise<ExamBankItem>;
  removeExam: (id: string) => Promise<void>;
  publishExamToClass: (examId: string, classId: string) => Promise<Quiz>;

  resetAllData: () => Promise<void>;
}

const defaultTeacher: TeacherProfile = {
  id: 'teacher_tung',
  fullName: 'Thầy Hoàng Tùng',
  email: '07071987hoangtung@gmail.com',
  school: 'THPT Chu Văn An & Chuyên Hà Nội - Amsterdam',
  subject: 'Toán học & Vật lý',
  phone: '0988.77.87.87',
  academicYear: '2024 - 2025',
};

const defaultInitialState: AppState = {
  classes: [],
  students: [],
  homeworks: [],
  homeworkSubmissions: [],
  quizzes: [],
  quizSubmissions: [],
  resources: [],
  bankQuestions: [],
  bankExams: [],
  teacher: defaultTeacher,
  lastUpdated: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultInitialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('happy_class_auth') === 'true';
  });
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<MainNavView>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassTab, setSelectedClassTab] = useState<ClassSubTab>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Theme state & dark mode persistence
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('happy_class_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // User role: 'teacher' | 'student'
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('happy_class_role');
    return saved === 'student' ? 'student' : 'teacher';
  });

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('happy_class_role', role);
  }, []);

  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('happy_class_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Connect to Real-time SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onopen = () => {
          setIsRealtimeConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.data) {
              setState(parsed.data);
              setIsLoading(false);
            }
          } catch (e) {
            console.error('Failed to parse SSE event data', e);
          }
        };

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          eventSource?.close();
          // Auto reconnect after 2.5 seconds
          reconnectTimeout = setTimeout(connectSSE, 2500);
        };
      } catch (err) {
        console.error('SSE initialization error', err);
        setIsRealtimeConnected(false);
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    };

    // Initial state fetch as fallback
    api.fetchState()
      .then((data) => {
        setState(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Initial fetchState failed, will rely on SSE:', err);
      });

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cleanEmail = email.trim();
      const cleanPass = pass.trim();
      await api.loginTeacher(cleanEmail, cleanPass);
      setIsAuthenticated(true);
      localStorage.setItem('happy_class_auth', 'true');
      localStorage.setItem('happy_class_email', cleanEmail);
      showToast('Chào mừng Thầy/Cô đã đăng nhập HAPPY CLASS!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Mật khẩu đăng nhập không đúng', 'error');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('happy_class_auth');
    showToast('Đã đăng xuất khỏi tài khoản giáo viên', 'info');
  };

  const openClass = (classId: string, tab: ClassSubTab = 'overview') => {
    setSelectedClassId(classId);
    setSelectedClassTab(tab);
    setCurrentView('classes');
  };

  const closeClass = () => {
    setSelectedClassId(null);
    setSelectedClassTab('overview');
  };

  const currentClass = useMemo(() => {
    if (!selectedClassId) return null;
    return state.classes.find(c => c.id === selectedClassId) || null;
  }, [state.classes, selectedClassId]);

  // Actions
  const createNewClass = async (data: Partial<ClassItem>) => {
    const res = await api.createClass(data);
    showToast(`Đã thêm LỚP ${res.classItem.name} thành công!`, 'success');
    return res.classItem;
  };

  const editClass = async (id: string, data: Partial<ClassItem>) => {
    const res = await api.updateClass(id, data);
    showToast(`Đã cập nhật thông tin LỚP ${res.classItem.name}!`, 'success');
    return res.classItem;
  };

  const removeClass = async (id: string) => {
    await api.deleteClass(id);
    if (selectedClassId === id) closeClass();
    showToast('Đã xóa LỚP HỌC thành công', 'info');
  };

  const addStudentsToClass = async (classId: string, students: Partial<Student> | Partial<Student>[]) => {
    const res = await api.addStudents(classId, students);
    showToast(`Đã thêm thành công ${res.count} học sinh vào LỚP!`, 'success');
    return res.count;
  };

  const editStudent = async (id: string, data: Partial<Student>) => {
    const res = await api.updateStudent(id, data);
    showToast(`Đã cập nhật học sinh ${res.student.fullName}!`, 'success');
    return res.student;
  };

  const removeStudent = async (id: string) => {
    await api.deleteStudent(id);
    showToast('Đã xóa học sinh khỏi danh sách LỚP', 'info');
  };

  const removeStudentsBatch = async (ids: string[]) => {
    await api.batchDeleteStudents(ids);
    showToast(`Đã xóa ${ids.length} học sinh khỏi danh sách LỚP`, 'info');
  };

  const createNewHomework = async (data: Partial<Homework>) => {
    const res = await api.createHomework(data);
    showToast(`Đã giao bài tập: ${res.homework.title}!`, 'success');
    return res.homework;
  };

  const removeHomework = async (id: string) => {
    await api.deleteHomework(id);
    showToast('Đã xóa bài tập thành công!', 'info');
  };

  const toggleStudentHomework = async (
    homeworkId: string,
    studentId: string,
    isCompleted: boolean,
    completedQuestions?: number,
    totalQuestions?: number
  ) => {
    const hw = state.homeworks.find(h => h.id === homeworkId);
    const total = totalQuestions || hw?.totalQuestions || 10;
    const completed = completedQuestions !== undefined ? completedQuestions : (isCompleted ? total : 0);
    
    await api.updateHomeworkSubmission(homeworkId, studentId, isCompleted, completed, total);
    showToast(isCompleted ? '⭐ Đã cộng 1 Ngôi sao Hạnh phúc cho học sinh!' : 'Đã cập nhật trạng thái bài tập', 'success');
  };

  const createNewQuiz = async (data: Partial<Quiz>) => {
    const res = await api.createQuiz(data);
    showToast(`Đã tạo đề kiểm tra: ${res.quiz.title}!`, 'success');
    return res.quiz;
  };

  const removeQuiz = async (id: string) => {
    await api.deleteQuiz(id);
    showToast('Đã xóa bài kiểm tra thành công!', 'info');
  };

  const submitQuiz = async (quizId: string, studentId: string, answers: Record<string, any>) => {
    const res = await api.submitQuizTest(quizId, studentId, answers);
    showToast(`Đã nộp bài thi thành công! Điểm số: ${res.submission.score}/${res.submission.maxScore}`, 'success');
    return res;
  };

  const createNewResource = async (data: Partial<LearningResource>) => {
    const res = await api.createResource(data);
    showToast(`Đã thêm học liệu mới vào thư viện!`, 'success');
    return res.resource;
  };

  const removeResource = async (id: string) => {
    await api.deleteResource(id);
    showToast('Đã xóa học liệu khỏi kho', 'info');
  };

  const createQuestion = async (data: Partial<BankQuestion>) => {
    const res = await api.createBankQuestion(data);
    showToast('Đã lưu câu hỏi vào ngân hàng thành công!', 'success');
    return res.question;
  };

  const updateQuestion = async (id: string, data: Partial<BankQuestion>) => {
    const res = await api.updateBankQuestion(id, data);
    showToast('Đã cập nhật câu hỏi thành công!', 'success');
    return res.question;
  };

  const removeQuestion = async (id: string) => {
    await api.deleteBankQuestion(id);
    showToast('Đã xóa câu hỏi khỏi ngân hàng', 'info');
  };

  const assignQuestionsToClass = async (params: {
    classId: string;
    questionIds: string[];
    title?: string;
    deadline?: string;
    description?: string;
    targetStudentIds?: string[];
  }) => {
    const res = await api.assignQuestionsToHomework(params);
    showToast('Đã giao câu hỏi thành bài tập cho lớp thành công!', 'success');
    return res.homework;
  };

  const createExam = async (data: Partial<ExamBankItem>) => {
    const res = await api.createBankExam(data);
    showToast('Đã lưu đề thi vào ngân hàng thành công!', 'success');
    return res.exam;
  };

  const removeExam = async (id: string) => {
    await api.deleteBankExam(id);
    showToast('Đã xóa đề thi khỏi ngân hàng', 'info');
  };

  const publishExamToClass = async (examId: string, classId: string) => {
    const res = await api.publishBankExamToQuiz(examId, classId);
    showToast('Đã phát đề kiểm tra trực tuyến cho lớp thành công!', 'success');
    return res.quiz;
  };

  const resetAllData = async () => {
    await api.resetDatabase();
    showToast('Đã khôi phục dữ liệu mẫu chuẩn thành công!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        state,
        isLoading,
        isAuthenticated,
        isRealtimeConnected,
        currentView,
        selectedClassId,
        selectedClassTab,
        currentClass,
        theme,
        toggleTheme,
        setTheme,
        userRole,
        setUserRole,
        isTeacher,
        isStudent,
        toast,
        showToast,
        setCurrentView,
        setSelectedClassTab,
        openClass,
        closeClass,
        login,
        logout,
        createNewClass,
        editClass,
        removeClass,
        addStudentsToClass,
        editStudent,
        removeStudent,
        removeStudentsBatch,
        createNewHomework,
        removeHomework,
        toggleStudentHomework,
        createNewQuiz,
        removeQuiz,
        submitQuiz,
        createNewResource,
        removeResource,
        createQuestion,
        updateQuestion,
        removeQuestion,
        assignQuestionsToClass,
        createExam,
        removeExam,
        publishExamToClass,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
