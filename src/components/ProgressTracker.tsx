
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pause, Square, Clock, FileText, CheckCircle, Search } from 'lucide-react';

interface ProgressTrackerProps {
  comparisonData: any;
  onComplete: (results: any) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  comparisonData,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('تحليل الملفات');
  const [statistics, setStatistics] = useState({
    totalPages: 300,
    processedPages: 0,
    identicalPages: 0,
    differentPages: 0,
    newQuestions: 0,
    estimatedTimeRemaining: '15 دقيقة'
  });
  const [isPaused, setIsPaused] = useState(false);

  const phases = [
    'تحليل الملفات',
    'مقارنة الصفحات',
    'استخراج الأسئلة',
    'تحليل OCR',
    'إنشاء التقارير'
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 3, 100);
        
        // Update current phase based on progress
        const phaseIndex = Math.floor((newProgress / 100) * phases.length);
        setCurrentPhase(phases[Math.min(phaseIndex, phases.length - 1)]);

        // Update statistics
        setStatistics(prev => ({
          ...prev,
          processedPages: Math.floor((newProgress / 100) * prev.totalPages),
          identicalPages: Math.floor((newProgress / 100) * prev.totalPages * 0.8),
          differentPages: Math.floor((newProgress / 100) * prev.totalPages * 0.2),
          newQuestions: Math.floor((newProgress / 100) * 45),
          estimatedTimeRemaining: `${Math.max(1, Math.floor(15 - (newProgress / 100) * 15))} دقيقة`
        }));

        // Complete when reaching 100%
        if (newProgress >= 100) {
          setTimeout(() => {
            const results = {
              ...comparisonData,
              statistics: {
                totalPages: 300,
                identicalPages: 240,
                differentPages: 60,
                newQuestions: 45,
                processingTime: '12 دقيقة'
              },
              completedAt: new Date().toISOString()
            };
            onComplete(results);
          }, 1000);
        }

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused, onComplete, comparisonData]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    // Handle cancellation logic
    console.log('Comparison cancelled');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">جاري المقارنة...</h2>
        <p className="text-slate-600">{comparisonData?.projectName}</p>
      </div>

      {/* Main Progress Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-slate-800 flex items-center justify-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{currentPhase}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-slate-600">
              <span>{Math.round(progress)}% ({statistics.processedPages}/{statistics.totalPages} صفحة)</span>
              <span className="flex items-center space-x-1 space-x-reverse">
                <Clock className="w-4 h-4" />
                <span>الوقت المتبقي: {statistics.estimatedTimeRemaining}</span>
              </span>
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="flex justify-center space-x-4 space-x-reverse">
            {phases.map((phase, index) => {
              const phaseProgress = (progress / 100) * phases.length;
              const isActive = index <= phaseProgress;
              const isCurrent = Math.floor(phaseProgress) === index;
              
              return (
                <div key={phase} className="flex flex-col items-center space-y-1">
                  <div className={`
                    w-3 h-3 rounded-full transition-colors
                    ${isActive ? 'bg-blue-500' : 'bg-slate-300'}
                    ${isCurrent ? 'animate-pulse' : ''}
                  `} />
                  <span className={`text-xs ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                    {phase}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 space-x-reverse">
            <Button 
              variant="outline"
              onClick={handlePause}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Pause className="w-4 h-4" />
              <span>{isPaused ? 'استكمال' : 'إيقاف مؤقت'}</span>
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancel}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Square className="w-4 h-4" />
              <span>إلغاء</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.identicalPages}</div>
            <div className="text-sm text-slate-600">صفحات متطابقة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.differentPages}</div>
            <div className="text-sm text-slate-600">صفحات مختلفة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.newQuestions}</div>
            <div className="text-sm text-slate-600">أسئلة جديدة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</div>
            <div className="text-sm text-slate-600">نسبة الإنجاز</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
            <Search className="w-5 h-5" />
            <span>النشاط المباشر</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <Badge variant="secondary">معلومات</Badge>
              <span className="text-slate-600">تم العثور على سؤال جديد في الصفحة 127</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <Badge variant="secondary">معلومات</Badge>
              <span className="text-slate-600">مقارنة الصفحات 120-130 مكتملة</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <Badge variant="secondary">معلومات</Badge>
              <span className="text-slate-600">تحليل OCR للوحدة الثالثة قيد التنفيذ</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
