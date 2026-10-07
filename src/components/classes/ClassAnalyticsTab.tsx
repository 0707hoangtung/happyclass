import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem, AIAnalysisResult, Student } from '../../types/index.ts';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';
import * as api from '../../services/api.ts';

export const ClassAnalyticsTab: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { state, showToast } = useApp();

  const students = state.students.filter((s) => s.classId === classItem.id);

  // Target selection: 'class' | 'student'
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => students[0]?.id || '');

  // Analysis result & loading state
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Trigger AI Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const targetId = targetType === 'class' ? classItem.id : selectedStudentId;
      if (!targetId) {
        showToast('Vui lòng chọn đối tượng phân tích', 'error');
        return;
      }

      const result = await api.runAIAnalysis(targetType, targetId);
      setAnalysisResult(result);
      showToast('Đã hoàn tất phân tích AI chuyên sâu sư phạm!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi chạy phân tích AI', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Target Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-900 text-xs font-bold tracking-wider mb-1">
              <Bot className="w-4 h-4 text-rose-800" />
              <span>Trung tâm Trí tuệ Nhân tạo Sư phạm</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Phân tích dữ liệu học tập & điểm nghẽn kiến thức
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống dựa trên dữ liệu điểm kiểm tra, bài tập và tiến độ thực tế để chẩn đoán sư phạm và đề xuất chiến lược bồi dưỡng.
            </p>
          </div>

          {/* Target Selector controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTargetType('class')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  targetType === 'class'
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn bộ LỚP {classItem.name}
              </button>
              <button
                type="button"
                onClick={() => setTargetType('student')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  targetType === 'student'
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Từng học sinh cụ thể
              </button>
            </div>

            {targetType === 'student' && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-rose-800/40 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.studentCode})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chạy phân tích AI chuyên sâu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Analysis Results Presentation */}
      {analysisResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Đối tượng phân tích</span>
              <div className="text-lg font-bold text-slate-900 mt-1 truncate">
                {analysisResult.targetName}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {analysisResult.targetType === 'class' ? `Sĩ số: ${analysisResult.totalStudents} học sinh` : 'Hồ sơ học sinh cá nhân'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Điểm trung bình kiểm tra</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {analysisResult.averageScore}/10
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Thang điểm 10 chuẩn BGD</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-emerald-800">Số học sinh đạt</span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1 tabular-nums">
                {analysisResult.passedCount ?? 0}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-0.5">Điểm số ≥ 5.0</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-rose-50/20 p-5 rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-rose-800">Cần cố gắng (Phụ đạo)</span>
              <div className="text-2xl font-extrabold text-rose-900 mt-1 tabular-nums">
                {analysisResult.needsImprovementCount ?? 0}
              </div>
              <p className="text-[11px] text-rose-700/80 mt-0.5">Cần bồi dưỡng kịp thời</p>
            </div>
          </div>

          {/* AI Pedagogical Summary */}
          <div className="bg-gradient-to-br from-[#FDF8F9] to-white p-5 rounded-2xl border border-rose-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nhận định sư phạm tổng thể</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {analysisResult.summary}
            </p>
          </div>

          {/* Deep Dive 1: Xác định Điểm Nghẽn Kiến Thức (Knowledge Bottlenecks) */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base text-slate-900">
                  Xác định điểm nghẽn kiến thức (Knowledge Bottlenecks)
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Chẩn đoán từ bài làm & bài tập
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.knowledgeBottlenecks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 leading-snug">
                      {item.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        item.severity === 'cao'
                          ? 'bg-rose-100 text-rose-800'
                          : item.severity === 'trung bình'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Mức độ: {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Dive 2: Đề Xuất Chiến Lược Bồi Dưỡng Kiến Thức (Tutoring Strategies) */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base text-slate-900">
                  Đề xuất chiến lược bồi dưỡng kiến thức
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Phương pháp sư phạm cá nhân hóa
              </span>
            </div>

            <div className="space-y-3">
              {analysisResult.tutoringStrategies.map((strat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-rose-100 bg-[#FDF8F9]/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-bold text-rose-950">
                      {idx + 1}. {strat.title}
                    </h5>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800">
                      Đối tượng: {strat.targetGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-4 border-l-2 border-rose-700">
                    {strat.actionPlan}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Dive 3: Đề Xuất Dạng Bài Tập Phù Hợp (Recommended Exercises) */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-800" />
                <h4 className="font-bold text-base text-slate-900">
                  Đề xuất dạng bài tập phù hợp nâng cao năng lực
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Khắc phục triệt để điểm nghẽn
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.recommendedExercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-sm transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                      {ex.type}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {ex.difficulty}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 leading-snug">
                    {ex.title}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ex.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State before running AI */
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-100 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-800 mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-rose-800" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            Sẵn sàng phân tích dữ liệu sư phạm với Happy AI
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Chọn đối tượng phân tích (Toàn bộ Lớp {classItem.name} hoặc từng học sinh cụ thể) và bấm nút "Chạy phân tích AI chuyên sâu" ở phía trên.
          </p>
        </div>
      )}
    </div>
  );
};
