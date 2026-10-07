import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem, Quiz, QuizQuestion, QuizSubmission } from '../../types/index.ts';
import {
  FileCheck2,
  Plus,
  Play,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const ClassQuizzesTab: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { state, createNewQuiz, removeQuiz, submitQuiz, showToast, isStudent } = useApp();

  const quizzes = state.quizzes.filter((q) => q.classId === classItem.id);
  const students = state.students.filter((s) => s.classId === classItem.id);

  // Selected quiz
  const [selectedQuizId, setSelectedQuizId] = useState<string>(() => quizzes[0]?.id || '');
  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];

  // Online Test Mode (Simulate student taking the test)
  const [isTestTakingMode, setIsTestTakingMode] = useState<boolean>(false);
  const [selectedStudentForTest, setSelectedStudentForTest] = useState<string>(() => students[0]?.id || '');
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [testTimeLeft, setTestTimeLeft] = useState<number>(45 * 60);
  const [isSubmittingTest, setIsSubmittingTest] = useState<boolean>(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<QuizSubmission | null>(null);

  // Modal create quiz
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(45);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

  // Deleting quiz modal
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  const handleConfirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeletingQuiz(true);
    try {
      await removeQuiz(quizToDelete.id);
      if (selectedQuizId === quizToDelete.id) {
        const remaining = quizzes.filter(q => q.id !== quizToDelete.id);
        setSelectedQuizId(remaining[0]?.id || '');
      }
      setQuizToDelete(null);
      showToast('Đã xóa đề kiểm tra thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa đề kiểm tra', 'error');
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  // Submissions for the selected quiz
  const submissionsForQuiz = state.quizSubmissions.filter((s) => s.quizId === selectedQuiz?.id);

  // Start test taking mode
  const handleStartTest = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
    setTestAnswers({});
    setLastSubmissionResult(null);
    setTestTimeLeft(quiz.durationMinutes * 60);
    setIsTestTakingMode(true);
  };

  // Submit test and get auto-grade
  const handleSubmitTest = async () => {
    if (!selectedQuiz || !selectedStudentForTest) {
      showToast('Vui lòng chọn học sinh làm bài thi', 'error');
      return;
    }

    setIsSubmittingTest(true);
    try {
      const res = await submitQuiz(selectedQuiz.id, selectedStudentForTest, testAnswers);
      setLastSubmissionResult(res.submission);
      setIsTestTakingMode(false);
    } catch (err: any) {
      showToast('Lỗi khi nộp bài: ' + (err.message || 'Lỗi mạng'), 'error');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // Create new quiz with MOET format
  const handleCreateNewQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    setIsSavingQuiz(true);
    try {
      const sampleQuestions: QuizQuestion[] = [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'Hàm số y = -2x^2 + 4x + 1 đồng biến trên khoảng nào dưới đây?',
          options: ['(-∞; 1)', '(1; +∞)', '(-∞; 2)', '(2; +∞)'],
          correctAnswer: 0,
          points: 1.0,
          explanation: 'a = -2 < 0, đỉnh x = -b/(2a) = 1. Hàm số đồng biến trên (-∞; 1).',
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'Cho tam giác đều ABC cạnh 2a. Tích vô hướng của vectơ AB và AC bằng:',
          options: ['2a²', 'a²', '4a²', 'a²√3'],
          correctAnswer: 0,
          points: 1.0,
          explanation: 'AB . AC = |AB| * |AC| * cos(60°) = 2a * 2a * 1/2 = 2a².',
        },
        {
          id: 3,
          type: 'true_false',
          question: 'Xét tính Đúng/Sai của các mệnh đề sau theo quy chế Bộ GD&ĐT:',
          points: 4.0,
          subQuestions: [
            { id: 'a', text: 'Tập rỗng là con của mọi tập hợp.', correctAnswer: true },
            { id: 'b', text: 'Mọi số nguyên tố đều là số lẻ.', correctAnswer: false },
            { id: 'c', text: 'Hệ phương trình bậc nhất hai ẩn có thể vô số nghiệm.', correctAnswer: true },
            { id: 'd', text: 'Vectơ không cùng phương với mọi vectơ.', correctAnswer: true },
          ],
          explanation: 'Chuẩn chấm tự động Bộ GD: đúng 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, đúng cả 4 ý = 1.0đ (nhân hệ số câu).',
        },
        {
          id: 4,
          type: 'multiple_choice',
          question: 'Tìm giá trị lớn nhất của biểu thức P = -x² + 6x - 5 trên đoạn [0; 4]:',
          options: ['4', '3', '5', '0'],
          correctAnswer: 0,
          points: 2.0,
          explanation: 'Đỉnh x = 3 thuộc đoạn [0; 4], P(3) = -9 + 18 - 5 = 4.',
        },
        {
          id: 5,
          type: 'multiple_choice',
          question: 'Khoảng cách giữa hai điểm A(1; 3) và B(4; 7) trong mặt phẳng tọa độ Oxy là:',
          options: ['5', '7', 'sqrt(13)', '25'],
          correctAnswer: 0,
          points: 2.0,
          explanation: 'AB = sqrt((4-1)^2 + (7-3)^2) = sqrt(9 + 16) = 5.',
        },
      ];

      await createNewQuiz({
        classId: classItem.id,
        title: quizTitle.trim(),
        durationMinutes: Number(quizDuration) || 45,
        totalPoints: 10,
        standard: 'MOET_STANDARD',
        questions: sampleQuestions,
      });

      setIsCreateQuizModalOpen(false);
      setQuizTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Action Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-900 tracking-wider">
              Khảo thí & đánh giá năng lực
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Chấm điểm tự động theo chuẩn BGD
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Hệ thống đề kiểm tra trực tuyến lớp {classItem.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động chấm thang điểm 10 theo đúng quy chế hiện hành của Bộ Giáo dục & Đào tạo ngay khi học sinh hoàn thành bài làm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedQuiz && (
            <button
              onClick={() => handleStartTest(selectedQuiz)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Làm bài thi online (Chế độ học sinh)</span>
            </button>
          )}

          {!isStudent && (
            <button
              onClick={() => setIsCreateQuizModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề kiểm tra</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Last Submission Score Popup / Banner */}
      {lastSubmissionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {lastSubmissionResult.score}
            </div>
            <div>
              <p className="text-sm font-bold">
                Học sinh <strong>{lastSubmissionResult.studentName}</strong> đã hoàn thành bài kiểm tra!
              </p>
              <p className="text-xs text-emerald-800">
                Hệ thống tự động chấm: <strong>{lastSubmissionResult.score}/10 điểm</strong> · Xếp loại: <strong>{lastSubmissionResult.status}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastSubmissionResult(null)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            Đóng thông báo
          </button>
        </div>
      )}

      {/* 3. Quiz Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Quiz Selector Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-700 tracking-wider px-1">
            Đề kiểm tra ({quizzes.length})
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => {
              const isSelected = selectedQuiz?.id === q.id;
              const subCount = state.quizSubmissions.filter((s) => s.quizId === q.id).length;

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuizId(q.id);
                    setIsTestTakingMode(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FDF8F9] to-white border-rose-800 shadow-sm ring-2 ring-rose-800/10'
                      : 'bg-white border-rose-100 hover:border-rose-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                      Chuẩn BGD 2025
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {q.durationMinutes} phút
                      </span>
                      {!isStudent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuizToDelete(q);
                          }}
                          title="Xóa đề kiểm tra này"
                          className="p-1 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                    {q.title}
                  </h4>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{q.questions.length} câu hỏi trắc nghiệm</span>
                    <span className="font-semibold text-slate-800">
                      Đã nộp: {subCount}/{students.length}
                    </span>
                  </div>
                </div>
              );
            })}

            {quizzes.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Chưa có đề kiểm tra nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quiz Questions / Online Test Taking / Scoreboard */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden">
          {selectedQuiz ? (
            <div>
              {/* If Test Taking Mode is Active */}
              {isTestTakingMode ? (
                <div className="p-6 space-y-6">
                  {/* Test Header */}
                  <div className="p-4 bg-gradient-to-r from-[#5c0e22] to-[#7a1832] text-white rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-xs text-amber-300 font-bold">
                        Chế độ làm bài thi online
                      </span>
                      <h3 className="font-bold text-base mt-0.5">{selectedQuiz.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <label className="text-[10px] text-rose-200 block">Thí sinh làm bài:</label>
                        <select
                          value={selectedStudentForTest}
                          onChange={(e) => setSelectedStudentForTest(e.target.value)}
                          className="text-xs font-bold bg-white text-slate-900 rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                          {students.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.fullName} ({st.studentCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => setIsTestTakingMode(false)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List of Questions for student to answer */}
                  <div className="space-y-6">
                    {selectedQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            <span className="text-rose-900 font-extrabold mr-1.5">Câu {idx + 1}:</span>
                            {q.question}
                          </h4>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-900 shrink-0">
                            {q.points} điểm
                          </span>
                        </div>

                        {/* Multiple Choice Options */}
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt, optIdx) => {
                              const isChecked = testAnswers[q.id] === optIdx;
                              const letters = ['A', 'B', 'C', 'D'];
                              return (
                                <button
                                  type="button"
                                  key={optIdx}
                                  onClick={() =>
                                    setTestAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                  }
                                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                                    isChecked
                                      ? 'bg-rose-900 text-white border-rose-900 shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                      isChecked
                                        ? 'bg-amber-400 text-rose-950'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {letters[optIdx]}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* True / False Sub-Questions (MOET Format 2025) */}
                        {q.type === 'true_false' && q.subQuestions && (
                          <div className="space-y-2 mt-2">
                            <p className="text-xs text-slate-500 italic">
                              Học sinh chọn Đúng hoặc Sai cho từng ý a), b), c), d):
                            </p>
                            {q.subQuestions.map((sub) => {
                              const currentSubVal = testAnswers[q.id]?.[sub.id];
                              return (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                                >
                                  <span className="font-medium text-slate-800 pr-3">
                                    <strong>{sub.id})</strong> {sub.text}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTestAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: { ...(prev[q.id] || {}), [sub.id]: true },
                                        }));
                                      }}
                                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                        currentSubVal === true
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTestAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: { ...(prev[q.id] || {}), [sub.id]: false },
                                        }));
                                      }}
                                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                        currentSubVal === false
                                          ? 'bg-rose-600 text-white shadow-2xs'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      Sai
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Test Button */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Hệ thống tự động chấm điểm ngay sau khi nộp bài
                    </span>
                    <button
                      onClick={handleSubmitTest}
                      disabled={isSubmittingTest}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmittingTest ? 'Đang chấm điểm...' : 'NỘP BÀI THI & CHẤM ĐIỂM NGAY'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Mode: Show Quiz Overview & Student Scoreboard */
                <div>
                  <div className="p-5 border-b border-rose-100 bg-[#FDF8F9]">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-rose-900">
                          Chi tiết đề kiểm tra & kết quả tự động chấm
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {selectedQuiz.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Quy chế chấm: Thang 10 điểm · Thời lượng: {selectedQuiz.durationMinutes} phút · Định dạng: {selectedQuiz.standard}
                        </p>
                      </div>

                      <button
                        onClick={() => handleStartTest(selectedQuiz)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Làm thử đề thi</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Scoreboard for this Quiz */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 tracking-wider">
                        Bảng điểm tự động ({submissionsForQuiz.length} bài đã nộp)
                      </h4>
                      <span className="text-xs text-slate-400">
                        Chuẩn chấm tự động MOET
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">STT</th>
                            <th className="py-2.5 px-3">Học sinh</th>
                            <th className="py-2.5 px-3">Thời gian nộp</th>
                            <th className="py-2.5 px-3 text-center">Điểm số / 10</th>
                            <th className="py-2.5 px-3">Xếp loại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {submissionsForQuiz.map((sub, i) => (
                            <tr key={sub.id} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 font-semibold text-slate-500">{i + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{sub.studentName}</td>
                              <td className="py-2 px-3 text-slate-500">
                                {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-lg font-extrabold text-xs tabular-nums ${
                                    sub.score >= 8.0
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : sub.score >= 5.0
                                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {sub.score}/10
                                </span>
                              </td>
                              <td className="py-2 px-3 font-semibold">
                                <span
                                  className={
                                    sub.status === 'Đạt'
                                      ? 'text-emerald-700'
                                      : 'text-rose-700'
                                  }
                                >
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {submissionsForQuiz.length === 0 && (
                      <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                        <p className="text-xs">Chưa có học sinh nào nộp bài thi này.</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Bấm nút "Làm bài thi online" ở trên để học sinh làm bài và xem hệ thống chấm điểm tự động tức thì.
                        </p>
                      </div>
                    )}

                    {/* Preview of Questions in this Exam */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 tracking-wider mb-3">
                        Nội dung câu hỏi trong đề ({selectedQuiz.questions.length} câu)
                      </h4>
                      <div className="space-y-3">
                        {selectedQuiz.questions.map((q, idx) => (
                          <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900">
                                Câu {idx + 1}: {q.question}
                              </span>
                              <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                                {q.points} điểm
                              </span>
                            </div>
                            {q.explanation && (
                              <p className="text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200/60">
                                <strong>Đáp án & Hướng dẫn chấm:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal: Tạo đề kiểm tra mới */}
      {isCreateQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tạo đề kiểm tra mới</h3>
              <button
                onClick={() => setIsCreateQuizModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewQuiz} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên bài kiểm tra *
                </label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 15 phút - Vectơ trong không gian..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời lượng làm bài (phút)
                </label>
                <select
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                >
                  <option value={15}>15 phút</option>
                  <option value={45}>45 phút (1 tiết)</option>
                  <option value={60}>60 phút</option>
                  <option value={90}>90 phút (Học kỳ / THPT)</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-800" />
                  Quy chế chấm điểm tự động:
                </p>
                <p className="text-[11px] text-slate-600">
                  Hệ thống tự động nạp cấu trúc chuẩn Bộ GD&ĐT 2025 gồm: Trắc nghiệm 4 lựa chọn, Trắc nghiệm Đúng/Sai đa ý và Tự luận trả lời ngắn. Tự động chấm ngay khi học sinh nộp bài.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateQuizModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuiz}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSavingQuiz ? 'Đang tạo...' : 'Tạo đề thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Xác nhận Xóa Đề Kiểm Tra */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 mx-auto mb-4 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">
              Xác nhận xóa đề kiểm tra
            </h3>

            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Thầy/Cô có chắc chắn muốn xóa đề kiểm tra <strong className="text-rose-950 font-semibold">"{quizToDelete.title}"</strong> khỏi lớp <span className="font-semibold text-slate-900">{classItem.name}</span> không?
            </p>

            <div className="mt-4 p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong>Cảnh báo:</strong> Thao tác này sẽ xóa đề kiểm tra cùng toàn bộ kết quả bài nộp của học sinh. Thao tác không thể hoàn tác.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingQuiz}
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingQuiz}
                onClick={handleConfirmDeleteQuiz}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingQuiz ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
