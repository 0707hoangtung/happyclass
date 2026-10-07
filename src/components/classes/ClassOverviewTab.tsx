import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem } from '../../types/index.ts';
import {
  Users,
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  BookCheck,
  Trophy,
  Sparkles,
} from 'lucide-react';

export const ClassOverviewTab: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { state, setSelectedClassTab } = useApp();

  const students = state.students.filter((s) => s.classId === classItem.id);
  const homeworks = state.homeworks.filter((h) => h.classId === classItem.id);
  const quizzes = state.quizzes.filter((q) => q.classId === classItem.id);

  // Homework stats
  const homeworkIds = new Set(homeworks.map((h) => h.id));
  const classHwSubmissions = state.homeworkSubmissions.filter((sub) =>
    homeworkIds.has(sub.homeworkId)
  );
  const completedHwCount = classHwSubmissions.filter((sub) => sub.isCompleted).length;
  const totalPossibleHw = homeworks.length * (students.length || 1);
  const hwCompletionPercent = totalPossibleHw > 0
    ? Math.round((completedHwCount / totalPossibleHw) * 100)
    : 0;

  // Quiz stats & average score
  const quizIds = new Set(quizzes.map((q) => q.id));
  const classQuizSubmissions = state.quizSubmissions.filter((sub) =>
    quizIds.has(sub.quizId)
  );
  const scores = classQuizSubmissions.map((s) => s.score);
  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;
  const passedStudents = classQuizSubmissions.filter((s) => s.score >= 5.0).length;
  const needsEffortStudents = classQuizSubmissions.filter((s) => s.score < 5.0).length;

  // Star leaderboard: Top students in class
  const rankedStudents = [...students].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  const totalClassStars = students.reduce((sum, s) => sum + (s.stars || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sĩ số lớp</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {students.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đầy đủ hồ sơ học sinh</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng sao tích lũy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums flex items-baseline gap-1">
            {totalClassStars}
            <span className="text-xs text-amber-600 font-medium">sao ⭐</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Thưởng qua bài tập & kiểm tra</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tỉ lệ hoàn thành bài tập</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {hwCompletionPercent}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${hwCompletionPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Điểm kiểm tra TB</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-800">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {avgScore > 0 ? avgScore : '—'}/10
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {passedStudents} Đạt · {needsEffortStudents} Cần cố gắng
          </p>
        </div>
      </div>

      {/* 2. Middle Row: Star Leaderboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Star Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">
                Bảng Vinh Danh Ngôi Sao Hạnh Phúc
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tích lũy từ bài tập & kiểm tra</span>
          </div>

          <div className="space-y-2.5">
            {rankedStudents.slice(0, 6).map((student, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isTop1
                      ? 'bg-amber-50/70 border-amber-200'
                      : isTop2
                      ? 'bg-slate-50 border-slate-200'
                      : isTop3
                      ? 'bg-rose-50/50 border-rose-100'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isTop1
                          ? 'bg-amber-400 text-rose-950 shadow-xs'
                          : isTop2
                          ? 'bg-slate-300 text-slate-800'
                          : isTop3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
                      <p className="text-[11px] text-slate-400">Mã: {student.studentCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-amber-200 shadow-2xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {student.stars || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">ngôi sao</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {students.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedClassTab('students')}
                className="text-xs font-semibold text-rose-800 hover:text-rose-950 cursor-pointer"
              >
                Xem tất cả {students.length} học sinh trong LỚP →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions & AI Diagnosis Shortcut */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#661125] to-[#400715] text-white p-5 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Chẩn đoán AI chuyên sâu</span>
            </div>
            <h4 className="font-bold text-lg text-white">
              Phân tích học tập lớp {classItem.name}
            </h4>
            <p className="text-xs text-rose-100/80 mt-1.5 leading-relaxed">
              Ứng dụng AI phân tích điểm nghẽn kiến thức, học sinh cần bồi dưỡng và đề xuất dạng bài tập phù hợp theo thời gian thực.
            </p>
            <button
              onClick={() => setSelectedClassTab('analytics')}
              className="mt-4 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-rose-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Chạy phân tích AI ngay
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 tracking-wider">
              Lối tắt quản lý lớp
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedClassTab('students')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-100 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-rose-800 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Thêm học sinh</span>
                <span className="text-[10px] text-slate-400">Excel / Thủ công</span>
              </button>

              <button
                onClick={() => setSelectedClassTab('homework')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-100 transition-colors cursor-pointer"
              >
                <BookCheck className="w-4 h-4 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Giao bài tập</span>
                <span className="text-[10px] text-slate-400">Tặng 1 sao thưởng</span>
              </button>

              <button
                onClick={() => setSelectedClassTab('quizzes')}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-100 transition-colors cursor-pointer col-span-2"
              >
                <FileCheck2 className="w-4 h-4 text-rose-800 mb-1" />
                <span className="text-xs font-bold text-slate-800 block">
                  Đề kiểm tra & Chấm điểm tự động
                </span>
                <span className="text-[10px] text-slate-400">Chuẩn Bộ Giáo dục 2025</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
