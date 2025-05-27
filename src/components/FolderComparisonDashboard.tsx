
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderDropZone } from '@/components/FolderDropZone';
import { ComparisonSettings } from '@/components/ComparisonSettings';
import { PreviousProjects } from '@/components/PreviousProjects';
import { toast } from '@/hooks/use-toast';

interface FolderComparisonDashboardProps {
  onStartComparison: (data: any) => void;
}

export const FolderComparisonDashboard: React.FC<FolderComparisonDashboardProps> = ({
  onStartComparison
}) => {
  const [oldFolder, setOldFolder] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    quickComparison: true,
    extractQuestions: true,
    ocrAnalysis: true,
    detailedReport: false
  });

  const handleStartComparison = () => {
    if (!oldFolder || !newFolder) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مجلدي الكتاب القديم والجديد",
        variant: "destructive"
      });
      return;
    }

    const comparisonData = {
      oldFolder,
      newFolder,
      settings,
      startTime: new Date().toISOString(),
      projectName: `مقارنة - ${new Date().toLocaleDateString('ar-SA')}`
    };

    toast({
      title: "بدء المقارنة",
      description: "تم بدء عملية مقارنة المحتوى التعليمي",
    });

    onStartComparison(comparisonData);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-slate-800">مرحباً بكم في منصة الخطة</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          منصة ذكية لمقارنة المحتوى التعليمي واستخراج الأسئلة بدقة وسرعة عالية
        </p>
      </div>

      {/* Main Comparison Interface */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl text-slate-800">مشروع جديد</CardTitle>
          <p className="text-slate-600">اختر مجلدي الكتاب القديم والجديد لبدء المقارنة</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Folder Selection */}
          <div className="grid md:grid-cols-2 gap-8">
            <FolderDropZone
              title="الكتاب القديم"
              description="اسحب مجلد الكتاب القديم هنا"
              onFolderSelect={setOldFolder}
              selectedFolder={oldFolder}
              icon="📚"
            />
            <FolderDropZone
              title="الكتاب الجديد"
              description="اسحب مجلد الكتاب الجديد هنا"
              onFolderSelect={setNewFolder}
              selectedFolder={newFolder}
              icon="📖"
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
              disabled={!oldFolder || !newFolder}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 بدء المقارنة
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg"
            >
              📊 المشاريع السابقة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Projects */}
      <PreviousProjects />
    </div>
  );
};
