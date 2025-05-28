
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateProject } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';

interface ComparisonEngineProps {
  project: any;
  onComplete: (results: any) => void;
}

export const RealComparisonEngine: React.FC<ComparisonEngineProps> = ({
  project,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('تحضير الملفات');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const updateProject = useUpdateProject();

  const phases = [
    'تحضير الملفات',
    'مقارنة الصور',
    'استخراج النصوص',
    'استخراج الأسئلة',
    'إنشاء التقارير'
  ];

  useEffect(() => {
    if (project && !isProcessing) {
      startRealComparison();
    }
  }, [project]);

  // Poll for progress updates
  useEffect(() => {
    if (!isProcessing) return;

    const pollProgress = async () => {
      try {
        const { data: updatedProject } = await supabase
          .from('projects')
          .select('progress, status')
          .eq('id', project.id)
          .single();

        if (updatedProject) {
          setProgress(updatedProject.progress);
          
          if (updatedProject.status === 'completed') {
            setIsProcessing(false);
            onComplete({ projectId: project.id });
            return;
          }
          
          if (updatedProject.status === 'failed') {
            setIsProcessing(false);
            toast({
              title: "خطأ في المقارنة",
              description: "حدث خطأ أثناء معالجة المشروع",
              variant: "destructive"
            });
            return;
          }
        }

        // Get latest logs
        const { data: latestLogs } = await supabase
          .from('processing_logs')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (latestLogs) {
          setLogs(latestLogs);
          if (latestLogs.length > 0) {
            setCurrentPhase(latestLogs[0].phase || 'معالجة');
          }
        }

      } catch (error) {
        console.error('Error polling progress:', error);
      }
    };

    const interval = setInterval(pollProgress, 2000);
    return () => clearInterval(interval);
  }, [isProcessing, project.id, onComplete]);

  const startRealComparison = async () => {
    setIsProcessing(true);
    
    try {
      // Update project status to processing
      await updateProject.mutateAsync({
        id: project.id,
        updates: { status: 'processing', progress: 0 }
      });

      // Parse file paths
      const oldImagePaths = project.old_folder_path.split(',').filter(Boolean);
      const newImagePaths = project.new_folder_path.split(',').filter(Boolean);

      // Call the real comparison Edge Function
      const { data, error } = await supabase.functions.invoke('real-image-comparison', {
        body: {
          projectId: project.id,
          oldImagePaths,
          newImagePaths
        }
      });

      if (error) throw error;

      toast({
        title: "تم بدء المقارنة الحقيقية",
        description: "جاري معالجة الصور واستخراج الأسئلة..."
      });

    } catch (error: any) {
      console.error('Comparison error:', error);
      
      await updateProject.mutateAsync({
        id: project.id,
        updates: { status: 'failed' }
      });

      toast({
        title: "خطأ في المقارنة",
        description: error.message,
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">جاري المقارنة الحقيقية...</h2>
        <p className="text-slate-600">{project?.name}</p>
        <p className="text-sm text-green-600">🤖 يتم الآن استخدام الذكاء الاصطناعي لمقارنة الصور واستخراج الأسئلة</p>
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-slate-800 flex items-center justify-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{currentPhase}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-slate-600">
              <span>{Math.round(progress)}% مكتمل</span>
              <span>المرحلة {Math.min(Math.floor((progress / 100) * phases.length) + 1, phases.length)} من {phases.length}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 space-x-reverse">
            {phases.map((phase, index) => {
              const phaseProgress = (progress / 100) * phases.length;
              const isActive = index < phaseProgress;
              const isCurrent = Math.floor(phaseProgress) === index;
              
              return (
                <div key={phase} className="flex flex-col items-center space-y-1">
                  <div className={`
                    w-3 h-3 rounded-full transition-colors
                    ${isActive ? 'bg-green-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}
                  `} />
                  <span className={`text-xs ${isActive || isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                    {phase}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل المعالجة المباشر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm">
                <Badge variant="secondary">معلومات</Badge>
                <span className="text-slate-600">{log.message} - {log.phase}</span>
                <span className="text-xs text-slate-400">
                  {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-slate-500 text-center">جاري تحديث سجل المعالجة...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
