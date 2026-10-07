import React from 'react';
import { BankQuestion, QuestionType, QuestionLevel } from '../../types/index.ts';
import { MathRenderer } from '../common/MathRenderer.tsx';
import {
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  BookOpen,
  GraduationCap,
  FileQuestion,
  Info,
} from 'lucide-react';

interface QuestionPreviewPanelProps {
  question: Partial<BankQuestion>;
}

export const QuestionPreviewPanel: React.FC<QuestionPreviewPanelProps> = ({ question }) => {
  const getLevelBadge = (level?: QuestionLevel) => {
    switch (level) {
      case 'nhan_biet':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">Nhận biết</span>;
      case 'thong_hieu':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">Thông hiểu</span>;
      case 'van_dung_thap':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">Vận dụng thấp</span>;
      case 'van_dung_cao':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold">Vận dụng cao</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">Thông hiểu</span>;
    }
  };

  const getTypeName = (type?: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return 'Trắc nghiệm nhiều lựa chọn (ABCD)';
      case 'true_false':
        return 'Trắc nghiệm Đúng / Sai (Bộ GD&ĐT)';
      case 'short_answer':
        return 'Trắc nghiệm trả lời ngắn';
      case 'essay':
        return 'Tự luận';
      default:
        return 'Trắc nghiệm ABCD';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header of Preview */}
      <div className="bg-gradient-to-r from-[#6e142b] to-[#500c1e] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-300" />
          <h3 className="font-bold text-sm">Xem trước câu hỏi (Hiển thị thời gian thực)</h3>
        </div>
        <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-rose-100 font-medium">
          Hỗ trợ Latex / KaTeX
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
        {/* Meta tags bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-900 px-2.5 py-1 bg-slate-100 rounded-lg">
            {question.subject ? `Môn ${question.subject}` : 'Môn học (để trống)'} · Khối {question.grade || 10}
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-900 font-semibold rounded-lg border border-rose-200">
            {question.lesson || 'Bài học (để trống)'}
          </span>
          {getLevelBadge(question.level)}
          <span className="ml-auto font-bold text-rose-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{question.points ?? 0} điểm</span>
          </span>
        </div>

        {/* Question Type banner */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span className="font-medium">
            Định dạng: <strong className="text-slate-800">{getTypeName(question.type)}</strong>
          </span>
          {question.type === 'true_false' && (
            <span className="text-amber-800 text-[11px] font-semibold">
              Quy tắc điểm BGD: 1 ý: 0.1đ · 2 ý: 0.25đ · 3 ý: 0.5đ · 4 ý: 1.0đ
            </span>
          )}
        </div>

        {/* Question Content View */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 block">Đề bài:</label>
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-sm leading-relaxed">
            {question.content ? (
              <MathRenderer content={question.content} />
            ) : (
              <span className="text-slate-400 italic">
                (Nội dung câu hỏi đang để trống)
              </span>
            )}
          </div>
        </div>

        {/* Optional Image / Graph / Table */}
        {question.imageUrl && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">Hình ảnh / Đồ thị minh họa:</label>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <img
                src={question.imageUrl}
                alt="Đồ thị minh họa"
                className="max-h-64 max-w-full mx-auto object-contain rounded-lg shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* DẠNG 1: TRẮC NGHIỆM ABCD */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">Các phương án lựa chọn:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(question.options || ['', '', '', '']).map((opt, idx) => {
                const optLetters = ['A', 'B', 'C', 'D'];
                const isCorrect = question.correctOptionIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optLetters[idx]}
                    </span>
                    <div className="text-xs pt-0.5 flex-1">
                      {opt ? <MathRenderer content={opt} /> : <span className="text-slate-300 italic">(Để trống)</span>}
                    </div>
                    {isCorrect && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Đáp án đúng
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DẠNG 2: TRẮC NGHIỆM ĐÚNG / SAI (4 Ý a, b, c, d) */}
        {question.type === 'true_false' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">
              Các khẳng định kiểm tra Đúng / Sai (Chuẩn cấu trúc 4 ý):
            </label>
            <div className="space-y-2">
              {(question.subQuestions || [
                { id: 'a', label: 'a)', text: '', isCorrect: true },
                { id: 'b', label: 'b)', text: '', isCorrect: false },
                { id: 'c', label: 'c)', text: '', isCorrect: true },
                { id: 'd', label: 'd)', text: '', isCorrect: false },
              ]).map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="font-bold text-xs text-rose-900 bg-rose-50 px-2 py-1 rounded shrink-0">
                      {sub.label || `${String.fromCharCode(97 + idx)})`}
                    </span>
                    <div className="text-xs text-slate-800 pt-0.5 flex-1">
                      {sub.text ? <MathRenderer content={sub.text} /> : <span className="text-slate-300 italic">(Để trống)</span>}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${
                      sub.isCorrect
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {sub.isCorrect ? 'Đúng' : 'Sai'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>Quy định tính điểm của Bộ Giáo dục & Đào tạo cho câu hỏi này:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-white p-1.5 rounded-lg border border-amber-200 text-center">Đúng 1 ý: <strong>0.1 đ</strong></div>
                <div className="bg-white p-1.5 rounded-lg border border-amber-200 text-center">Đúng 2 ý: <strong>0.25 đ</strong></div>
                <div className="bg-white p-1.5 rounded-lg border border-amber-200 text-center">Đúng 3 ý: <strong>0.5 đ</strong></div>
                <div className="bg-white p-1.5 rounded-lg border border-amber-200 text-center">Đúng 4 ý: <strong>1.0 đ</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* DẠNG 3: TRẮC NGHIỆM TRẢ LỜI NGẮN */}
        {question.type === 'short_answer' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Hình thức làm bài của học sinh:</label>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-400 italic">
              [Ô nhập đáp án số hoặc kết quả ngắn gọn...]
            </div>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">
                Đáp án chuẩn: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{question.shortAnswerCorrect || '(Để trống)'}</strong>
              </span>
              {question.shortAnswerTolerance && (
                <span className="text-slate-500">
                  Sai số cho phép: ±{question.shortAnswerTolerance}
                </span>
              )}
            </div>
          </div>
        )}

        {/* DẠNG 4: TỰ LUẬN */}
        {question.type === 'essay' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Biểu điểm & Hướng dẫn chấm (Rubric):</label>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {question.essayRubric ? (
                <MathRenderer content={question.essayRubric} />
              ) : (
                <span className="text-slate-400 italic">(Để trống)</span>
              )}
            </div>
          </div>
        )}

        {/* Explanation / Lời giải chi tiết */}
        {question.explanation && (
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1.5">
            <span className="font-bold text-rose-950 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>Lời giải chi tiết & Hướng dẫn giải:</span>
            </span>
            <div className="text-slate-800 leading-relaxed pl-3 border-l-2 border-rose-800">
              <MathRenderer content={question.explanation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
