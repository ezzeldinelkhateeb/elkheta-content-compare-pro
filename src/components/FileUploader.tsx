
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileUploaderProps {
  projectId: string;
  folderType: 'old' | 'new';
  onUploadComplete: (files: string[]) => void;
  title: string;
  icon: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  projectId,
  folderType,
  onUploadComplete,
  title,
  icon
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${folderType}/${Date.now()}_${i}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('project-files')
          .upload(fileName, file);

        if (error) throw error;

        uploadedPaths.push(data.path);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadedFiles(uploadedPaths);
      onUploadComplete(uploadedPaths);

      toast({
        title: "تم رفع الملفات بنجاح",
        description: `تم رفع ${files.length} ملف`
      });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الملفات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [projectId, folderType, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  return (
    <Card 
      className={`
        transition-all duration-300 cursor-pointer group p-6
        ${dragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-dashed border-2 border-slate-300 hover:border-blue-400'}
        ${uploadedFiles.length > 0 ? 'border-green-500 bg-green-50' : ''}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {uploadedFiles.length > 0 ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : uploading ? (
            <Upload className="w-16 h-16 text-blue-500 animate-bounce" />
          ) : (
            <div className="text-6xl">{icon}</div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>

        {/* Status */}
        {uploading ? (
          <div className="space-y-2">
            <p className="text-blue-600 font-medium">جاري رفع الملفات...</p>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-slate-600">{Math.round(uploadProgress)}%</p>
          </div>
        ) : uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">تم رفع {uploadedFiles.length} ملف</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setUploadedFiles([]);
                onUploadComplete([]);
              }}
            >
              رفع ملفات جديدة
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-600">اسحب الملفات هنا أو انقر للاختيار</p>
            <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-slate-500">
              <File className="w-4 h-4" />
              <span>يدعم صور PDF, JPG, PNG</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${folderType}`}
            />
            <Button 
              variant="outline"
              onClick={() => document.getElementById(`file-upload-${folderType}`)?.click()}
            >
              اختيار الملفات
            </Button>
          </div>
        )}

        {/* Drag Over Indicator */}
        {dragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
            <p className="text-blue-600 font-semibold">أفلت الملفات هنا</p>
          </div>
        )}
      </div>
    </Card>
  );
};
