import React, { useState } from 'react';
import { useApp, ClassSubTab } from '../../context/AppContext.tsx';
import { ClassItem } from '../../types/index.ts';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  BookCheck,
  FileCheck2,
  LineChart,
  School,
  GraduationCap,
  Calendar,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ClassOverviewTab } from './ClassOverviewTab.tsx';
import { ClassStudentsTab } from './ClassStudentsTab.tsx';
import { ClassHomeworkTab } from './ClassHomeworkTab.tsx';
import { ClassQuizzesTab } from './ClassQuizzesTab.tsx';
import { ClassAnalyticsTab } from './ClassAnalyticsTab.tsx';

export const ClassDetail: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { selectedClassTab, setSelectedClassTab, closeClass, removeClass, isStudent } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tabs: { id: ClassSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Tổng quan về lớp', icon: LayoutDashboard },
    { id: 'students', label: 'Danh sách học sinh', icon: Users },
    { id: 'homework', label: 'Bài tập của lớp', icon: BookCheck },
    { id: 'quizzes', label: 'Bài Kiểm tra của lớp', icon: FileCheck2 },
    { id: 'analytics', label: 'Phân tích dữ liệu học tập', icon: LineChart },
  ];

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await removeClass(classItem.id);
    } catch (err) {
      console.error('Failed to delete class', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header of the Class */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={closeClass}
              className="p-2 mt-0.5 rounded-xl text-slate-500 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="Quay lại danh sách lớp"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900">
                  Lớp {classItem.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200">
                  Khối {classItem.grade}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  {classItem.subject}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  {classItem.school}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  GV: <strong className="text-slate-700">{classItem.teacherName}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Năm học: {classItem.academicYear}
                </span>
              </div>
            </div>
          </div>

          {!isStudent && (
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                title="Xóa lớp học này"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa lớp học</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Sub-Tabs Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedClassTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedClassTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-Tab Content View */}
      <div>
        {selectedClassTab === 'overview' && <ClassOverviewTab classItem={classItem} />}
        {selectedClassTab === 'students' && <ClassStudentsTab classItem={classItem} />}
        {selectedClassTab === 'homework' && <ClassHomeworkTab classItem={classItem} />}
        {selectedClassTab === 'quizzes' && <ClassQuizzesTab classItem={classItem} />}
        {selectedClassTab === 'analytics' && <ClassAnalyticsTab classItem={classItem} />}
      </div>

      {/* Modal Xác nhận Xóa Lớp Học */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa lớp học</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Bạn có chắc chắn muốn xóa <strong className="text-rose-950 font-bold">Lớp {classItem.name}</strong> (Khối {classItem.grade}) không?
                </p>
                <div className="mt-3 p-3 bg-rose-50/80 rounded-xl border border-rose-200/80 text-xs text-rose-800 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>Toàn bộ học sinh, bài tập đã giao và kết quả kiểm tra của lớp này sẽ bị xóa khỏi hệ thống và không thể hoàn tác.</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
