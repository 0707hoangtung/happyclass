import React from 'react';
import { useApp, MainNavView } from '../context/AppContext.tsx';
import {
  Users,
  FolderArchive,
  BookCheck,
  FileCheck2,
  LineChart,
  Bot,
  Wrench,
  Settings,
  Sparkles,
  LogOut,
  Radio,
  School,
  ChevronRight,
  FileEdit,
  GraduationCap,
  User,
} from 'lucide-react';
import crestImg from '../assets/images/happy_class_crest_1791218886710.jpg';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    closeClass,
    selectedClassId,
    state,
    isRealtimeConnected,
    logout,
    userRole,
    setUserRole,
    isTeacher,
    isStudent,
  } = useApp();

  const menuItems: { id: MainNavView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'classes', label: 'Lớp học', icon: Users, badge: `${state.classes.length}` },
    { id: 'exam_creator', label: 'Soạn đề', icon: FileEdit, badge: `${(state.bankQuestions || []).length}` },
    { id: 'homework', label: 'Bài tập', icon: BookCheck, badge: `${state.homeworks.length}` },
    { id: 'quizzes', label: 'Kiểm tra', icon: FileCheck2, badge: `${state.quizzes.length}` },
    { id: 'resources', label: 'Kho học liệu', icon: FolderArchive, badge: `${state.resources.length}` },
    { id: 'analytics', label: 'Phân tích học tập', icon: LineChart },
    { id: 'happy_ai', label: 'Happy AI', icon: Bot, badge: 'AI Sư phạm' },
    { id: 'tools', label: 'Công cụ số', icon: Wrench },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleNavClick = (viewId: MainNavView) => {
    setCurrentView(viewId);
    if (viewId !== 'classes') {
      closeClass();
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#520d1e] text-white flex flex-col border-r border-[#6e152d] shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Brand Header */}
        <div className="p-5 border-b border-[#6e152d] flex items-center justify-between bg-[#460918]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-amber-300/40 p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={crestImg}
                alt="Happy class"
                className="w-full h-full rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-amber-200 leading-none">
                Happy class
              </h1>
              <p className="text-[11px] text-rose-200/80 font-medium mt-1">Lớp học hạnh phúc</p>
            </div>
          </div>
        </div>

        {/* Real-Time Sync Indicator */}
        <div className="px-5 py-2.5 bg-[#3e0714] text-[11px] flex items-center justify-between border-b border-[#641429]">
          <div className="flex items-center gap-2 text-rose-100">
            <span className="relative flex h-2 w-2">
              {isRealtimeConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              )}
            </span>
            <span className="font-medium">
              {isRealtimeConnected ? 'Thời gian thực (0s trễ)' : 'Đang kết nối lại...'}
            </span>
          </div>
          <span className="text-[10px] text-rose-300/80 tracking-wider font-semibold">
            Đồng bộ 100%
          </span>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-rose-300/60 tracking-wider">
            Danh mục chính
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-800 to-[#7a1832] text-white shadow-md shadow-black/20 ring-1 ring-white/10'
                    : 'text-rose-100/85 hover:bg-[#661327] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-300' : 'text-rose-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-rose-950/60 text-amber-200'
                        : 'bg-[#3e0714] text-rose-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Teacher / Student Profile & Logout */}
        <div className="p-4 border-t border-[#6e152d] bg-[#420917] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-300 text-rose-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {isStudent ? 'HS' : 'HT'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {isStudent ? 'Học sinh kiểm tra' : state.teacher.fullName}
                </p>
                <p className="text-[10px] text-rose-200/70 truncate">
                  {isStudent ? 'Tài khoản học sinh' : state.teacher.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick role toggle in sidebar */}
          <div className="pt-2 border-t border-[#5c0e22] flex items-center justify-between text-[11px]">
            <span className="text-rose-200/70">Tài khoản:</span>
            <div className="flex items-center bg-[#2d050f] p-0.5 rounded-lg border border-[#6e152d]">
              <button
                type="button"
                onClick={() => setUserRole('teacher')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  isTeacher
                    ? 'bg-rose-800 text-white shadow-2xs'
                    : 'text-rose-300/70 hover:text-white'
                }`}
              >
                Giáo viên
              </button>
              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  isStudent
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-rose-300/70 hover:text-white'
                }`}
              >
                Học sinh
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
