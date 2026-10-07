import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { LearningResource } from '../../types/index.ts';
import {
  FolderArchive,
  Plus,
  Search,
  FileText,
  Presentation,
  Network,
  Video,
  FileCheck2,
  Download,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';

export const ResourceLibrary: React.FC = () => {
  const { state, createNewResource, removeResource, showToast, isStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LearningResource['type']>('giao_an');
  const [grade, setGrade] = useState<number>(10);
  const [subject, setSubject] = useState(state.teacher.subject || 'Toán học');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('DOCX / PDF');
  const [isSaving, setIsSaving] = useState(false);

  const filteredResources = state.resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || res.type === typeFilter;
    const matchesGrade = gradeFilter === 'all' || res.grade === Number(gradeFilter);
    return matchesSearch && matchesType && matchesGrade;
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await createNewResource({
        title: title.trim(),
        type,
        grade: Number(grade),
        subject: subject.trim(),
        author: state.teacher.fullName,
        description: description.trim(),
        format,
        fileSize: '2.4 MB',
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (t: LearningResource['type']) => {
    switch (t) {
      case 'giao_an':
        return <FileText className="w-5 h-5 text-rose-800" />;
      case 'bai_giang_slide':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'so_do_tu_duy':
        return <Network className="w-5 h-5 text-indigo-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'de_kiem_tra':
        return <FileCheck2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getTypeName = (t: LearningResource['type']) => {
    switch (t) {
      case 'giao_an': return 'Giáo án CV 5512';
      case 'bai_giang_slide': return 'Slide bài giảng';
      case 'so_do_tu_duy': return 'Sơ đồ tư duy';
      case 'video': return 'Video mô phỏng';
      case 'de_kiem_tra': return 'Đề kiểm tra mẫu';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-rose-800" />
            <span>Kho học liệu số & giáo án điện tử</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thư viện kế hoạch bài dạy chuẩn Công văn 5512, slide trực quan, video thí nghiệm và đề kiểm tra chuẩn Bộ GD&ĐT.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học liệu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm học liệu theo tiêu đề, tác giả, nội dung..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/30 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Type filters */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'all', label: 'Tất cả học liệu' },
              { id: 'giao_an', label: 'Giáo án 5512' },
              { id: 'bai_giang_slide', label: 'Slide bài giảng' },
              { id: 'so_do_tu_duy', label: 'Sơ đồ tư duy' },
              { id: 'video', label: 'Video bài giảng' },
              { id: 'de_kiem_tra', label: 'Đề kiểm tra' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-rose-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả khối lớp</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Khối {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  {getTypeIcon(res.type)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
                    Khối {res.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {res.format}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-rose-800 tracking-wider block mt-3">
                {getTypeName(res.type)}
              </span>

              <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
                {res.title}
              </h4>

              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Tác giả: <strong className="text-slate-700">{res.author}</strong></span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => showToast(`Đang tải học liệu "${res.title}"...`, 'info')}
                  className="p-1.5 text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Tải về tài liệu"
                >
                  <Download className="w-4 h-4" />
                </button>
                {!isStudent && (
                  <button
                    onClick={() => removeResource(res.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa học liệu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Thêm học liệu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Thêm học liệu mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề học liệu *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Kế hoạch bài dạy (Giáo án 5512) - Bài 3..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại học liệu
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  >
                    <option value="giao_an">Giáo án CV 5512</option>
                    <option value="bai_giang_slide">Slide bài giảng</option>
                    <option value="so_do_tu_duy">Sơ đồ tư duy</option>
                    <option value="video">Video bài giảng</option>
                    <option value="de_kiem_tra">Đề kiểm tra mẫu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Định dạng file
                  </label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="PDF, DOCX, PPTX..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả tóm tắt nội dung
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nội dung chính, mục tiêu năng lực cần đạt..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu học liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
