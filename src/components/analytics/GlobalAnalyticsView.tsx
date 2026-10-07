import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { LineChart, Trophy, Star, Users, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export const GlobalAnalyticsView: React.FC = () => {
  const { state, openClass } = useApp();

  const totalStudents = state.students.length;
  const totalHomeworks = state.homeworks.length;
  const totalQuizzes = state.quizzes.length;
  const totalStars = state.students.reduce((acc, s) => acc + (s.stars || 0), 0);

  // Top 10 star holders in entire school
  const allRankedStudents = [...state.students].sort((a, b) => (b.stars || 0) - (a.stars || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <LineChart className="w-6 h-6 text-rose-800" />
          <span>Tổng quan phân tích dữ liệu toàn trường</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Báo cáo thống kê chất lượng học tập, phân bố học lực và bảng vàng vinh danh ngôi sao học sinh.
        </p>
      </div>

      {/* Big Metric Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Tổng số học sinh</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Trên {state.classes.length} lớp học</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 bg-amber-50/20 p-5 rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-amber-800">Tổng ngôi sao tích lũy</span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1 tabular-nums flex items-baseline gap-1">
            {totalStars}
            <span className="text-xs font-semibold text-amber-600">⭐</span>
          </div>
          <p className="text-[11px] text-amber-700/70 mt-0.5">Thưởng qua bài tập & thi cử</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Bài tập đã giao</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalHomeworks}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tiến độ cập nhật real-time</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Bài kiểm tra MOET</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {totalQuizzes}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Chấm điểm tự động</p>
        </div>
      </div>

      {/* Class Analytics Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider">
              Chọn lớp để phân tích chuyên sâu bằng AI
            </h3>
            <p className="text-xs text-slate-500">
              Chẩn đoán điểm nghẽn kiến thức và nhận chiến lược bồi dưỡng từ Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.classes.map((cls) => {
            const count = state.students.filter((s) => s.classId === cls.id).length;
            return (
              <button
                key={cls.id}
                onClick={() => openClass(cls.id, 'analytics')}
                className="p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 group-hover:text-rose-900">
                    Lớp {cls.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-800 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-slate-500 mt-1">{cls.subject} · {count} học sinh</p>
                <span className="inline-block mt-3 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                  Chạy AI chẩn đoán →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* School-Wide Top 10 Star Leaderboard */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Bảng vàng danh dự toàn trường (Top ngôi sao hạnh phúc ⭐)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Xếp hạng theo điểm thưởng tích lũy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allRankedStudents.slice(0, 9).map((st, idx) => {
            const cls = state.classes.find((c) => c.id === st.classId);
            return (
              <div
                key={st.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-rose-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{st.fullName}</h4>
                    <p className="text-[10px] text-slate-500">Lớp {cls?.name || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-900 shrink-0 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="tabular-nums">{st.stars || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
