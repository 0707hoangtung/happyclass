import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Wrench,
  RotateCw,
  Timer,
  Users2,
  CheckCircle,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const DigitalClassTools: React.FC = () => {
  const { state, showToast } = useApp();

  const [activeTool, setActiveTool] = useState<'wheel' | 'timer' | 'teams' | 'attendance' | 'soundboard'>('wheel');
  const [selectedClassId, setSelectedClassId] = useState<string>(() => state.classes[0]?.id || '');

  const currentClass = state.classes.find((c) => c.id === selectedClassId) || state.classes[0];
  const students = state.students.filter((s) => s.classId === currentClass?.id);

  // 1. Lucky Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (students.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setWheelWinner(null);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + randomDegrees;
    setRotation(newRotation);

    playSynthSound('spin');

    setTimeout(() => {
      const winner = students[Math.floor(Math.random() * students.length)];
      setWheelWinner(winner.fullName);
      setIsSpinning(false);
      playSynthSound('applause');
      showToast(`Chúc mừng học sinh: ${winner.fullName} đã được chọn! 🎉`, 'success');
    }, 3200);
  };

  // 2. Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            playSynthSound('chime');
            showToast('Hết giờ làm bài!', 'info');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 3. Random Team Generator State
  const [numGroups, setNumGroups] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState<Array<{ name: string; members: string[] }>>([]);

  const handleGenerateGroups = () => {
    if (students.length === 0) return;
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups: Array<{ name: string; members: string[] }> = Array.from(
      { length: numGroups },
      (_, i) => ({ name: `Nhóm ${i + 1}`, members: [] })
    );

    shuffled.forEach((student, index) => {
      groups[index % numGroups].members.push(student.fullName);
    });

    setGeneratedGroups(groups);
    showToast(`Đã chia LỚP thành ${numGroups} nhóm ngẫu nhiên!`, 'success');
  };

  // 4. Quick Attendance State
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>({});

  const toggleAttendance = (studentId: string, status: 'present' | 'late' | 'absent') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // 5. Soundboard Web Audio API Synthesizer
  const playSynthSound = (type: 'applause' | 'fanfare' | 'chime' | 'spin') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.4); // C6
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.6);
        });
      } else if (type === 'applause') {
        // White noise burst for applause
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'spin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 3.0);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.0);
      }
    } catch {
      // AudioContext not allowed or supported
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Class Selector */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-800" />
            <span>Bộ công cụ số & tiện ích lớp học</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Các tiện ích tương tác trực tiếp trên lớp học: Vòng quay may mắn, Đồng hồ bấm giờ, Chia nhóm, Điểm danh & Khen thưởng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Đang chọn:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none cursor-pointer"
          >
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                LỚP {c.name} ({c.subject})
              </option>
            ))}
            {state.classes.length === 0 && (
              <option value="">Chưa có lớp học nào</option>
            )}
          </select>
        </div>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'wheel', label: 'Vòng quay may mắn', icon: RotateCw },
          { id: 'timer', label: 'Đồng hồ bấm giờ', icon: Timer },
          { id: 'teams', label: 'Chia nhóm ngẫu nhiên', icon: Users2 },
          { id: 'attendance', label: 'Điểm danh nhanh', icon: CheckCircle },
          { id: 'soundboard', label: 'Âm thanh khen thưởng', icon: Volume2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-900 text-white shadow-2xs'
                  : 'bg-white border border-rose-100 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool 1: Vòng quay may mắn (Lucky Wheel) */}
      {activeTool === 'wheel' && (
        <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-2xs text-center space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Vòng quay gọi tên học sinh ngẫu nhiên
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Khởi động tiết học vui nhộn, gọi học sinh lên bảng phát biểu hoặc trả lời câu hỏi.
            </p>
          </div>

          {/* Wheel Graphic */}
          <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
            {/* Pointer */}
            <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-900 drop-shadow-md" />

            {/* Rotating Disc */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-300 shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-[3200ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: 'conic-gradient(#7a1832 0deg 45deg, #f59e0b 45deg 90deg, #9e1d3a 90deg 135deg, #d97706 135deg 180deg, #5c0e22 180deg 225deg, #b45309 225deg 270deg, #be123c 270deg 315deg, #fbbf24 315deg 360deg)',
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center font-bold text-xs text-rose-900 ring-4 ring-rose-950/20">
                Happy
              </div>
            </div>
          </div>

          {wheelWinner && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-sm mx-auto text-amber-950 animate-bounce">
              <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-amber-800 font-semibold">Học sinh được chọn:</p>
              <h4 className="text-xl font-extrabold text-rose-900 mt-0.5">{wheelWinner}</h4>
            </div>
          )}

          <button
            onClick={spinWheel}
            disabled={isSpinning || students.length === 0}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-rose-950 font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSpinning ? 'Đang quay...' : 'Quay ngay 🎯'}
          </button>
        </div>
      )}

      {/* Tool 2: Đồng hồ bấm giờ (Timer) */}
      {activeTool === 'timer' && (
        <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-2xs text-center space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Đồng hồ đếm ngược làm bài & thảo luận
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm soát thời lượng thảo luận nhóm, làm bài tập nhanh hoặc kiểm tra 15 phút.
            </p>
          </div>

          <div className="text-6xl sm:text-7xl font-mono font-extrabold text-slate-900 tabular-nums py-6 bg-slate-50 rounded-2xl max-w-md mx-auto border border-slate-200 shadow-inner">
            {formatTimer(timerSeconds)}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '1 phút', secs: 60 },
              { label: '3 phút', secs: 180 },
              { label: '5 phút', secs: 300 },
              { label: '10 phút', secs: 600 },
              { label: '15 phút', secs: 900 },
              { label: '45 phút', secs: 2700 },
            ].map((p) => (
              <button
                key={p.secs}
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(p.secs);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 cursor-pointer shadow-md ${
                isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-900 hover:bg-rose-800'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu đếm'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(300);
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
              title="Đặt lại 5 phút"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tool 3: Chia nhóm ngẫu nhiên (Team Generator) */}
      {activeTool === 'teams' && (
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chia nhóm ngẫu nhiên lớp {currentClass?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Sĩ số: {students.length} học sinh
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">Số lượng nhóm:</label>
              <select
                value={numGroups}
                onChange={(e) => setNumGroups(Number(e.target.value))}
                className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {[2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} nhóm
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerateGroups}
                className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Chia nhóm ngẫu nhiên
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {generatedGroups.map((grp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-rose-900">{grp.name}</h4>
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    {grp.members.length} học sinh
                  </span>
                </div>
                <ul className="text-xs text-slate-700 divide-y divide-slate-100">
                  {grp.members.map((m, mIdx) => (
                    <li key={mIdx} className="py-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {generatedGroups.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Users2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Bấm nút "Chia nhóm ngẫu nhiên" ở trên để phân chia học sinh vào các nhóm.</p>
            </div>
          )}
        </div>
      )}

      {/* Tool 4: Điểm danh nhanh (Quick Attendance) */}
      {activeTool === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Điểm danh tiết học lớp {currentClass?.name}
              </h3>
              <p className="text-xs text-slate-500">
                Ngày: {new Date().toLocaleDateString('vi-VN')} · Sĩ số: {students.length} học sinh
              </p>
            </div>
            <button
              onClick={() => {
                const allPresent: any = {};
                students.forEach((s) => (allPresent[s.id] = 'present'));
                setAttendance(allPresent);
                showToast('Đã đánh dấu có mặt cho tất cả học sinh!', 'success');
              }}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Có mặt tất cả ✓
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã số</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3 text-right">Trạng thái điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st, i) => {
                  const status = attendance[st.id] || 'present';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-mono">{st.studentCode}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{st.fullName}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => toggleAttendance(st.id, 'present')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Có mặt
                          </button>
                          <button
                            onClick={() => toggleAttendance(st.id, 'late')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                              status === 'late'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Đi muộn
                          </button>
                          <button
                            onClick={() => toggleAttendance(st.id, 'absent')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                              status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Vắng mặt
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tool 5: Âm thanh khen thưởng (Classroom Soundboard) */}
      {activeTool === 'soundboard' && (
        <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-2xs space-y-6 text-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Bảng âm thanh khen thưởng & khích lệ sư phạm
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phát âm thanh trực tiếp trên lớp học để tuyên dương câu trả lời hay hoặc kết thúc giờ làm bài.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            <button
              onClick={() => playSynthSound('applause')}
              className="p-5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold text-sm flex flex-col items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-7 h-7 text-amber-600" />
              <span>Tràng pháo tay 👏</span>
              <span className="text-[10px] text-amber-700/80 font-normal">Khen ngợi bài phát biểu</span>
            </button>

            <button
              onClick={() => playSynthSound('fanfare')}
              className="p-5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 font-bold text-sm flex flex-col items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Trophy className="w-7 h-7 text-rose-700" />
              <span>Khúc nhạc chiến thắng 🎺</span>
              <span className="text-[10px] text-rose-700/80 font-normal">Đạt điểm tuyệt đối 10</span>
            </button>

            <button
              onClick={() => playSynthSound('chime')}
              className="p-5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 font-bold text-sm flex flex-col items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Volume2 className="w-7 h-7 text-blue-600" />
              <span>Tiếng chuông kết thúc 🔔</span>
              <span className="text-[10px] text-blue-700/80 font-normal">Báo hết giờ thảo luận</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
