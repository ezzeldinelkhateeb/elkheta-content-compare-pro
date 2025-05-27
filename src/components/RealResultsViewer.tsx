
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Share, FileText, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RealResultsViewerProps {
  projectId: string;
  onBackToDashboard: () => void;
}

export const RealResultsViewer: React.FC<RealResultsViewerProps> = ({
  projectId,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch comparison results
  const { data: results } = useQuery({
    queryKey: ['comparison_results', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comparison_results')
        .select('*')
        .eq('project_id', projectId)
        .order('page_number');

      if (error) throw error;
      return data;
    }
  });

  // Fetch processing logs
  const { data: logs } = useQuery({
    queryKey: ['processing_logs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processing_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const stats = results ? {
    totalPages: results.length,
    identicalPages: results.filter(r => r.comparison_type === 'identical').length,
    differentPages: results.filter(r => r.comparison_type === 'different').length,
    newPages: results.filter(r => r.comparison_type === 'new').length,
    removedPages: results.filter(r => r.comparison_type === 'removed').length,
    extractedQuestions: results.reduce((acc, r) => acc + (r.questions_extracted?.length || 0), 0)
  } : null;

  const handleExportResults = async () => {
    if (!results || !project) return;

    try {
      // Create comprehensive report
      const report = {
        project: {
          name: project.name,
          description: project.description,
          created_at: project.created_at,
          completed_at: project.completed_at
        },
        statistics: stats,
        results: results,
        logs: logs
      };

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_المقارنة_${project.name}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير النتائج",
        description: "تم تحميل تقرير المقارنة الكامل"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في التصدير",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredResults = results?.filter(result => 
    searchQuery === '' || 
    result.ocr_text_old?.includes(searchQuery) ||
    result.ocr_text_new?.includes(searchQuery) ||
    result.page_number.toString().includes(searchQuery)
  );

  if (!project || !results) {
    return <div className="text-center py-8">جاري تحميل النتائج...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">نتائج المقارنة</h2>
        <p className="text-slate-600">{project.name}</p>
        <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-slate-500">
          <span>تم الإنجاز: {new Date(project.completed_at).toLocaleDateString('ar-SA')}</span>
          <span>مدة المعالجة: {project.completed_at && project.created_at ? 
            Math.round((new Date(project.completed_at).getTime() - new Date(project.created_at).getTime()) / 1000 / 60) + ' دقيقة' : 
            'غير متوفر'
          }</span>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">{stats.totalPages}</div>
              <div className="text-sm text-slate-600">إجمالي الصفحات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.identicalPages}</div>
              <div className="text-sm text-slate-600">صفحات متطابقة</div>
              <div className="text-xs text-blue-600 mt-1">
                {stats.totalPages > 0 ? Math.round((stats.identicalPages / stats.totalPages) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.differentPages}</div>
              <div className="text-sm text-slate-600">صفحات مختلفة</div>
              <div className="text-xs text-orange-600 mt-1">
                {stats.totalPages > 0 ? Math.round((stats.differentPages / stats.totalPages) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.newPages}</div>
              <div className="text-sm text-slate-600">صفحات جديدة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.extractedQuestions}</div>
              <div className="text-sm text-slate-600">أسئلة مستخرجة</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Results Interface */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-slate-800">تفاصيل النتائج</CardTitle>
            <div className="flex space-x-2 space-x-reverse">
              <Button onClick={handleExportResults} className="flex items-center space-x-2 space-x-reverse">
                <Download className="w-4 h-4" />
                <span>تصدير التقرير</span>
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4" />
                <span>مشاركة</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">نتائج المقارنة</TabsTrigger>
              <TabsTrigger value="questions">الأسئلة المستخرجة</TabsTrigger>
              <TabsTrigger value="logs">سجل المعالجة</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="البحث في النتائج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Results List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredResults?.map((result) => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-lg font-bold text-slate-600">
                        #{result.page_number}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Badge variant={
                            result.comparison_type === 'identical' ? 'secondary' :
                            result.comparison_type === 'different' ? 'destructive' :
                            result.comparison_type === 'new' ? 'default' : 'outline'
                          }>
                            {result.comparison_type === 'identical' ? 'متطابقة' :
                             result.comparison_type === 'different' ? 'مختلفة' :
                             result.comparison_type === 'new' ? 'جديدة' : 'محذوفة'}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            التشابه: {Math.round((result.similarity_score || 0) * 100)}%
                          </span>
                        </div>
                        {result.questions_extracted && result.questions_extracted.length > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            {result.questions_extracted.length} سؤال مستخرج
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="space-y-2">
                {results?.filter(r => r.questions_extracted && r.questions_extracted.length > 0)
                  .map((result) => (
                  <div key={result.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="font-medium text-slate-800 mb-2">
                      الصفحة #{result.page_number}
                    </div>
                    {result.questions_extracted?.map((question: any, index: number) => (
                      <div key={index} className="text-sm text-slate-600 mb-1">
                        • {question.question}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs?.map((log) => (
                  <div key={log.id} className="flex items-center space-x-2 space-x-reverse text-sm p-3 bg-slate-50 rounded">
                    <Badge variant="secondary">{log.phase}</Badge>
                    <span className="text-slate-600">{log.message}</span>
                    <span className="text-xs text-slate-400 mr-auto">
                      {new Date(log.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                ))}
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
