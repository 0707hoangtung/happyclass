import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Lock, Mail, Eye, EyeOff, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState<string>('07071987hoangtung@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Gmail giáo viên');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ok = await login(email.trim(), password);
      if (!ok) {
        setErrorMsg('Mật khẩu đăng nhập không chính xác. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng nhập hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-100">
        {/* Wine Burgundy Header Banner */}
        <div className="relative bg-gradient-to-br from-[#5c0e22] via-[#7a1832] to-[#400715] text-white p-7 text-center overflow-hidden">
          {/* Subtle gold decorative glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* School Emblem / Crest */}
          <div className="relative mx-auto mb-3 w-16 h-16 rounded-full bg-white/10 p-1 ring-2 ring-amber-300/40 shadow-inner flex items-center justify-center">
            <img
              src="/src/assets/images/happy_class_crest_1791218886710.jpg"
              alt="HAPPY CLASS Crest"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-amber-200">
            Happy class
          </h2>
          <p className="text-xs text-rose-100/90 mt-1 font-medium tracking-wide">
            Cổng đăng nhập giáo viên & quản lý lớp học
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5 bg-gradient-to-b from-white to-[#FDF8F9]">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 animate-shake">
              <span className="shrink-0 w-2 h-2 rounded-full bg-rose-600"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wider mb-1.5">
              Gmail giáo viên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 text-rose-800" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.giao.vien@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/40 focus:border-rose-800 transition-all text-slate-800 placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wider">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-rose-800" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của Thầy/Cô..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800/40 focus:border-rose-800 transition-all text-slate-800 placeholder:text-slate-400 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-rose-800 focus:ring-rose-800 cursor-pointer accent-rose-800"
              />
              <span>Ghi nhớ phiên đăng nhập</span>
            </label>
            <span className="text-slate-400 italic">Đồng bộ đa thiết bị tức thì</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#7a1832] to-[#5c0e22] hover:from-[#8e1f3d] hover:to-[#6d132b] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-amber-200" />
                <span>Đăng nhập vào hệ thống</span>
              </>
            )}
          </button>
        </form>

        {/* Footer features */}
        <div className="px-7 py-3.5 bg-rose-50/50 border-t border-rose-100 flex items-center justify-around text-[11px] text-rose-900 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Đồng bộ thời gian thực
          </span>
          <span className="text-rose-300">·</span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-rose-700" /> Chuẩn Bộ Giáo Dục
          </span>
        </div>
      </div>
    </div>
  );
};
