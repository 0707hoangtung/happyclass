import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BankQuestion, QuestionType, QuestionLevel, SubQuestionItem } from '../../types/index.ts';
import {
  FileEdit,
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface QuestionEditorPanelProps {
  question: Partial<BankQuestion>;
  onChange: (updated: Partial<BankQuestion>) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export const QuestionEditorPanel: React.FC<QuestionEditorPanelProps> = ({
  question,
  onChange,
  onSave,
  onReset,
  isSaving,
  isEditing,
}) => {
  const { isStudent } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle image upload from local file
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange({ ...question, imageUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const handleTypeChange = (newType: QuestionType) => {
    let defaultPoints = question.points ?? 1.0;
    if (newType === 'multiple_choice') defaultPoints = 0.25;
    else if (newType === 'true_false') defaultPoints = 1.0;
    else if (newType === 'short_answer') defaultPoints = 0.5;
    else if (newType === 'essay') defaultPoints = 2.0;

    let subQuestions: SubQuestionItem[] | undefined = undefined;
    if (newType === 'true_false') {
      subQuestions = [
        { id: 'a', label: 'a)', text: '', isCorrect: true },
        { id: 'b', label: 'b)', text: '', isCorrect: false },
        { id: 'c', label: 'c)', text: '', isCorrect: true },
        { id: 'd', label: 'd)', text: '', isCorrect: false },
      ];
    }

    onChange({
      ...question,
      type: newType,
      points: defaultPoints,
      subQuestions: subQuestions || question.subQuestions,
      options: newType === 'multiple_choice' ? (question.options || ['', '', '', '']) : question.options,
      correctOptionIndex: newType === 'multiple_choice' ? (question.correctOptionIndex ?? 0) : question.correctOptionIndex,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#500c1e] to-[#6e142b] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-amber-300" />
          <h3 className="font-bold text-sm">
            {isEditing ? 'Chỉnh sửa câu hỏi trong ngân hàng' : 'Soạn câu hỏi mới'}
          </h3>
        </div>
        {isEditing && (
          <span className="text-xs bg-amber-400 text-rose-950 font-bold px-2 py-0.5 rounded-md">
            Đang sửa
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
        {/* Row 1: Môn học, Khối lớp, Bài học/Chủ đề */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Môn học *
            </label>
            <input
              type="text"
              required
              value={question.subject || ''}
              onChange={(e) => onChange({ ...question, subject: e.target.value })}
              placeholder="Nhập tên môn học..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Khối lớp *
            </label>
            <select
              value={question.grade || 10}
              onChange={(e) => onChange({ ...question, grade: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 cursor-pointer"
            >
              {[10, 11, 12, 9, 8, 7, 6].map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bài học / Chủ đề *
            </label>
            <input
              type="text"
              required
              value={question.lesson || ''}
              onChange={(e) => onChange({ ...question, lesson: e.target.value })}
              placeholder="Nhập tên bài học / chủ đề..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
            />
          </div>
        </div>

        {/* Row 2: Dạng câu hỏi, Mức độ kiến thức, Điểm số */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dạng câu hỏi (Chuẩn BGD) *
            </label>
            <select
              value={question.type || 'multiple_choice'}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 cursor-pointer font-medium"
            >
              <option value="multiple_choice">Trắc nghiệm ABCD (4 lựa chọn)</option>
              <option value="true_false">Trắc nghiệm Đúng / Sai (4 ý chuẩn BGD)</option>
              <option value="short_answer">Trắc nghiệm trả lời ngắn</option>
              <option value="essay">Tự luận</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mức độ kiến thức *
            </label>
            <select
              value={question.level || 'thong_hieu'}
              onChange={(e) => onChange({ ...question, level: e.target.value as QuestionLevel })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 cursor-pointer font-medium"
            >
              <option value="nhan_biet">Nhận biết</option>
              <option value="thong_hieu">Thông hiểu</option>
              <option value="van_dung_thap">Vận dụng thấp</option>
              <option value="van_dung_cao">Vận dụng cao</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Điểm số {question.type === 'true_false' ? '(Chuẩn BGD: 1.0 đ)' : '*'}
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="10"
              value={question.points ?? 1.0}
              onChange={(e) => onChange({ ...question, points: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 font-bold"
            />
          </div>
        </div>

        {/* Nội dung đề bài */}
        <div>
          <div className="mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Nội dung câu hỏi *
            </label>
          </div>
          <textarea
            rows={4}
            required
            value={question.content || ''}
            onChange={(e) => onChange({ ...question, content: e.target.value })}
            placeholder="Nhập nội dung câu hỏi..."
            className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 font-sans leading-relaxed"
          />
        </div>

        {/* Chèn hình ảnh / Đồ thị / Bảng biến thiên */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-800" />
              <span>Hình ảnh đồ thị, biểu đồ, bảng biến thiên minh họa (Tùy chọn)</span>
            </label>
            {question.imageUrl && !isStudent && (
              <button
                type="button"
                onClick={() => onChange({ ...question, imageUrl: undefined })}
                className="text-[11px] text-rose-700 hover:underline cursor-pointer"
              >
                Xóa ảnh
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={question.imageUrl || ''}
              onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
              placeholder="Dán đường dẫn ảnh (URL) hoặc bấm Tải ảnh lên..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-rose-800" />
              <span>Tải ảnh lên</span>
            </button>
          </div>
        </div>

        {/* DẠNG 1: TRẮC NGHIỆM ABCD */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                4 Phương án lựa chọn (Chọn 1 đáp án đúng):
              </label>
              <span className="text-[11px] text-emerald-800 font-semibold">
                Click vào nút tròn để đặt đáp án đúng
              </span>
            </div>

            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const isSelected = question.correctOptionIndex === idx;
                const options = question.options || ['', '', '', ''];
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChange({ ...question, correctOptionIndex: idx })}
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSelected ? 'Đáp án đúng' : `Chọn ${letter} làm đáp án đúng`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      value={options[idx] || ''}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx] = e.target.value;
                        onChange({ ...question, options: newOptions });
                      }}
                      placeholder={`Nội dung phương án ${letter}...`}
                      className={`flex-1 px-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-none text-slate-800 ${
                        isSelected ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-200'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DẠNG 2: TRẮC NGHIỆM ĐÚNG / SAI 4 Ý (CHUẨN BGD) */}
        {question.type === 'true_false' && (
          <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                4 Ý khẳng định (a, b, c, d) theo định dạng mới của Bộ Giáo dục & Đào tạo:
              </label>
            </div>

            <div className="space-y-2.5">
              {(question.subQuestions || [
                { id: 'a', label: 'a)', text: '', isCorrect: true },
                { id: 'b', label: 'b)', text: '', isCorrect: false },
                { id: 'c', label: 'c)', text: '', isCorrect: true },
                { id: 'd', label: 'd)', text: '', isCorrect: false },
              ]).map((sub, idx) => (
                <div key={sub.id || idx} className="flex items-center gap-2">
                  <span className="w-6 font-bold text-xs text-rose-900 bg-rose-50 p-1 rounded text-center shrink-0">
                    {sub.label || `${String.fromCharCode(97 + idx)})`}
                  </span>
                  <input
                    type="text"
                    value={sub.text || ''}
                    onChange={(e) => {
                      const newSubs = [...(question.subQuestions || [])];
                      newSubs[idx] = { ...sub, text: e.target.value };
                      onChange({ ...question, subQuestions: newSubs });
                    }}
                    placeholder={`Khẳng định ${sub.label || `${String.fromCharCode(97 + idx)})`}...`}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const newSubs = [...(question.subQuestions || [])];
                        newSubs[idx] = { ...sub, isCorrect: true };
                        onChange({ ...question, subQuestions: newSubs });
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        sub.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newSubs = [...(question.subQuestions || [])];
                        newSubs[idx] = { ...sub, isCorrect: false };
                        onChange({ ...question, subQuestions: newSubs });
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        !sub.isCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Sai
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-950">
              <strong>Thang điểm chuẩn BGD:</strong> Đúng 1 ý: 0.1 điểm · Đúng 2 ý: 0.25 điểm · Đúng 3 ý: 0.5 điểm · Đúng 4 ý: 1.0 điểm.
            </div>
          </div>
        )}

        {/* DẠNG 3: TRẮC NGHIỆM TRẢ LỜI NGẮN */}
        {question.type === 'short_answer' && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Đáp án số / Từ khóa chuẩn *
                </label>
                <input
                  type="text"
                  value={question.shortAnswerCorrect || ''}
                  onChange={(e) => onChange({ ...question, shortAnswerCorrect: e.target.value })}
                  placeholder="Nhập đáp án chuẩn..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sai số cho phép (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={question.shortAnswerTolerance || ''}
                  onChange={(e) => onChange({ ...question, shortAnswerTolerance: e.target.value })}
                  placeholder="Sai số cho phép (nếu có)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* DẠNG 4: TỰ LUẬN */}
        {question.type === 'essay' && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Biểu điểm & Hướng dẫn chấm từng bước (Rubric):
            </label>
            <textarea
              rows={3}
              value={question.essayRubric || ''}
              onChange={(e) => onChange({ ...question, essayRubric: e.target.value })}
              placeholder="Nhập biểu điểm & hướng dẫn chấm chi tiết..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        )}

        {/* Lời giải chi tiết / Hướng dẫn giải */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Lời giải chi tiết & Hướng dẫn giải (Hiển thị cho học sinh sau khi hoàn thành)
          </label>
          <textarea
            rows={3}
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Nhập lời giải chi tiết..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          />
        </div>
      </div>

      {/* Footer action buttons */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Làm mới / Soạn câu mới</span>
        </button>

        {isStudent ? (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            Tài khoản học sinh (chế độ xem trước)
          </span>
        ) : (
          <button
            type="button"
            disabled={isSaving || !question.content?.trim()}
            onClick={onSave}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : (isEditing ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng câu hỏi')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
