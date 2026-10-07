export interface ClassItem {
  id: string;
  name: string; // e.g. "10A1", "11B2", "12 Chuyên Toán"
  grade: number; // 1 to 12
  school: string;
  subject: string;
  academicYear: string;
  teacherName: string;
  room?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  classId: string;
  studentCode: string;
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  stars: number; // Tích lũy ngôi sao
  notes?: string;
  avatar?: string;
}

export interface HomeworkQuestion {
  id: number;
  content: string;
}

export interface Homework {
  id: string;
  classId: string;
  title: string;
  subject: string;
  deadline: string;
  totalQuestions: number;
  description: string;
  questions: HomeworkQuestion[];
  starReward: number; // Thường là 1 sao khi hoàn thành
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  isCompleted: boolean;
  completedQuestions: number;
  totalQuestions: number;
  starsAwarded: number;
  completedAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[]; // 4 lựa chọn A, B, C, D
  correctAnswer?: number | string; // Index 0-3 or text
  // Theo định dạng Bộ GD&ĐT 2025: câu đúng/sai gồm 4 ý a, b, c, d
  subQuestions?: { id: string; text: string; correctAnswer: boolean }[];
  points: number; // Điểm số cho câu hỏi
  explanation?: string;
}

export interface Quiz {
  id: string;
  classId: string;
  title: string;
  durationMinutes: number;
  totalPoints: number; // Thang 10 điểm
  standard: 'MOET_STANDARD' | 'CUSTOM';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number; // Thang điểm 10
  maxScore: number;
  submittedAt: string;
  status: 'Đạt' | 'Cần cố gắng';
  answers: Record<string, any>;
}

export interface KnowledgeBottleneck {
  topic: string;
  severity: 'cao' | 'trung bình' | 'thấp';
  description: string;
}

export interface TutoringStrategy {
  title: string;
  actionPlan: string;
  targetGroup: string;
}

export interface RecommendedExercise {
  title: string;
  type: string;
  difficulty: 'Cơ bản' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  description: string;
}

export interface AIAnalysisResult {
  targetType: 'class' | 'student';
  targetId: string;
  targetName: string;
  classGrade?: number;
  totalStudents?: number;
  averageScore: number;
  passedCount?: number;
  needsImprovementCount?: number;
  completionRate: number;
  knowledgeBottlenecks: KnowledgeBottleneck[];
  tutoringStrategies: TutoringStrategy[];
  recommendedExercises: RecommendedExercise[];
  summary: string;
  analyzedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'giao_an' | 'bai_giang_slide' | 'so_do_tu_duy' | 'video' | 'de_kiem_tra';
  grade: number;
  subject: string;
  author: string;
  fileSize: string;
  format: string;
  description: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  school: string;
  subject: string;
  phone: string;
  academicYear: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
export type QuestionLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung_thap' | 'van_dung_cao';

export interface SubQuestionItem {
  id: string; // 'a', 'b', 'c', 'd'
  label: string; // 'a)', 'b)', 'c)', 'd)'
  text: string;
  isCorrect: boolean; // Đúng hoặc Sai
}

export interface BankQuestion {
  id: string;
  subject: string; // e.g. "Toán học"
  grade: number; // e.g. 10, 11, 12
  lesson: string; // Bài học / Chủ đề (e.g. "Hàm số bậc hai", "Vectơ")
  level: QuestionLevel; // 'nhan_biet' | 'thong_hieu' | 'van_dung_thap' | 'van_dung_cao'
  type: QuestionType; // 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  content: string; // Nội dung câu hỏi (hỗ trợ LaTeX $...$, $$...$$)
  imageUrl?: string; // Hình ảnh đồ thị, biểu đồ, bảng biến thiên, bảng số liệu, hình minh họa
  
  // Dành cho Trắc nghiệm ABCD
  options?: string[]; // [A, B, C, D]
  correctOptionIndex?: number; // 0, 1, 2, 3

  // Dành cho Đúng / Sai (4 ý a, b, c, d chuẩn BGD)
  subQuestions?: SubQuestionItem[];

  // Dành cho Trả lời ngắn
  shortAnswerCorrect?: string;
  shortAnswerTolerance?: string;

  // Dành cho Tự luận
  essayRubric?: string;

  points: number; // Điểm số (với Đúng/Sai tính theo chuẩn BGD: 1 ý: 0.1, 2 ý: 0.25, 3 ý: 0.5, 4 ý: 1.0)
  explanation?: string; // Lời giải chi tiết / Hướng dẫn giải
  createdAt: string;
}

export interface ExamBankItem {
  id: string;
  title: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  totalPoints: number;
  questionIds: string[];
  note?: string;
  createdAt: string;
}

export interface AppState {
  classes: ClassItem[];
  students: Student[];
  homeworks: Homework[];
  homeworkSubmissions: HomeworkSubmission[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
  resources: LearningResource[];
  bankQuestions: BankQuestion[];
  bankExams: ExamBankItem[];
  teacher: TeacherProfile;
  lastUpdated: string;
}
