import * as XLSX from 'xlsx';
import { AppState, ClassItem, Student, Homework, Quiz, LearningResource, AIAnalysisResult, BankQuestion, ExamBankItem } from '../types/index.ts';

export async function fetchState(): Promise<AppState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Không thể tải dữ liệu máy chủ');
  return res.json();
}

export async function loginTeacher(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Mật khẩu không đúng');
  }
  return data;
}

export async function createClass(classData: Partial<ClassItem>): Promise<{ success: boolean; classItem: ClassItem }> {
  const res = await fetch('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo lớp học');
  return res.json();
}

export async function updateClass(id: string, classData: Partial<ClassItem>): Promise<{ success: boolean; classItem: ClassItem }> {
  const res = await fetch(`/api/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật lớp học');
  return res.json();
}

export async function deleteClass(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa lớp học');
  return res.json();
}

export async function addStudents(classId: string, students: Partial<Student> | Partial<Student>[]): Promise<{ success: boolean; count: number; added: Student[] }> {
  const res = await fetch(`/api/classes/${classId}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students }),
  });
  if (!res.ok) throw new Error('Lỗi khi thêm học sinh');
  return res.json();
}

export async function updateStudent(id: string, studentData: Partial<Student>): Promise<{ success: boolean; student: Student }> {
  const res = await fetch(`/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật học sinh');
  return res.json();
}

export async function deleteStudent(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa học sinh');
  return res.json();
}

export async function batchDeleteStudents(studentIds: string[]): Promise<{ success: boolean; count: number }> {
  const res = await fetch('/api/students/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentIds }),
  });
  if (!res.ok) throw new Error('Lỗi khi xóa danh sách học sinh');
  return res.json();
}

export async function createHomework(hwData: Partial<Homework>): Promise<{ success: boolean; homework: Homework }> {
  const res = await fetch('/api/homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hwData),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo bài tập');
  return res.json();
}

export async function updateHomeworkSubmission(
  homeworkId: string,
  studentId: string,
  isCompleted: boolean,
  completedQuestions: number,
  totalQuestions: number
) {
  const res = await fetch(`/api/homework/${homeworkId}/submissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, isCompleted, completedQuestions, totalQuestions }),
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật bài nộp');
  return res.json();
}

export async function createQuiz(quizData: Partial<Quiz>): Promise<{ success: boolean; quiz: Quiz }> {
  const res = await fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quizData),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo đề kiểm tra');
  return res.json();
}

export async function submitQuizTest(quizId: string, studentId: string, answers: Record<string, any>) {
  const res = await fetch(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, answers }),
  });
  if (!res.ok) throw new Error('Lỗi khi nộp bài kiểm tra');
  return res.json();
}

export async function runAIAnalysis(targetType: 'class' | 'student', targetId: string): Promise<AIAnalysisResult> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Lỗi khi phân tích AI');
  }
  return res.json();
}

export async function callHappyAIAssistant(action: string, prompt: string, grade?: number, subject?: string): Promise<{ success: boolean; text: string }> {
  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, prompt, grade, subject }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Lỗi khi gọi trợ lý AI');
  }
  return res.json();
}

export async function createResource(resourceData: Partial<LearningResource>): Promise<{ success: boolean; resource: LearningResource }> {
  const res = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData),
  });
  if (!res.ok) throw new Error('Lỗi khi tạo học liệu');
  return res.json();
}

export async function deleteResource(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa học liệu');
  return res.json();
}

export async function deleteHomework(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/homework/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa bài tập');
  return res.json();
}

export async function deleteQuiz(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa bài kiểm tra');
  return res.json();
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/reset-data', { method: 'POST' });
  return res.json();
}

// ------------------- Excel Helper Utilities -------------------

export function parseStudentsFromExcel(file: File): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawJson.length < 2) {
          return resolve([]);
        }

        // Detect header columns
        const headerRow = rawJson[0] as string[];
        let nameCol = -1;
        let codeCol = -1;
        let dobCol = -1;
        let genderCol = -1;
        let noteCol = -1;

        headerRow.forEach((col, idx) => {
          if (!col) return;
          const str = String(col).toLowerCase().trim();
          if (str.includes('tên') || str.includes('họ') || str.includes('name')) nameCol = idx;
          else if (str.includes('mã') || str.includes('code') || str.includes('stt')) codeCol = idx;
          else if (str.includes('sinh') || str.includes('ngày') || str.includes('dob')) dobCol = idx;
          else if (str.includes('tính') || str.includes('gender') || str.includes('nam/nữ')) genderCol = idx;
          else if (str.includes('chú') || str.includes('note')) noteCol = idx;
        });

        // Fallback default column indexes if header not recognized
        if (nameCol === -1) nameCol = 1;
        if (codeCol === -1) codeCol = 0;
        if (dobCol === -1) dobCol = 2;
        if (genderCol === -1) genderCol = 3;

        const students: Partial<Student>[] = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || !row[nameCol]) continue;

          const fullName = String(row[nameCol]).trim();
          if (!fullName) continue;

          const studentCode = row[codeCol] ? String(row[codeCol]).trim() : `HS-${Math.floor(1000 + Math.random() * 9000)}`;
          let birthDate = '2009-01-01';
          if (row[dobCol]) {
            const rawDob = String(row[dobCol]);
            if (rawDob.includes('/') || rawDob.includes('-')) {
              birthDate = rawDob;
            }
          }
          const rawGender = row[genderCol] ? String(row[genderCol]).toLowerCase() : 'nam';
          const gender: 'Nam' | 'Nữ' = rawGender.includes('nữ') || rawGender.includes('female') ? 'Nữ' : 'Nam';
          const notes = noteCol !== -1 && row[noteCol] ? String(row[noteCol]).trim() : '';

          students.push({
            fullName,
            studentCode,
            birthDate,
            gender,
            stars: 0,
            notes,
          });
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

export function downloadSampleExcelTemplate() {
  const wsData = [
    ['Mã học sinh', 'Họ và tên', 'Ngày sinh (YYYY-MM-DD)', 'Giới tính', 'Ghi chú'],
    ['HS10-01', 'Nguyễn Văn An', '2009-05-12', 'Nam', 'Tập trung, chăm chỉ'],
    ['HS10-02', 'Trần Thị Bình', '2009-08-24', 'Nữ', 'Lớp phó học tập'],
    ['HS10-03', 'Lê Hoàng Cường', '2009-11-03', 'Nam', 'Có năng khiếu toán hình'],
    ['HS10-04', 'Phạm Ngọc Diệp', '2009-02-18', 'Nữ', 'Tích cực phát biểu'],
    ['HS10-05', 'Vũ Tuấn Kiệt', '2009-09-30', 'Nam', 'Cần rèn luyện tính cẩn thận'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');
  XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_HAPPY_CLASS.xlsx');
}

// ----------------- QUESTION BANK & EXAM AUTHORING -----------------
export async function createBankQuestion(questionData: Partial<BankQuestion>): Promise<{ success: boolean; question: BankQuestion }> {
  const res = await fetch('/api/bank/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData),
  });
  if (!res.ok) throw new Error('Lỗi khi lưu câu hỏi vào ngân hàng');
  return res.json();
}

export async function updateBankQuestion(id: string, questionData: Partial<BankQuestion>): Promise<{ success: boolean; question: BankQuestion }> {
  const res = await fetch(`/api/bank/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData),
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật câu hỏi');
  return res.json();
}

export async function deleteBankQuestion(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/bank/questions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa câu hỏi');
  return res.json();
}

export async function assignQuestionsToHomework(params: {
  classId: string;
  questionIds: string[];
  title?: string;
  deadline?: string;
  description?: string;
  targetStudentIds?: string[];
}): Promise<{ success: boolean; homework: Homework }> {
  const res = await fetch('/api/bank/questions/assign-homework', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Lỗi khi giao bài tập cho lớp/học sinh');
  return res.json();
}

export async function createBankExam(examData: Partial<ExamBankItem>): Promise<{ success: boolean; exam: ExamBankItem }> {
  const res = await fetch('/api/bank/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(examData),
  });
  if (!res.ok) throw new Error('Lỗi khi lưu đề thi vào ngân hàng');
  return res.json();
}

export async function deleteBankExam(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/bank/exams/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Lỗi khi xóa đề thi');
  return res.json();
}

export async function publishBankExamToQuiz(examId: string, classId: string): Promise<{ success: boolean; quiz: Quiz }> {
  const res = await fetch(`/api/bank/exams/${examId}/publish-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId }),
  });
  if (!res.ok) throw new Error('Lỗi khi phát đề kiểm tra cho lớp');
  return res.json();
}

