
import React, { useState } from 'react';
import { FolderComparisonDashboard } from '@/components/FolderComparisonDashboard';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultsManager } from '@/components/ResultsManager';
import { NavigationHeader } from '@/components/NavigationHeader';

type ApplicationView = 'dashboard' | 'processing' | 'results';

const Index = () => {
  const [currentView, setCurrentView] = useState<ApplicationView>('dashboard');
  const [comparisonData, setComparisonData] = useState(null);

  const handleStartComparison = (data: any) => {
    setComparisonData(data);
    setCurrentView('processing');
  };

  const handleComparisonComplete = (results: any) => {
    setComparisonData(results);
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setComparisonData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <NavigationHeader 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onBackToDashboard={handleBackToDashboard}
      />
      
      <main className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && (
          <FolderComparisonDashboard onStartComparison={handleStartComparison} />
        )}
        
        {currentView === 'processing' && (
          <ProgressTracker 
            comparisonData={comparisonData}
            onComplete={handleComparisonComplete}
          />
        )}
        
        {currentView === 'results' && (
          <ResultsManager 
            results={comparisonData}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
