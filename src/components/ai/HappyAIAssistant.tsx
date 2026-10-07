import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bot,
  Sparkles,
  FileText,
  Grid3X3,
  MessageSquareHeart,
  Send,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import * as api from '../../services/api.ts';

export const HappyAIAssistant: React.FC = () => {
  const { state, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'5512' | 'matrix' | 'comment' | 'chat'>('5512');
  const [promptInput, setPromptInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(state.teacher.subject || 'Toán học');
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Quick prompt templates
  const applyTemplate = (text: string) => {
    setPromptInput(text);
  };

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      showToast('Vui lòng nhập nội dung yêu cầu cho HAPPY AI', 'error');
      return;
    }

    setIsGenerating(true);
    setAiOutput('');
    try {
      let actionType = 'chat';
      if (activeTab === '5512') actionType = 'lesson_plan_5512';
      else if (activeTab === 'matrix') actionType = 'test_matrix';
      else if (activeTab === 'comment') actionType = 'report_comment';

      const res = await api.callHappyAIAssistant(actionType, promptInput.trim(), selectedGrade, selectedSubject);
      setAiOutput(res.text);
      showToast('HAPPY AI đã hoàn tất phản hồi sư phạm!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi kết nối HAPPY AI', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    showToast('Đã sao chép nội dung vào khay nhớ tạm', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#5a0f21] via-[#781731] to-[#450816] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wider mb-1.5">
              <Bot className="w-4 h-4" />
              <span>Trợ lý Sư phạm Trí tuệ Nhân tạo</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Happy AI - Đồng hành cùng giáo viên
            </h2>
            <p className="text-rose-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Tối ưu hóa thời gian soạn giáo án theo Công văn 5512/BGDĐT, thiết lập ma trận đề thi chuẩn 2025 và viết nhận xét học bạ giàu tính động viên theo Thông tư 22/27/58.
            </p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-rose-300/20 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: '5512', label: 'Soạn giáo án CV 5512', icon: FileText },
            { id: 'matrix', label: 'Ma trận đề thi chuẩn 2025', icon: Grid3X3 },
            { id: 'comment', label: 'Nhận xét học bạ TT 22/27/58', icon: MessageSquareHeart },
            { id: 'chat', label: 'Hỏi đáp sư phạm hiện đại', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setAiOutput('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-rose-950 shadow-md font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompt Input & Configuration */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 tracking-wider">
              Cấu hình yêu cầu
            </span>
            <span className="text-[11px] text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded">
              Gemini 3.8 Flash
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Môn học
              </label>
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Khối lớp
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Khối {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick prompt suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Gợi ý chủ đề nhanh:</span>
            <div className="flex flex-wrap gap-1.5">
              {activeTab === '5512' && (
                <>
                  <button
                    onClick={() => applyTemplate('Soạn kế hoạch bài dạy 5512 bài "Hàm số bậc hai và đồ thị" (2 tiết), tích hợp hoạt động trải nghiệm thực tế.')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    Hàm số bậc hai (CV 5512)
                  </button>
                  <button
                    onClick={() => applyTemplate('Soạn giáo án 5512 bài "Tích vô hướng của hai vectơ", chú trọng phát triển năng lực tư duy toán học.')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    Tích vô hướng hai vectơ
                  </button>
                </>
              )}

              {activeTab === 'matrix' && (
                <>
                  <button
                    onClick={() => applyTemplate('Lập ma trận đặc tả đề kiểm tra Giữa kỳ I theo định dạng 2025 của Bộ GD&ĐT gồm 3 phần (Trắc nghiệm nhiều lựa chọn, Đúng/Sai, Câu trả lời ngắn).')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    Ma trận giữa kỳ I định dạng 2025
                  </button>
                  <button
                    onClick={() => applyTemplate('Thiết kế 4 câu hỏi trắc nghiệm Đúng/Sai (mỗi câu gồm 4 ý a,b,c,d) về chủ đề Tam thức bậc hai kèm biểu điểm chuẩn Bộ GD.')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    4 câu Đúng/Sai kèm biểu điểm
                  </button>
                </>
              )}

              {activeTab === 'comment' && (
                <>
                  <button
                    onClick={() => applyTemplate('Viết 5 lời nhận xét học bạ mẫu theo Thông tư 22 cho các nhóm học sinh: 1. Xuất sắc năng nổ; 2. Tiếp thu tốt nhưng cẩu thả; 3. Chăm chỉ nhưng trầm tính; 4. Cần cố gắng môn tính toán; 5. Có tiến bộ vượt bậc.')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    Bộ nhận xét 5 nhóm học sinh (TT 22)
                  </button>
                </>
              )}

              {activeTab === 'chat' && (
                <>
                  <button
                    onClick={() => applyTemplate('Đề xuất 3 kỹ thuật dạy học tích cực (Khăn trải bàn, Mảnh ghép, Trạm học tập) để tạo không khí lớp học hạnh phúc và gắn kết.')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 transition-colors text-left"
                  >
                    Kỹ thuật dạy học tích cực
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Yêu cầu cụ thể của Thầy/Cô:
            </label>
            <textarea
              rows={6}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Nhập yêu cầu soạn bài, chuyên đề, dạng bài hoặc câu hỏi cần giải đáp..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !promptInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Happy AI đang soạn thảo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tạo nội dung với Happy AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-rose-100 bg-[#FDF8F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-800" />
              <h3 className="text-xs font-bold text-slate-800 tracking-wider">
                Kết quả phản hồi từ Happy AI
              </h3>
            </div>

            {aiOutput && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {aiOutput ? (
              <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-line leading-relaxed text-xs sm:text-sm font-sans">
                {aiOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                <Bot className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  Nội dung phản hồi từ Happy AI sẽ xuất hiện tại đây
                </p>
                <p className="text-xs max-w-md text-slate-400">
                  Hãy nhập yêu cầu ở cột bên trái và bấm nút "Tạo nội dung với Happy AI".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
