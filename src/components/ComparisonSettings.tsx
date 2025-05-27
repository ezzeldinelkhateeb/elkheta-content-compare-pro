
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ComparisonSettingsProps {
  settings: {
    quickComparison: boolean;
    extractQuestions: boolean;
    ocrAnalysis: boolean;
    detailedReport: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const ComparisonSettings: React.FC<ComparisonSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleSettingChange = (key: string, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const settingOptions = [
    {
      key: 'quickComparison',
      label: 'مقارنة سريعة',
      description: 'مقارنة أساسية باستخدام البصمة الرقمية',
      icon: '⚡'
    },
    {
      key: 'extractQuestions',
      label: 'استخراج الأسئلة',
      description: 'استخراج الأسئلة الجديدة تلقائياً',
      icon: '❓'
    },
    {
      key: 'ocrAnalysis',
      label: 'تحليل OCR',
      description: 'قراءة النصوص العربية وتحليلها',
      icon: '🔍'
    },
    {
      key: 'detailedReport',
      label: 'تقرير مفصل',
      description: 'إنشاء تقرير شامل بالتغييرات',
      icon: '📋'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">⚙️ إعدادات المقارنة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {settingOptions.map((option) => (
            <div key={option.key} className="flex items-start space-x-3 space-x-reverse p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <Checkbox
                id={option.key}
                checked={settings[option.key as keyof typeof settings]}
                onCheckedChange={(checked) => handleSettingChange(option.key, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-lg">{option.icon}</span>
                  <Label 
                    htmlFor={option.key}
                    className="text-sm font-medium text-slate-800 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
                <p className="text-xs text-slate-600">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
