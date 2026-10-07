import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem } from '../../types/index.ts';
import {
  Users,
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  School,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  X,
  Search,
  BookCheck,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const ClassList: React.FC = () => {
  const { state, openClass, createNewClass, removeClass, isStudent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');

  // Confirmation state for deleting a class
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);

  // Form State for "Thêm lớp học"
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(10);
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState(state.teacher.academicYear || '2024 - 2025');
  const [teacherName, setTeacherName] = useState(state.teacher.fullName || 'Thầy Hoàng Tùng');
  const [isSaving, setIsSaving] = useState(false);

  // Quantitative Stats
  const totalClasses = state.classes.length;
  const totalStudents = state.students.length;

  // Filtered classes
  const filteredClasses = state.classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || c.grade === Number(gradeFilter);
    return matchesSearch && matchesGrade;
  });

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await createNewClass({
        name: name.trim(),
        grade: Number(grade),
        school: school.trim(),
        subject: subject.trim(),
        academicYear: academicYear.trim(),
        teacherName: teacherName.trim(),
      });
      setIsModalOpen(false);
      setName('');
      setSchool('');
      setSubject('');
    } catch (err) {
      console.error('Failed to create class', err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    setIsDeletingClass(true);
    try {
      await removeClass(classToDelete.id);
      setClassToDelete(null);
    } catch (err) {
      console.error('Failed to delete class', err);
    } finally {
      setIsDeletingClass(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-gradient-to-r from-[#5a0f21] via-[#75162f] to-[#4c0919] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Background glow and subtle pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Happy class
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-rose-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm lớp học</span>
          </button>
        </div>

        {/* Key Metrics Strip (Tổng số lớp học, Tổng số học sinh) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-rose-300/20">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <span className="text-xs text-rose-200 font-medium">Tổng số lớp học</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
              {totalClasses}
            </div>
            <span className="text-[11px] text-rose-300/80">Khối 1 đến Khối 12</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <span className="text-xs text-rose-200 font-medium">Tổng số học sinh</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
              {totalStudents}
            </div>
            <span className="text-[11px] text-rose-300/80">Đang theo học hoạt động</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <span className="text-xs text-rose-200 font-medium">Bài tập đã giao</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
              {state.homeworks.length}
            </div>
            <span className="text-[11px] text-rose-300/80">Tích lũy ngôi sao</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10">
            <span className="text-xs text-rose-200 font-medium">Đề kiểm tra tự động</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
              {state.quizzes.length}
            </div>
            <span className="text-[11px] text-rose-300/80">Chuẩn Bộ Giáo dục</span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên lớp, môn học, trường..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/30 focus:border-rose-800 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Grade filter segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setGradeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              gradeFilter === 'all'
                ? 'bg-rose-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả khối
          </button>
          {[10, 11, 12, 9, 8, 7, 6].map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                gradeFilter === g
                  ? 'bg-rose-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối {g}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredClasses.map((item) => {
          // Specific metrics for this class
          const studentsInClass = state.students.filter((s) => s.classId === item.id);
          const studentCount = studentsInClass.length;

          // Homework completion count
          const homeworksForClass = state.homeworks.filter((h) => h.classId === item.id);
          const homeworkIds = new Set(homeworksForClass.map((h) => h.id));
          const completedHwSubmissions = state.homeworkSubmissions.filter(
            (sub) => homeworkIds.has(sub.homeworkId) && sub.isCompleted
          );
          // Distinct students in this class who completed at least 1 homework
          const distinctCompletedHwStudents = new Set(
            completedHwSubmissions.map((s) => s.studentId)
          ).size;

          // Quiz completion count
          const quizzesForClass = state.quizzes.filter((q) => q.classId === item.id);
          const quizIds = new Set(quizzesForClass.map((q) => q.id));
          const distinctCompletedQuizStudents = new Set(
            state.quizSubmissions
              .filter((sub) => quizIds.has(sub.quizId))
              .map((s) => s.studentId)
          ).size;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border-2 border-[#5a0f21] shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-[#7a1832]"
            >
              {/* Card Top Banner */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
                        Lớp {item.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200">
                        Khối {item.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.school}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg">
                      {item.subject}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{item.academicYear}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-[#FDF8F9] px-3 py-2 rounded-xl border border-rose-100/60">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-rose-800" />
                    <span>GV: <strong className="text-slate-800">{item.teacherName}</strong></span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{item.room || 'Phòng bộ môn'}</span>
                </div>
              </div>

              {/* Card Metrics: Sĩ số, Hoàn thành Bài tập, Hoàn thành Kiểm tra */}
              <div className="p-5 space-y-3 bg-white">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mb-0.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Học sinh</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums">
                      {studentCount}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-800 mb-0.5 font-medium">
                      <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bài tập</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-900 tabular-nums">
                      {distinctCompletedHwStudents}
                      <span className="text-xs font-normal text-emerald-700">/{studentCount}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-rose-800 mb-0.5 font-medium">
                      <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Kiểm tra</span>
                    </div>
                    <div className="text-lg font-bold text-rose-900 tabular-nums">
                      {distinctCompletedQuizStudents}
                      <span className="text-xs font-normal text-rose-700">/{studentCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action Button: "VÀO LỚP" & "XÓA LỚP" */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => openClass(item.id, 'overview')}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
                >
                  <span>Vào lớp học</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                {!isStudent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClassToDelete(item);
                    }}
                    title="Xóa lớp học này"
                    className="p-2.5 rounded-xl border border-rose-200 text-rose-700 hover:text-white hover:bg-rose-800 hover:border-rose-800 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Chưa tìm thấy lớp học phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút Thêm lớp học.</p>
        </div>
      )}

      {/* 4. Modal "Thêm lớp học" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base text-white">Thêm lớp học mới</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>
                        Khối {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên lớp *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên lớp..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trường học *
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Nhập tên trường học..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Nhập môn học..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm học *
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2024 - 2025"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giáo viên giảng dạy *
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Họ và tên giáo viên..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 5. Modal Xác nhận Xóa Lớp Học */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa lớp học</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Bạn có chắc chắn muốn xóa <strong className="text-rose-950 font-bold">Lớp {classToDelete.name}</strong> (Khối {classToDelete.grade}) không?
                </p>
                <div className="mt-3 p-3 bg-rose-50/80 rounded-xl border border-rose-200/80 text-xs text-rose-800 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>Toàn bộ học sinh, bài tập đã giao và kết quả kiểm tra của lớp này sẽ bị xóa khỏi hệ thống và không thể hoàn tác.</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingClass}
                  onClick={() => setClassToDelete(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeletingClass}
                  onClick={confirmDeleteClass}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingClass ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
