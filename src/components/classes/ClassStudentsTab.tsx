import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassItem, Student } from '../../types/index.ts';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Star,
  Search,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as api from '../../services/api.ts';

export const ClassStudentsTab: React.FC<{ classItem: ClassItem }> = ({ classItem }) => {
  const { state, addStudentsToClass, editStudent, removeStudent, showToast, isStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Manual student form
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [birthDate, setBirthDate] = useState('2009-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [initialStars, setInitialStars] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Excel upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelStudents, setExcelStudents] = useState<Partial<Student>[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);

  // Editing student modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Deleting student confirmation modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  const students = state.students.filter((s) => s.classId === classItem.id);

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Manual Add
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSaving(true);
    try {
      const generatedCode = studentCode.trim() || `HS${classItem.grade}-${Math.floor(100 + Math.random() * 900)}`;
      await addStudentsToClass(classItem.id, {
        fullName: fullName.trim(),
        studentCode: generatedCode,
        birthDate,
        gender,
        stars: Number(initialStars) || 0,
        notes: notes.trim(),
      });
      setIsManualModalOpen(false);
      setFullName('');
      setStudentCode('');
      setNotes('');
      setInitialStars(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Confirm Delete Student
  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      await removeStudent(studentToDelete.id);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Failed to delete student', err);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // Handle Excel File Selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showToast('Vui lòng chọn file Excel có đuôi định dạng .xlsx', 'error');
      return;
    }

    setExcelFileName(file.name);
    setIsParsingExcel(true);
    try {
      const parsed = await api.parseStudentsFromExcel(file);
      setExcelStudents(parsed);
      if (parsed.length === 0) {
        showToast('Không tìm thấy dữ liệu học sinh trong file. Vui lòng kiểm tra file mẫu.', 'info');
      } else {
        showToast(`Đã nhận diện ${parsed.length} học sinh từ file Excel!`, 'success');
      }
    } catch (err: any) {
      showToast('Lỗi khi đọc file Excel: ' + (err.message || 'Sai định dạng'), 'error');
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Submit Excel Batch to Backend
  const handleImportExcelBatch = async () => {
    if (excelStudents.length === 0) return;
    setIsUploadingExcel(true);
    try {
      await addStudentsToClass(classItem.id, excelStudents);
      setIsExcelModalOpen(false);
      setExcelStudents([]);
      setExcelFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingExcel(false);
    }
  };

  // Quick Star Increment / Decrement
  const handleUpdateStar = async (student: Student, delta: number) => {
    const nextStars = Math.max(0, (student.stars || 0) + delta);
    await editStudent(student.id, { stars: nextStars });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã số học sinh..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/30 text-slate-800"
          />
        </div>

        {!isStudent && (
          <div className="flex items-center gap-2">
            {/* Button: Nhập file Excel (.xlsx) */}
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Tải lên Excel (.xlsx)</span>
            </button>

            {/* Button: Thêm học sinh thủ công */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm thủ công</span>
            </button>
          </div>
        )}
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-rose-100/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50/70 border-b border-rose-100 text-slate-700 text-xs font-bold tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Mã số</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Ngày sinh</th>
                <th className="py-3 px-4">Giới tính</th>
                <th className="py-3 px-4 text-center">Ngôi sao tích lũy ⭐</th>
                <th className="py-3 px-4">Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.map((st, idx) => (
                <tr key={st.id} className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-3 px-4 text-center font-semibold text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">
                    {st.studentCode}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {st.fullName}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                    {st.birthDate}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        st.gender === 'Nữ'
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {st.gender}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span className="font-extrabold text-amber-900 tabular-nums">
                        {st.stars || 0}
                      </span>
                      {!isStudent && (
                        <div className="flex items-center ml-1 border-l border-amber-300 pl-1.5 gap-1">
                          <button
                            onClick={() => handleUpdateStar(st, 1)}
                            title="Thưởng 1 sao"
                            className="w-4 h-4 rounded text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleUpdateStar(st, -1)}
                            title="Trừ 1 sao"
                            className="w-4 h-4 rounded text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                    {st.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isStudent && (
                        <button
                          onClick={() => setEditingStudent(st)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {!isStudent && (
                        <button
                          onClick={() => setStudentToDelete(st)}
                          title="Xóa học sinh này"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Chưa có học sinh nào trong danh sách</p>
            <p className="text-xs text-slate-400 mt-1">
              Thầy/Cô hãy thêm học sinh bằng cách bấm "Thêm thủ công" hoặc "Tải lên Excel (.xlsx)".
            </p>
          </div>
        )}
      </div>

      {/* Modal: Thêm học sinh thủ công */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Thêm học sinh mới</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder={`HS${classItem.grade}-...`}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số sao ban đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialStars}
                    onChange={(e) => setInitialStars(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú sư phạm
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tính cách, thế mạnh hoặc lưu ý cần bồi dưỡng..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nhập từ file Excel (.xlsx) */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">
                  Nhập danh sách học sinh từ file Excel (.xlsx)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelStudents([]);
                }}
                className="p-1 text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Instructions & Template Download */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <div>
                  <p className="font-bold">Định dạng file yêu cầu: .xlsx hoặc .xls</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Các cột: Mã học sinh, Họ và tên, Ngày sinh, Giới tính, Ghi chú.
                  </p>
                </div>
                <button
                  onClick={api.downloadSampleExcelTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-900 border border-emerald-300 font-semibold rounded-lg hover:bg-emerald-100 cursor-pointer shadow-2xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tải file mẫu .xlsx</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-xl p-6 text-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer"
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  {excelFileName ? `Đã chọn file: ${excelFileName}` : 'Bấm vào đây để chọn file Excel (.xlsx)'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ tự động phân tích và hiển thị danh sách xem trước</p>
              </div>

              {/* Preview table of parsed students */}
              {excelStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                    <span>Xem trước dữ liệu ({excelStudents.length} học sinh):</span>
                    <span className="text-emerald-700 font-bold">Sẵn sàng nhập</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Mã</th>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3">Ngày sinh</th>
                          <th className="py-2 px-3">Giới tính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelStudents.map((st, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono">{st.studentCode}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-800">{st.fullName}</td>
                            <td className="py-1.5 px-3 text-slate-500">{st.birthDate}</td>
                            <td className="py-1.5 px-3">{st.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsExcelModalOpen(false);
                    setExcelStudents([]);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleImportExcelBatch}
                  disabled={excelStudents.length === 0 || isUploadingExcel}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingExcel ? 'Đang nhập dữ liệu...' : `Xác nhận nhập ${excelStudents.length} học sinh`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa học sinh */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#5c0e22] to-[#7a1832] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Cập nhật thông tin học sinh</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await editStudent(editingStudent.id, {
                  fullName: editingStudent.fullName,
                  studentCode: editingStudent.studentCode,
                  birthDate: editingStudent.birthDate,
                  gender: editingStudent.gender,
                  stars: editingStudent.stars,
                  notes: editingStudent.notes,
                });
                setEditingStudent(null);
              }}
              className="p-5 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh
                  </label>
                  <input
                    type="text"
                    value={editingStudent.studentCode}
                    onChange={(e) => setEditingStudent({ ...editingStudent, studentCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editingStudent.birthDate}
                    onChange={(e) => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số sao tích lũy ⭐
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingStudent.stars || 0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editingStudent.notes || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800/40 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Xác nhận Xóa Học Sinh */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa học sinh</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Bạn có chắc chắn muốn xóa học sinh <strong className="text-rose-950 font-bold">{studentToDelete.fullName}</strong> {studentToDelete.studentCode ? `(Mã: ${studentToDelete.studentCode})` : ''} khỏi lớp học?
                </p>
                <div className="mt-3 p-3 bg-rose-50/80 rounded-xl border border-rose-200/80 text-xs text-rose-800 text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>Toàn bộ dữ liệu điểm danh, kết quả bài tập và số sao tích lũy của học sinh này sẽ bị xóa khỏi hệ thống và không thể khôi phục.</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={handleConfirmDeleteStudent}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingStudent ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
