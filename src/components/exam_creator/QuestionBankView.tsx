import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BankQuestion, QuestionType, QuestionLevel, ClassItem, Student } from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Send,
  BookCheck,
  CheckCircle2,
  Sparkles,
  Award,
  AlertTriangle,
  X,
  Users,
  Calendar,
} from 'lucide-react';

interface QuestionBankViewProps {
  onEditQuestion: (question: BankQuestion) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ onEditQuestion }) => {
  const { state, removeQuestion, assignQuestionsToClass, showToast, isStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState<'all' | number>('all');
  const [selectedType, setSelectedType] = useState<'all' | QuestionType>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | QuestionLevel>('all');

  // Delete confirmation
  const [questionToDelete, setQuestionToDelete] = useState<BankQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assign modal state
  const [assigningQuestion, setAssigningQuestion] = useState<BankQuestion | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assignMode, setAssignMode] = useState<'entire_class' | 'specific_students'>('entire_class');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDeadline, setHwDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [hwDescription, setHwDescription] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const bankQuestions = state.bankQuestions || [];

  // Filtered questions
  const filteredQuestions = bankQuestions.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.lesson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || q.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || q.grade === Number(selectedGrade);
    const matchesType = selectedType === 'all' || q.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || q.level === selectedLevel;
    return matchesSearch && matchesSubject && matchesGrade && matchesType && matchesLevel;
  });

  // Unique subjects for filter
  const subjects = Array.from(new Set(bankQuestions.map((q) => q.subject).filter(Boolean)));

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await removeQuestion(questionToDelete.id);
      setQuestionToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAssignModal = (q: BankQuestion) => {
    setAssigningQuestion(q);
    const defaultClass = state.classes[0]?.id || '';
    setSelectedClassId(defaultClass);
    setAssignMode('entire_class');
    setSelectedStudentIds([]);
    setHwTitle(`Bài tập: ${q.lesson}`);
    setHwDescription(`Yêu cầu học sinh hoàn thành câu hỏi về chủ đề ${q.lesson}.`);
  };

  const handleConfirmAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningQuestion || !selectedClassId) return;

    setIsAssigning(true);
    try {
      await assignQuestionsToClass({
        classId: selectedClassId,
        questionIds: [assigningQuestion.id],
        title: hwTitle.trim() || `Bài tập: ${assigningQuestion.lesson}`,
        deadline: hwDeadline,
        description: hwDescription.trim(),
        targetStudentIds: assignMode === 'specific_students' ? selectedStudentIds : undefined,
      });
      setAssigningQuestion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Get students of the currently selected class in Assign modal
  const classStudents = state.students.filter((s) => s.classId === selectedClassId);

  const toggleStudentSelection = (stId: string) => {
    if (selectedStudentIds.includes(stId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== stId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, stId]);
    }
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(classStudents.map((s) => s.id));
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const getLevelBadge = (level: QuestionLevel) => {
    switch (level) {
      case 'nhan_biet':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">Nhận biết</span>;
      case 'thong_hieu':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">Thông hiểu</span>;
      case 'van_dung_thap':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">Vận dụng thấp</span>;
      case 'van_dung_cao':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold">Vận dụng cao</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi theo nội dung, bài học, môn học..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
            />
          </div>

          <div className="text-xs font-bold text-slate-600 self-end sm:self-auto shrink-0">
            Tổng cộng: <strong className="text-rose-900">{filteredQuestions.length}</strong> / {bankQuestions.length} câu hỏi
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </span>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="all">Tất cả khối lớp</option>
            {[10, 11, 12, 9, 8, 7, 6].map((g) => (
              <option key={g} value={g}>Lớp {g}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="all">Tất cả dạng câu hỏi</option>
            <option value="multiple_choice">Trắc nghiệm ABCD</option>
            <option value="true_false">Trắc nghiệm Đúng / Sai</option>
            <option value="short_answer">Trả lời ngắn</option>
            <option value="essay">Tự luận</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none cursor-pointer text-xs"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="nhan_biet">Nhận biết</option>
            <option value="thong_hieu">Thông hiểu</option>
            <option value="van_dung_thap">Vận dụng thấp</option>
            <option value="van_dung_cao">Vận dụng cao</option>
          </select>
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-all p-5 space-y-4"
          >
            {/* Header of Question Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  Câu {idx + 1}
                </span>
                <span className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                  {q.subject} · Khối {q.grade}
                </span>
                <span className="font-semibold text-slate-800 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {q.lesson}
                </span>
                {getLevelBadge(q.level)}
                <span className="text-slate-500 font-medium">
                  {q.type === 'multiple_choice' && 'Trắc nghiệm ABCD'}
                  {q.type === 'true_false' && 'Đúng/Sai (4 ý)'}
                  {q.type === 'short_answer' && 'Trả lời ngắn'}
                  {q.type === 'essay' && 'Tự luận'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => handleOpenAssignModal(q)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                  title="Giao câu hỏi này làm bài tập cho lớp hoặc từng học sinh"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Giao bài tập</span>
                </button>

                <button
                  onClick={() => onEditQuestion(q)}
                  className="p-1.5 text-slate-500 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Chỉnh sửa câu hỏi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {!isStudent && (
                  <button
                    onClick={() => setQuestionToDelete(q)}
                    className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa câu hỏi khỏi ngân hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question Content */}
            <div className="text-slate-900 text-sm leading-relaxed">
              <MathRenderer content={q.content} />
            </div>

            {/* Image if available */}
            {q.imageUrl && (
              <div className="p-2 border border-slate-100 rounded-xl bg-slate-50 text-center max-w-md">
                <img
                  src={q.imageUrl}
                  alt="Hình minh họa"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              </div>
            )}

            {/* Options ABCD preview */}
            {q.type === 'multiple_choice' && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correctOptionIndex === oIdx;
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {letters[oIdx]}
                      </span>
                      <div className="flex-1 pt-0.5">
                        <MathRenderer content={opt} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True / False 4 sub-questions preview */}
            {q.type === 'true_false' && q.subQuestions && (
              <div className="space-y-1.5 pt-1 text-xs">
                {q.subQuestions.map((sub, sIdx) => (
                  <div
                    key={sub.id || sIdx}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-bold text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                        {sub.label || `${String.fromCharCode(97 + sIdx)})`}
                      </span>
                      <div className="flex-1 pt-0.5 text-slate-800">
                        <MathRenderer content={sub.text} />
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                      sub.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sub.isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Short Answer Preview */}
            {q.type === 'short_answer' && (
              <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Đáp án chuẩn: <strong className="text-emerald-800 font-bold">{q.shortAnswerCorrect}</strong></span>
                {q.shortAnswerTolerance && <span>Sai số: ±{q.shortAnswerTolerance}</span>}
              </div>
            )}

            {/* Explanation Preview if available */}
            {q.explanation && (
              <div className="text-xs p-3 bg-[#FDF8F9] border border-rose-100 rounded-xl text-slate-700">
                <span className="font-bold text-rose-900 block mb-1">Lời giải chi tiết:</span>
                <MathRenderer content={q.explanation} />
              </div>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">Chưa có câu hỏi nào trong ngân hàng</h3>
            <p className="text-xs text-slate-400 mt-1">
              Thầy/Cô hãy chuyển qua tab "Soạn câu hỏi" để bắt đầu soạn và lưu câu hỏi vào ngân hàng nhé!
            </p>
          </div>
        )}
      </div>

      {/* Delete Question Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa câu hỏi</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Thầy/Cô có chắc chắn muốn xóa câu hỏi về bài <strong className="text-rose-950 font-bold">{questionToDelete.lesson}</strong> khỏi ngân hàng không?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setQuestionToDelete(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
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

      {/* Modal: Giao bài tập cho Lớp hoặc Từng học sinh cụ thể */}
      {assigningQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-200" />
                <h3 className="font-bold text-sm">Giao câu hỏi thành bài tập về nhà</h3>
              </div>
              <button
                onClick={() => setAssigningQuestion(null)}
                className="p-1 text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Question summary badge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Câu hỏi được chọn:</span>
                <p className="line-clamp-2 text-slate-600">{assigningQuestion.content}</p>
              </div>

              {/* Class selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn lớp học tiếp nhận bài tập *
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold cursor-pointer"
                >
                  {state.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Lớp {cls.name} (Khối {cls.grade} - {cls.subject})
                    </option>
                  ))}
                  {state.classes.length === 0 && (
                    <option value="">Chưa có lớp học nào trong hệ thống</option>
                  )}
                </select>
              </div>

              {/* Assignment scope: Entire Class vs Specific Students */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Đối tượng giao bài:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignMode('entire_class')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      assignMode === 'entire_class'
                        ? 'bg-rose-900 text-white border-rose-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Toàn bộ lớp ({classStudents.length} học sinh)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignMode('specific_students')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      assignMode === 'specific_students'
                        ? 'bg-rose-900 text-white border-rose-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Giao riêng cho từng học sinh</span>
                  </button>
                </div>
              </div>

              {/* If specific students selected, show student selection list */}
              {assignMode === 'specific_students' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Chọn học sinh ({selectedStudentIds.length}/{classStudents.length} đã chọn):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="text-[11px] text-rose-900 font-semibold hover:underline cursor-pointer"
                      >
                        Chọn tất cả
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={deselectAllStudents}
                        className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                    {classStudents.map((st) => (
                      <label
                        key={st.id}
                        className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg text-xs cursor-pointer select-none"
                      >
                        <span className="font-medium text-slate-800">
                          {st.fullName} ({st.studentCode})
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(st.id)}
                          onChange={() => toggleStudentSelection(st.id)}
                          className="w-4 h-4 rounded text-rose-800 focus:ring-rose-800 accent-rose-900 cursor-pointer"
                        />
                      </label>
                    ))}
                    {classStudents.length === 0 && (
                      <p className="text-xs text-slate-400 py-2 text-center">
                        Lớp này chưa có danh sách học sinh.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Title & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiêu đề bài tập *
                  </label>
                  <input
                    type="text"
                    required
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạn nộp bài *
                  </label>
                  <input
                    type="date"
                    required
                    value={hwDeadline}
                    onChange={(e) => setHwDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả / Hướng dẫn
                </label>
                <textarea
                  rows={2}
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningQuestion(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedClassId || (assignMode === 'specific_students' && selectedStudentIds.length === 0)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAssigning ? 'Đang giao bài...' : 'Xác nhận giao bài'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
