
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle } from 'lucide-react';

export const PreviousProjects: React.FC = () => {
  const mockProjects = [
    {
      id: 1,
      name: 'مقارنة رياضيات الصف الثالث',
      date: '2024-05-25',
      status: 'مكتمل',
      pagesProcessed: 300,
      questionsFound: 45,
      duration: '15 دقيقة'
    },
    {
      id: 2,
      name: 'مقارنة علوم الصف الثاني',
      date: '2024-05-24',
      status: 'مكتمل',
      pagesProcessed: 180,
      questionsFound: 28,
      duration: '8 دقائق'
    },
    {
      id: 3,
      name: 'مقارنة لغة عربية الصف الأول',
      date: '2024-05-23',
      status: 'مكتمل',
      pagesProcessed: 220,
      questionsFound: 35,
      duration: '12 دقيقة'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-slate-800 flex items-center space-x-2 space-x-reverse">
          <Clock className="w-5 h-5" />
          <span>المشاريع السابقة</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockProjects.map((project) => (
            <div 
              key={project.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <h4 className="font-medium text-slate-800">{project.name}</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-600">
                  <span>📅 {project.date}</span>
                  <span>📄 {project.pagesProcessed} صفحة</span>
                  <span>❓ {project.questionsFound} سؤال</span>
                  <span>⏱️ {project.duration}</span>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 ml-1" />
                  عرض النتائج
                </Button>
                <Button variant="ghost" size="sm">
                  إعادة المقارنة
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
