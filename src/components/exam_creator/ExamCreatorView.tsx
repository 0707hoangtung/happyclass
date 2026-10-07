import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { BankQuestion, QuestionType, QuestionLevel } from '../../types/index.ts';
import { QuestionEditorPanel } from './QuestionEditorPanel.tsx';
import { QuestionPreviewPanel } from './QuestionPreviewPanel.tsx';
import { QuestionBankView } from './QuestionBankView.tsx';
import { ExamBankView } from './ExamBankView.tsx';
import {
  FileEdit,
  BookCheck,
  FileCheck2,
  Sparkles,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

export const ExamCreatorView: React.FC = () => {
  const { state, createQuestion, updateQuestion, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'editor' | 'bank' | 'exams'>('editor');

  // Currently editing question in the 2-window panel (blank initial state, no fake data)
  const [currentQuestion, setCurrentQuestion] = useState<Partial<BankQuestion>>({
    subject: '',
    grade: 10,
    lesson: '',
    level: 'thong_hieu',
    type: 'multiple_choice',
    content: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    points: 0.25,
    explanation: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveQuestion = async () => {
    if (!currentQuestion.content?.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, currentQuestion);
      } else {
        await createQuestion(currentQuestion);
      }
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetEditor = () => {
    setEditingId(null);
    setCurrentQuestion({
      subject: '',
      grade: 10,
      lesson: '',
      level: 'thong_hieu',
      type: 'multiple_choice',
      content: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      points: 0.25,
      explanation: '',
    });
    showToast('Đã làm mới khung soạn câu hỏi', 'info');
  };

  const handleEditFromBank = (q: BankQuestion) => {
    setEditingId(q.id);
    setCurrentQuestion(q);
    setActiveTab('editor');
    showToast(`Đã mở câu hỏi "${q.lesson}" vào khung soạn thảo`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileEdit className="w-6 h-6 text-rose-800" />
              <span>Hệ thống soạn câu hỏi</span>
            </h2>
          </div>

          {/* Sub-Tabs navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-rose-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Soạn câu hỏi</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-rose-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookCheck className="w-3.5 h-3.5" />
              <span>Ngân hàng câu hỏi</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {(state.bankQuestions || []).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-rose-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Ngân hàng đề thi</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {(state.bankExams || []).length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: SOẠN CÂU HỎI (2 CỬA SỔ TRỰC QUAN: TRÁI - SOẠN CÂU HỎI, PHẢI - XEM TRƯỚC) */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỬA SỔ THỨ NHẤT (BÊN TRÁI): SOẠN CÂU HỎI */}
          <div className="lg:col-span-6 xl:col-span-6">
            <QuestionEditorPanel
              question={currentQuestion}
              onChange={setCurrentQuestion}
              onSave={handleSaveQuestion}
              onReset={handleResetEditor}
              isSaving={isSaving}
              isEditing={!!editingId}
            />
          </div>

          {/* CỬA SỔ THỨ HAI (BÊN PHẢI): XEM TRƯỚC THỜI GIAN THỰC */}
          <div className="lg:col-span-6 xl:col-span-6">
            <QuestionPreviewPanel question={currentQuestion} />
          </div>
        </div>
      )}

      {/* 3. TAB 2: NGÂN HÀNG CÂU HỎI & GIAO BÀI TẬP */}
      {activeTab === 'bank' && (
        <QuestionBankView onEditQuestion={handleEditFromBank} />
      )}

      {/* 4. TAB 3: NGÂN HÀNG ĐỀ THI & PHÁT ĐỀ KIỂM TRA */}
      {activeTab === 'exams' && (
        <ExamBankView />
      )}
    </div>
  );
};
