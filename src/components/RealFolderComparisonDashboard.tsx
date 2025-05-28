
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderUploader } from '@/components/FolderUploader';
import { ComparisonSettings } from '@/components/ComparisonSettings';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface RealFolderComparisonDashboardProps {
  onStartComparison: (project: any) => void;
}

export const RealFolderComparisonDashboard: React.FC<RealFolderComparisonDashboardProps> = ({
  onStartComparison
}) => {
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [oldFolderFiles, setOldFolderFiles] = useState<string[]>([]);
  const [newFolderFiles, setNewFolderFiles] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    quickComparison: false,
    extractQuestions: true,
    ocrAnalysis: true,
    detailedReport: true
  });

  const handleStartComparison = async () => {
    if (!projectName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المشروع",
        variant: "destructive"
      });
      return;
    }

    if (oldFolderFiles.length === 0 || newFolderFiles.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى رفع مجلدي الكتاب القديم والجديد",
        variant: "destructive"
      });
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: projectName,
        description: projectDescription,
        old_folder_path: oldFolderFiles.join(','),
        new_folder_path: newFolderFiles.join(','),
        settings,
        status: 'pending',
        progress: 0
      });

      toast({
        title: "تم إنشاء المشروع",
        description: "سيتم بدء المقارنة الحقيقية للصور الآن..."
      });

      onStartComparison(project);
      
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setOldFolderFiles([]);
      setNewFolderFiles([]);
      
    } catch (error: any) {
      console.error('Error creating project:', error);
    }
  };

  const recentProjects = projects?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-slate-800">مرحباً بكم في منصة الخطة</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          منصة ذكية لمقارنة المحتوى التعليمي واستخراج الأسئلة بدقة وسرعة عالية
        </p>
        {user && (
          <p className="text-sm text-slate-500">
            مرحباً {user.email} - آخر تسجيل دخول: {new Date().toLocaleDateString('ar-SA')}
          </p>
        )}
      </div>

      {/* Main Comparison Interface */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl text-slate-800">مشروع جديد</CardTitle>
          <p className="text-slate-600">أنشئ مشروع مقارنة جديد للمحتوى التعليمي</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Project Details */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">اسم المشروع *</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="مثال: مقارنة رياضيات الصف الثالث"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">وصف المشروع (اختياري)</Label>
                <Input
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="وصف موجز للمشروع..."
                />
              </div>
            </div>
          </div>

          {/* Folder Upload */}
          <div className="grid md:grid-cols-2 gap-8">
            <FolderUploader
              projectId={`temp-${Date.now()}`}
              folderType="old"
              title="مجلد الكتاب القديم"
              icon="📚"
              onUploadComplete={setOldFolderFiles}
            />
            <FolderUploader
              projectId={`temp-${Date.now()}`}
              folderType="new"
              title="مجلد الكتاب الجديد"
              icon="📖"
              onUploadComplete={setNewFolderFiles}
            />
          </div>

          {/* Comparison Settings */}
          <ComparisonSettings 
            settings={settings}
            onSettingsChange={setSettings}
          />

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 space-x-reverse pt-6">
            <Button 
              size="lg"
              onClick={handleStartComparison}
              disabled={!projectName.trim() || oldFolderFiles.length === 0 || newFolderFiles.length === 0 || createProject.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {createProject.isPending ? '🔄 جاري الإنشاء...' : '🚀 بدء المقارنة الحقيقية'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">المشاريع الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-medium text-slate-800">{project.name}</h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-600">
                      <span>📅 {new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'completed' ? 'مكتمل' :
                         project.status === 'processing' ? 'قيد المعالجة' :
                         project.status === 'failed' ? 'فشل' : 'في الانتظار'}
                      </span>
                      {project.progress > 0 && (
                        <span>{project.progress}% مكتمل</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    {project.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        عرض النتائج
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      تفاصيل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
