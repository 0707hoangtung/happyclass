import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem, Homework, Student } from '../../types/index.ts';
import {
  BookCheck,
  Plus,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  Filter,
  Check,
  X,
  Trophy,
  AlertCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const ClassHomeworkTab: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { state, createNewHomework, toggleStudentHomework, removeHomework, isStudent } = useApp();

  const homeworks = state.homeworks.filter((h) => h.classId === classItem.id);
  const students = state.students.filter((s) => s.classId === classItem.id);

  // Selected homework state (defaults to the first one)
  const [selectedHwId, setSelectedHwId] = useState<string>(() => {
    return homeworks[0]?.id || '';
  });

  const selectedHomework = homeworks.find((h) => h.id === selectedHwId) || homeworks[0];

  // Deleting homework confirmation modal
  const [hwToDelete, setHwToDelete] = useState<Homework | null>(null);
  const [isDeletingHw, setIsDeletingHw] = useState(false);

  const handleConfirmDeleteHw = async () => {
    if (!hwToDelete) return;
    setIsDeletingHw(true);
    try {
      await removeHomework(hwToDelete.id);
      if (selectedHwId === hwToDelete.id) {
        const remaining = homeworks.filter(h => h.id !== hwToDelete.id);
        setSelectedHwId(remaining[0]?.id || '');
      }
      setHwToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingHw(false);
    }
  };

  // Filter for students on right column: 'all' | 'completed' | 'pending'
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Modal create new homework
  const [isNewHwModalOpen, setIsNewHwModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTotalQuestions, setNewTotalQuestions] = useState(10);
  const [newDeadline, setNewDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newDescription, setNewDescription] = useState('Hoàn thành toàn bộ câu hỏi để đạt 1 Ngôi sao Hạnh phúc ⭐!');
  const [isSavingHw, setIsSavingHw] = useState(false);

  // Handle creating new homework
  const handleCreateHw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSavingHw(true);
    try {
      const created = await createNewHomework({
        classId: classItem.id,
        title: newTitle.trim(),
        subject: classItem.subject,
        deadline: `${newDeadline}T23:59:00Z`,
        totalQuestions: Number(newTotalQuestions) || 10,
        description: newDescription.trim(),
        starReward: 1, // Rule: Hoàn thành 1 bài tập = 1 sao
        questions: Array.from({ length: Number(newTotalQuestions) || 10 }, (_, i) => ({
          id: i + 1,
          content: `Bài tập vận dụng câu số ${i + 1}`,
        })),
      });
      setSelectedHwId(created.id);
      setIsNewHwModalOpen(false);
      setNewTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingHw(false);
    }
  };

  // Rank students by total stars for hierarchy badge
  const sortedStudentsByStars = [...students].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  const studentRankMap = new Map<string, number>();
  sortedStudentsByStars.forEach((st, idx) => {
    studentRankMap.set(st.id, idx + 1);
  });

  return (
    <div className="space-y-4">
      {/* Top Banner with Create Homework Action */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <BookCheck className="w-5 h-5 text-rose-800" />
            <span>Hệ thống bài tập & tiến độ tích lũy ngôi sao</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cột trái: Danh sách bài tập giáo viên giao · Cột phải: Học sinh đã/chưa hoàn thành & bảng xếp hạng sao
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => setIsNewHwModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Giao bài tập mới</span>
          </button>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ===================== CỘT BÊN TRÁI: DANH SÁCH BÀI TẬP ===================== */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 tracking-wider">
              Bài tập bộ môn giao ({homeworks.length})
            </span>
            <span className="text-[11px] text-slate-400">Bấm để xem tiến độ</span>
          </div>

          <div className="space-y-3">
            {homeworks.map((hw) => {
              const isSelected = selectedHomework?.id === hw.id;

              // Calculate completions for this homework
              const submissions = state.homeworkSubmissions.filter((s) => s.homeworkId === hw.id);
              const completedCount = submissions.filter((s) => s.isCompleted).length;
              const totalStudents = students.length || 1;
              const percentage = Math.round((completedCount / totalStudents) * 100);

              return (
                <div
                  key={hw.id}
                  onClick={() => setSelectedHwId(hw.id)}
                  className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/40 border-rose-800 shadow-sm ring-2 ring-rose-800/20'
                      : 'bg-white border-rose-100/90 hover:border-rose-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                        {hw.subject}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug line-clamp-2">
                        {hw.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>+1 sao</span>
                      </div>

                      {/* Nút xóa bài tập: chỉ hiển thị với giáo viên, ẩn với học sinh */}
                      {!isStudent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHwToDelete(hw);
                          }}
                          title="Xóa bài tập này"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{hw.description}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn: {new Date(hw.deadline).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {hw.totalQuestions} câu hỏi
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Đã nộp: <strong className="text-slate-800 tabular-nums">{completedCount}/{students.length}</strong></span>
                      <span className="font-semibold text-emerald-700 tabular-nums">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {homeworks.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <BookCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Chưa có bài tập nào</p>
                <p className="text-xs text-slate-400 mt-1">Bấm nút "Giao bài tập mới" để giao bài cho lớp.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===================== CỘT BÊN PHẢI: DANH SÁCH HỌC SINH HOÀN THÀNH ===================== */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-rose-100/90 shadow-2xs overflow-hidden">
          {selectedHomework ? (
            <div>
              {/* Header Right Column */}
              <div className="p-4 sm:p-5 border-b border-rose-100 bg-[#FDF8F9]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-rose-900 tracking-wider">
                      Chi tiết tiến độ học sinh
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedHomework.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Học sinh hoàn thành đủ {selectedHomework.totalQuestions}/{selectedHomework.totalQuestions} câu sẽ được thưởng 1 ngôi sao cộng dồn.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {!isStudent && (
                      <button
                        type="button"
                        onClick={() => setHwToDelete(selectedHomework)}
                        title="Xóa bài tập này"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xóa bài tập</span>
                      </button>
                    )}

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-100">
                      <button
                        onClick={() => setCompletionFilter('all')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          completionFilter === 'all'
                            ? 'bg-rose-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tất cả ({students.length})
                      </button>
                      <button
                        onClick={() => setCompletionFilter('completed')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          completionFilter === 'completed'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Đã xong
                      </button>
                      <button
                        onClick={() => setCompletionFilter('pending')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          completionFilter === 'pending'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Chưa xong
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Completion List */}
              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {students
                  .filter((st) => {
                    const sub = state.homeworkSubmissions.find(
                      (s) => s.homeworkId === selectedHomework.id && s.studentId === st.id
                    );
                    const isCompleted = sub?.isCompleted || false;
                    if (completionFilter === 'completed') return isCompleted;
                    if (completionFilter === 'pending') return !isCompleted;
                    return true;
                  })
                  .map((st) => {
                    const sub = state.homeworkSubmissions.find(
                      (s) => s.homeworkId === selectedHomework.id && s.studentId === st.id
                    );
                    const isCompleted = sub?.isCompleted || false;
                    const completedQuestions = sub?.completedQuestions ?? (isCompleted ? selectedHomework.totalQuestions : 0);
                    const rank = studentRankMap.get(st.id) || 1;

                    return (
                      <div
                        key={st.id}
                        className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors ${
                          isCompleted ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        {/* Student Name & Rank */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank indicator badge */}
                          <div
                            title={`Thứ hạng ${rank} toàn LỚP`}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs ${
                              rank === 1
                                ? 'bg-amber-400 text-rose-950 ring-1 ring-amber-300'
                                : rank === 2
                                ? 'bg-slate-300 text-slate-800'
                                : rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rank}
                          </div>

                          <div className="min-w-0 truncate">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {st.fullName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>Mã: {st.studentCode}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                {st.stars || 0} sao tích lũy
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Completion Status & Questions Done & Quick Toggle */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Questions count badge */}
                          <div className="text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold tabular-nums ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {completedQuestions}/{selectedHomework.totalQuestions} câu
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5 text-right font-medium">
                              {isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                            </p>
                          </div>

                          {/* Quick Toggle Action Button */}
                          <button
                            onClick={() =>
                              toggleStudentHomework(
                                selectedHomework.id,
                                st.id,
                                !isCompleted,
                                !isCompleted ? selectedHomework.totalQuestions : 0,
                                selectedHomework.totalQuestions
                              )
                            }
                            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              isCompleted
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                            }`}
                            title={isCompleted ? 'Bấm để hủy hoàn thành' : 'Bấm để xác nhận hoàn thành'}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Hoàn tất</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Duyệt xong</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <BookCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Hãy chọn hoặc tạo một bài tập ở cột bên trái</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Giao bài tập mới */}
      {isNewHwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Giao bài tập mới cho lớp</h3>
              <button
                onClick={() => setIsNewHwModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHw} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề bài tập *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bài tập tuần 8 - Vectơ & Hệ thức lượng..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tổng số câu hỏi
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newTotalQuestions}
                    onChange={(e) => setNewTotalQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạn nộp bài
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả / Hướng dẫn học sinh
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                <span>
                  Quy chế: Học sinh hoàn thành toàn bộ câu hỏi sẽ nhận <strong>1 Ngôi sao Hạnh phúc ⭐</strong> tích lũy cộng dồn để xếp hạng!
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewHwModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingHw}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSavingHw ? 'Đang lưu...' : 'Giao bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa Bài Tập */}
      {hwToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 mx-auto mb-4 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">
              Xác nhận xóa bài tập
            </h3>

            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa bài tập <strong className="text-rose-950 font-semibold">"{hwToDelete.title}"</strong> khỏi lớp <span className="font-semibold text-slate-900">{classItem.name}</span>?
            </p>

            <div className="mt-4 p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong>Cảnh báo:</strong> Thao tác này sẽ xóa bài tập và toàn bộ dữ liệu làm bài, ngôi sao tích lũy của học sinh cho bài tập này. Thao tác không thể hoàn tác.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingHw}
                onClick={() => setHwToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingHw}
                onClick={handleConfirmDeleteHw}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingHw ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
