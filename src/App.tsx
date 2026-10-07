import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { ClassList } from './components/classes/ClassList.tsx';
import { ClassDetail } from './components/classes/ClassDetail.tsx';
import { ExamCreatorView } from './components/exam_creator/ExamCreatorView.tsx';
import { ResourceLibrary } from './components/resources/ResourceLibrary.tsx';
import { GlobalHomeworkView } from './components/homework/GlobalHomeworkView.tsx';
import { GlobalQuizzesView } from './components/quizzes/GlobalQuizzesView.tsx';
import { GlobalAnalyticsView } from './components/analytics/GlobalAnalyticsView.tsx';
import { HappyAIAssistant } from './components/ai/HappyAIAssistant.tsx';
import { DigitalClassTools } from './components/tools/DigitalClassTools.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentView, currentClass, toast, theme } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#131114] text-[#ede9ec]' : 'bg-[#FAF7F7] text-slate-800'} flex flex-col font-sans transition-colors duration-200`}>
      {/* 1. If not authenticated, show Teacher Login Window */}
      {!isAuthenticated && <LoginModal />}

      {/* 2. Main Layout (Left: Sidebar, Right: Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Navigation Menu */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right: Main Content Viewport */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">
          <Header onToggleMobile={() => setIsMobileSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {currentView === 'classes' && (
              currentClass ? <ClassDetail classItem={currentClass} /> : <ClassList />
            )}
            {currentView === 'exam_creator' && <ExamCreatorView />}
            {currentView === 'resources' && <ResourceLibrary />}
            {currentView === 'homework' && <GlobalHomeworkView />}
            {currentView === 'quizzes' && <GlobalQuizzesView />}
            {currentView === 'analytics' && <GlobalAnalyticsView />}
            {currentView === 'happy_ai' && <HappyAIAssistant />}
            {currentView === 'tools' && <DigitalClassTools />}
            {currentView === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              toast.type === 'success'
                ? 'bg-rose-950 text-white border-rose-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
