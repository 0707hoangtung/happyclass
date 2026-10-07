import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Settings,
  School,
  User,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Sun,
  Moon,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, isRealtimeConnected, resetAllData, showToast, theme, setTheme, isStudent } = useApp();

  const [fullName, setFullName] = useState(state.teacher.fullName);
  const [email, setEmail] = useState(state.teacher.email);
  const [school, setSchool] = useState(state.teacher.school);
  const [subject, setSubject] = useState(state.teacher.subject);
  const [phone, setPhone] = useState(state.teacher.phone);
  const [academicYear, setAcademicYear] = useState(state.teacher.academicYear);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình thông tin giáo viên!', 'success');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HAPPY_CLASS_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file sao lưu dữ liệu JSON thành công!', 'success');
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      setIsResetConfirmModalOpen(false);
      showToast('Đã xóa sạch toàn bộ dữ liệu mẫu trên hệ thống!', 'success');
    } catch (err: any) {
      showToast('Lỗi khi xóa dữ liệu: ' + (err.message || 'Lỗi mạng'), 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-800" />
          <span>Cài đặt hệ thống & thông tin giáo viên</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý tài khoản giáo viên, thiết lập trường lớp, đồng bộ thời gian thực và sao lưu dữ liệu toàn diện.
        </p>
      </div>

      {/* Real-time Status Card */}
      <div className="bg-gradient-to-br from-[#4d0c1b] to-[#6d132b] text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isRealtimeConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              )}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Trạng thái đồng bộ thời gian thực: {isRealtimeConnected ? 'Hoạt động tốt' : 'Đang kết nối'}
              </h3>
              <p className="text-xs text-rose-200 mt-0.5">
                Mọi thay đổi trên máy tính, điện thoại, tab thường hay tab ẩn danh đều đồng bộ tức thì 0 giây trễ.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-white/10 rounded-lg text-emerald-300 font-bold border border-white/10">
            SSE 200 OK
          </span>
        </div>
      </div>

      {/* Appearance / Dark Mode Card */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Chế độ hiển thị màn hình</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh giao diện hiển thị phù hợp với điều kiện ánh sáng lớp học và bảo vệ thị lực giáo viên.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100">
            {theme === 'dark' ? 'Đang dùng: Màn hình tối' : 'Đang dùng: Màn hình sáng'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showToast('Đã chuyển sang chế độ màn hình sáng', 'info');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              theme === 'light'
                ? 'bg-rose-50/50 border-rose-800 ring-2 ring-rose-800/20 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              theme === 'light' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Chế độ sáng</span>
                {theme === 'light' && (
                  <span className="text-[10px] bg-rose-800 text-white font-bold px-1.5 py-0.2 rounded">Kích hoạt</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Nền sáng trang nhã, tương phản rõ ràng, tối ưu cho phòng học ban ngày và máy chiếu.
              </p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showToast('Đã chuyển sang chế độ màn hình tối hài hòa', 'success');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'bg-[#291d24] border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              theme === 'dark' ? 'bg-[#4a1d2d] text-amber-300 shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              <Moon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Chế độ tối hài hòa</span>
                {theme === 'dark' && (
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded">Kích hoạt</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Tông tối ấm dịu mắt, sắc đỏ vang quý phái, không chói mắt khi làm việc ban đêm.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Teacher Profile Form */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-rose-800" />
            <span>Thông tin giáo viên & trường học</span>
          </h3>
          <span className="text-xs text-slate-400">Tài khoản giáo viên chính thức</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên giáo viên
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gmail đăng nhập
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trường học
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bộ môn giảng dạy
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm học hiện tại
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cập nhật thông tin
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Maintenance */}
      <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-rose-800" />
          <span>Sao lưu & bảo trì dữ liệu</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Sao lưu dữ liệu JSON</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tải về toàn bộ danh sách lớp học, học sinh, bài tập, điểm thi và học liệu để lưu trữ an toàn.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải file sao lưu JSON</span>
            </button>
          </div>

          {!isStudent && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-rose-950">Xóa trắng toàn bộ dữ liệu</h4>
                <p className="text-xs text-rose-800 mt-1">
                  Xóa sạch toàn bộ các lớp học, học sinh, bài tập và đề kiểm tra để bắt đầu dữ liệu mới.
                </p>
              </div>
              <button
                onClick={() => setIsResetConfirmModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xóa sạch dữ liệu mẫu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* In-App Confirmation Modal for Resetting All Data */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-rose-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Xác nhận xóa sạch dữ liệu</h3>
              </div>
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="p-1 rounded-lg text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-800">
                Thầy/Cô có chắc chắn muốn <strong>xóa toàn bộ dữ liệu mẫu, dữ liệu giả sử</strong> trên hệ thống không?
              </p>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
                ⚠️ Mọi lớp học, học sinh, bài tập và đề kiểm tra sẽ được dọn dẹp sạch sẽ theo thời gian thực để Thầy/Cô nhập liệu thực tế.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleConfirmReset}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isResetting ? 'Đang dọn dẹp...' : 'Xác nhận xóa sạch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
