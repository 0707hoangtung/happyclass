import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Menu,
  ChevronRight,
  School,
  Sparkles,
  RefreshCw,
  Bell,
  Star,
  Users,
  Sun,
  Moon,
  GraduationCap,
  User,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const {
    currentView,
    currentClass,
    closeClass,
    isRealtimeConnected,
    state,
    resetAllData,
    theme,
    toggleTheme,
    userRole,
    setUserRole,
    isTeacher,
    isStudent,
  } = useApp();

  const getViewTitle = () => {
    switch (currentView) {
      case 'classes':
        return currentClass ? `Lớp ${currentClass.name}` : 'Quản lý lớp học';
      case 'resources':
        return 'Kho học liệu số';
      case 'homework':
        return 'Ngân hàng bài tập';
      case 'quizzes':
        return 'Kiểm tra & đánh giá năng lực';
      case 'analytics':
        return 'Phân tích dữ liệu học tập';
      case 'happy_ai':
        return 'Trợ lý sư phạm Happy AI';
      case 'tools':
        return 'Công cụ số & tiện ích lớp học';
      case 'settings':
        return 'Cài đặt hệ thống';
      default:
        return 'Happy class';
    }
  };

  // Total stars in the entire school system
  const totalStars = state.students.reduce((acc, s) => acc + (s.stars || 0), 0);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-rose-100/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left side: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-rose-900 hover:bg-rose-50 lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="text-rose-900 font-bold tracking-tight">Happy class</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {currentView === 'classes' && currentClass ? (
            <>
              <button
                onClick={closeClass}
                className="hover:text-rose-900 hover:underline cursor-pointer"
              >
                Lớp học
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold">Lớp {currentClass.name}</span>
            </>
          ) : (
            <span className="text-slate-800 font-semibold">{getViewTitle()}</span>
          )}
        </nav>
      </div>

      {/* Right side: Star counter + Real-time badge + School Tag */}
      <div className="flex items-center gap-3">
        {/* Total Stars Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span className="tabular-nums">{totalStars}</span>
          <span className="text-amber-700/80 text-[11px] font-normal">sao tích lũy</span>
        </div>

        {/* Real-time Indicator */}
        <div
          title={isRealtimeConnected ? 'Đồng bộ thời gian thực không độ trễ' : 'Đang đồng bộ lại...'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200"
        >
          <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className="hidden md:inline">{isRealtimeConnected ? 'Live Real-time' : 'Reconnecting'}</span>
        </div>

        {/* Role Switcher (Giáo viên / Học sinh) */}
        <div
          title="Chuyển đổi tài khoản: Khi ở chế độ Học sinh, toàn bộ các nút Xóa trên toàn hệ thống sẽ tự động bị ẩn"
          className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <button
            type="button"
            onClick={() => setUserRole('teacher')}
            title="Tài khoản Giáo viên (Đầy đủ chức năng và nút Xóa)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isTeacher
                ? 'bg-gradient-to-r from-[#7a1832] to-[#5c0e22] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Giáo viên</span>
          </button>
          <button
            type="button"
            onClick={() => setUserRole('student')}
            title="Tài khoản Học sinh (Ẩn toàn bộ nút Xóa trên toàn hệ thống)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isStudent
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Học sinh</span>
          </button>
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối (màn hình tối)'}
          aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
            theme === 'dark'
              ? 'bg-[#291d24] text-amber-300 border-[#4a2e3b] hover:bg-[#34242e]'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-rose-900'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-[11px] text-amber-200">Sáng</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-rose-800" />
              <span className="hidden sm:inline text-[11px] text-slate-600">Tối</span>
            </>
          )}
        </button>

        {/* School Tag */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-rose-950 font-medium bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-100">
          <School className="w-3.5 h-3.5 text-rose-800" />
          <span className="truncate max-w-[200px]">{state.teacher.school.split('&')[0].trim()}</span>
        </div>
      </div>
    </header>
  );
};
