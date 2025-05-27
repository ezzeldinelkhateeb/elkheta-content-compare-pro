
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Users, Settings } from 'lucide-react';

interface NavigationHeaderProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onBackToDashboard: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentView,
  onNavigate,
  onBackToDashboard
}) => {
  return (
    <header className="bg-white shadow-lg border-b border-slate-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">الخطة</h1>
              <p className="text-sm text-slate-600">منصة مقارنة المحتوى التعليمي</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {currentView !== 'dashboard' && (
              <Button 
                variant="outline" 
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </Button>
            )}
            
            {/* Team Status */}
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>الفريق المتصل: 3 أعضاء</span>
            </div>

            {/* Network Status */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">متصل بالشبكة</span>
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
