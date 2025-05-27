
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { RealFolderComparisonDashboard } from '@/components/RealFolderComparisonDashboard';
import { RealComparisonEngine } from '@/components/RealComparisonEngine';
import { RealResultsViewer } from '@/components/RealResultsViewer';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type ApplicationView = 'dashboard' | 'processing' | 'results';

const AppContent = () => {
  const { user, signOut, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ApplicationView>('dashboard');
  const [currentProject, setCurrentProject] = useState(null);

  const handleStartComparison = (project: any) => {
    setCurrentProject(project);
    setCurrentView('processing');
  };

  const handleComparisonComplete = (results: any) => {
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentProject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">📚</span>
          </div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <NavigationHeader 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onBackToDashboard={handleBackToDashboard}
      />
      
      {/* User Menu */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={signOut}
          className="flex items-center space-x-2 space-x-reverse"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
      
      <main className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && (
          <RealFolderComparisonDashboard onStartComparison={handleStartComparison} />
        )}
        
        {currentView === 'processing' && currentProject && (
          <RealComparisonEngine 
            project={currentProject}
            onComplete={handleComparisonComplete}
          />
        )}
        
        {currentView === 'results' && currentProject && (
          <RealResultsViewer 
            projectId={currentProject.id}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
