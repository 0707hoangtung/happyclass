import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ExamBankItem, BankQuestion } from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import {
  FileCheck2,
  Plus,
  Trash2,
  Send,
  Clock,
  Award,
  BookOpen,
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const ExamBankView: React.FC = () => {
  const { state, createExam, removeExam, publishExamToClass, showToast, isStudent } = useApp();

  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState(state.teacher.subject || 'Toán học');
  const [examGrade, setExamGrade] = useState<number>(10);
  const [examDuration, setExamDuration] = useState<number>(45);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [examNote, setExamNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Publish to class modal
  const [publishingExam, setPublishingExam] = useState<ExamBankItem | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Delete modal
  const [examToDelete, setExamToDelete] = useState<ExamBankItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const bankExams = state.bankExams || [];
  const bankQuestions = state.bankQuestions || [];

  // Filter available questions by chosen subject/grade for the new exam
  const candidateQuestions = bankQuestions.filter(
    (q) => q.grade === examGrade && (q.subject.toLowerCase() === examSubject.toLowerCase() || !examSubject)
  );

  const toggleQuestionSelection = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const selectedQuestionsObjects = bankQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  const calculatedTotalPoints = selectedQuestionsObjects.reduce((acc, q) => acc + (q.points || 0), 0);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || selectedQuestionIds.length === 0) {
      showToast('Vui lòng nhập tên đề thi và chọn ít nhất 1 câu hỏi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await createExam({
        title: examTitle.trim(),
        subject: examSubject,
        grade: Number(examGrade),
        durationMinutes: Number(examDuration),
        totalPoints: Math.round(calculatedTotalPoints * 100) / 100 || 10,
        questionIds: selectedQuestionIds,
        note: examNote.trim(),
      });
      setIsNewExamModalOpen(false);
      setExamTitle('');
      setSelectedQuestionIds([]);
      setExamNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!publishingExam || !targetClassId) return;

    setIsPublishing(true);
    try {
      await publishExamToClass(publishingExam.id, targetClassId);
      setPublishingExam(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      await removeExam(examToDelete.id);
      setExamToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-rose-800" />
            <span>Ngân hàng đề thi & Khảo thí</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp các đề thi được tạo từ ngân hàng câu hỏi. Giáo viên có thể phát đề kiểm tra trực tuyến cho lớp bất cứ lúc nào.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewExamModalOpen(true);
            setTargetClassId(state.classes[0]?.id || '');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đề thi mới</span>
        </button>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bankExams.map((exam) => {
          const questionsCount = exam.questionIds.length;
          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                    Khối {exam.grade} · {exam.subject}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes} phút</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {exam.title}
                </h3>

                {exam.note && (
                  <p className="text-xs text-slate-500 line-clamp-2">{exam.note}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                  <span>Số câu: <strong className="text-slate-900">{questionsCount} câu</strong></span>
                  <span>·</span>
                  <span>Tổng điểm: <strong className="text-rose-900">{exam.totalPoints} đ</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setPublishingExam(exam);
                    setTargetClassId(state.classes[0]?.id || '');
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Phát cho lớp</span>
                </button>

                {!isStudent && (
                  <button
                    onClick={() => setExamToDelete(exam)}
                    className="p-2 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa đề thi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {bankExams.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Chưa có đề thi nào trong ngân hàng</h3>
          <p className="text-xs text-slate-400 mt-1">
            Bấm nút "Tạo đề thi mới" ở trên để chọn các câu hỏi đã soạn và tạo thành đề thi hoàn chỉnh.
          </p>
        </div>
      )}

      {/* Modal: Tạo đề thi mới */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-2xl overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#500c1e] to-[#6e142b] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Tạo đề thi mới từ ngân hàng câu hỏi</h3>
              </div>
              <button
                onClick={() => setIsNewExamModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiêu đề đề thi *
                  </label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="VD: Đề kiểm tra 1 tiết - Hàm số bậc hai"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời lượng (phút) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={examGrade}
                    onChange={(e) => setExamGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    {[10, 11, 12, 9, 8, 7, 6].map((g) => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Questions Selection Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700">
                    Chọn câu hỏi vào đề ({selectedQuestionIds.length} câu đã chọn - Tổng: {Math.round(calculatedTotalPoints * 100) / 100} điểm):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Hiển thị các câu hỏi thuộc Khối {examGrade}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50/60 p-1">
                  {candidateQuestions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-rose-50/80 border border-rose-200' : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestionSelection(q.id)}
                          className="mt-1 w-4 h-4 rounded text-rose-800 accent-rose-900 cursor-pointer"
                        />
                        <div className="flex-1 text-xs text-slate-800 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-900 bg-rose-100/70 px-1.5 py-0.5 rounded text-[10px]">
                              {q.lesson}
                            </span>
                            <span className="text-slate-500 text-[11px] font-medium">
                              {q.points} điểm · {q.type === 'multiple_choice' ? 'Trắc nghiệm ABCD' : q.type === 'true_false' ? 'Đúng/Sai' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận'}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-slate-700 font-sans">
                            {q.content}
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  {candidateQuestions.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Chưa có câu hỏi nào thuộc Khối {examGrade}. Thầy/Cô hãy soạn câu hỏi trước trong tab "Soạn câu hỏi" nhé.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú đề thi
                </label>
                <input
                  type="text"
                  value={examNote}
                  onChange={(e) => setExamNote(e.target.value)}
                  placeholder="VD: Kiểm tra định kỳ giữa học kỳ 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving || selectedQuestionIds.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu vào ngân hàng đề thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Phát đề thi cho lớp (Publish as Quiz) */}
      {publishingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-200" />
                <h3 className="font-bold text-sm">Phát đề kiểm tra trực tuyến cho lớp</h3>
              </div>
              <button
                onClick={() => setPublishingExam(null)}
                className="p-1 text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">{publishingExam.title}</p>
                <p className="text-slate-500 mt-0.5">
                  Thời lượng: {publishingExam.durationMinutes} phút · Số câu: {publishingExam.questionIds.length} câu
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn lớp học tiếp nhận đề thi:
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold cursor-pointer"
                >
                  {state.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Lớp {cls.name} (Khối {cls.grade} - {cls.subject})
                    </option>
                  ))}
                  {state.classes.length === 0 && (
                    <option value="">Chưa có lớp học nào</option>
                  )}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPublishingExam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isPublishing || !targetClassId}
                  onClick={handlePublishConfirm}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Đang phát đề...' : 'Xác nhận phát đề'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa đề thi</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Thầy/Cô có chắc chắn muốn xóa đề thi <strong className="text-rose-950 font-bold">{examToDelete.title}</strong> khỏi ngân hàng không?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setExamToDelete(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
