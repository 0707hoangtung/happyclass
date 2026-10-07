import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BookCheck, Clock, Users, ArrowRight, Star, Plus } from 'lucide-react';

export const GlobalHomeworkView: React.FC = () => {
  const { state, openClass } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookCheck className="w-6 h-6 text-rose-800" />
            <span>Ngân hàng bài tập toàn trường</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp bài tập đã giao cho các lớp. Chọn một lớp để xem chi tiết học sinh hoàn thành và thưởng sao.
          </p>
        </div>
      </div>

      {/* Grid of classes with their homework count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.classes.map((cls) => {
          const classHw = state.homeworks.filter((h) => h.classId === cls.id);
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
                    <span>Số lượng bài tập:</span>
                    <strong className="text-slate-900 tabular-nums">{classHw.length} bài</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Sĩ số học sinh:</span>
                    <strong className="text-slate-900 tabular-nums">{students.length} học sinh</strong>
                  </div>
                </div>

                {/* List snippet of homeworks in this class */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {classHw.slice(0, 2).map((hw) => (
                    <div key={hw.id} className="text-xs p-2 rounded-lg bg-slate-50 text-slate-700 truncate">
                      • {hw.title}
                    </div>
                  ))}
                  {classHw.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Chưa giao bài tập</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openClass(cls.id, 'homework')}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Xem tiến độ bài tập lớp {cls.name}</span>
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
