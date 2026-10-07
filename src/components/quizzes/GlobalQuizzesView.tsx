import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { FileCheck2, ArrowRight, Clock, Award } from 'lucide-react';

export const GlobalQuizzesView: React.FC = () => {
  const { state, openClass } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-rose-800" />
          <span>Ngân hàng đề kiểm tra & khảo thí</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống đề kiểm tra online và bảng chấm điểm tự động theo quy chế hiện hành của Bộ Giáo dục & Đào tạo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.classes.map((cls) => {
          const classQuizzes = state.quizzes.filter((q) => q.classId === cls.id);
          const students = state.students.filter((s) => s.classId === cls.id);

          return (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    Lớp {cls.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-900">
                    Khối {cls.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{cls.subject} · {cls.school}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Đề thi đã tạo:</span>
                    <strong className="text-slate-900 tabular-nums">{classQuizzes.length} đề</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Quy chế khảo thí:</span>
                    <span className="text-emerald-700 font-semibold">Tự động chấm điểm</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {classQuizzes.map((q) => (
                    <div key={q.id} className="text-xs p-2 rounded-lg bg-slate-50 text-slate-700 truncate">
                      • {q.title} ({q.durationMinutes}p)
                    </div>
                  ))}
                  {classQuizzes.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Chưa tạo đề kiểm tra</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openClass(cls.id, 'quizzes')}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Vào phòng thi lớp {cls.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
