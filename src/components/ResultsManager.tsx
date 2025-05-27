
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Share, 
  Eye, 
  Folder, 
  FileText, 
  BarChart3,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResultsManagerProps {
  results: any;
  onBackToDashboard: () => void;
}

export const ResultsManager: React.FC<ResultsManagerProps> = ({
  results,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveResults = () => {
    toast({
      title: "تم حفظ النتائج",
      description: "تم حفظ نتائج المقارنة بنجاح في المجلد المحدد",
    });
  };

  const handleShareWithTeam = () => {
    toast({
      title: "تم مشاركة النتائج",
      description: "تم مشاركة النتائج مع أعضاء الفريق",
    });
  };

  const mockFiles = [
    { name: 'اسئلة_جديدة', type: 'folder', items: 45 },
    { name: 'الوحدة_الاولى', type: 'subfolder', items: 18 },
    { name: 'الوحدة_الثانية', type: 'subfolder', items: 27 },
    { name: 'تقرير_المقارنة.html', type: 'file', size: '2.3 MB' },
    { name: 'بيانات_تفصيلية.json', type: 'file', size: '856 KB' },
    { name: 'ملخص_التغييرات.pdf', type: 'file', size: '1.1 MB' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-bold text-slate-800">تمت المقارنة بنجاح!</h2>
        </div>
        <p className="text-slate-600">{results?.projectName}</p>
        <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-slate-500">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Clock className="w-4 h-4" />
            <span>مدة المعالجة: {results?.statistics?.processingTime}</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <Users className="w-4 h-4" />
            <span>تم بواسطة: المستخدم الحالي</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-800 mb-2">
              {results?.statistics?.totalPages || 300}
            </div>
            <div className="text-sm text-slate-600">إجمالي الصفحات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {results?.statistics?.identicalPages || 240}
            </div>
            <div className="text-sm text-slate-600">صفحات متطابقة</div>
            <div className="text-xs text-blue-600 mt-1">80%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {results?.statistics?.differentPages || 60}
            </div>
            <div className="text-sm text-slate-600">صفحات مختلفة</div>
            <div className="text-xs text-orange-600 mt-1">20%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {results?.statistics?.newQuestions || 45}
            </div>
            <div className="text-sm text-slate-600">أسئلة جديدة</div>
            <div className="text-xs text-green-600 mt-1">مستخرجة</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Results Interface */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-slate-800 flex items-center space-x-2 space-x-reverse">
              <Folder className="w-5 h-5" />
              <span>نتائج المقارنة</span>
            </CardTitle>
            <div className="flex space-x-2 space-x-reverse">
              <Button onClick={handleSaveResults} className="flex items-center space-x-2 space-x-reverse">
                <Download className="w-4 h-4" />
                <span>حفظ النتائج</span>
              </Button>
              <Button variant="outline" onClick={handleShareWithTeam}>
                <Share className="w-4 h-4" />
                <span>مشاركة مع الفريق</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="files">الملفات المحفوظة</TabsTrigger>
              <TabsTrigger value="preview">معاينة النتائج</TabsTrigger>
              <TabsTrigger value="analysis">تحليل مفصل</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="البحث في الملفات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* File List */}
              <div className="space-y-2">
                {mockFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-2xl">
                        {file.type === 'folder' ? '📁' : file.type === 'subfolder' ? '📂' : '📄'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{file.name}</div>
                        <div className="text-sm text-slate-600">
                          {file.type === 'folder' || file.type === 'subfolder' 
                            ? `${file.items} عنصر` 
                            : file.size
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">معاينة النتائج</h3>
                <p className="text-slate-600 mb-4">يمكنك معاينة الأسئلة المستخرجة والتغييرات المكتشفة</p>
                <Button>فتح المعاينة</Button>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">تحليل مفصل</h3>
                <p className="text-slate-600 mb-4">تقرير شامل بالإحصائيات والتحليلات المتقدمة</p>
                <Button>عرض التحليل</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 space-x-reverse">
        <Button 
          size="lg"
          onClick={onBackToDashboard}
          className="px-8 py-3 text-lg"
        >
          🔄 مقارنة جديدة
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-3 text-lg"
        >
          📋 عرض جميع المشاريع
        </Button>
      </div>
    </div>
  );
};
