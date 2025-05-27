
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Folder, CheckCircle } from 'lucide-react';

interface FolderDropZoneProps {
  title: string;
  description: string;
  onFolderSelect: (folder: string) => void;
  selectedFolder: string | null;
  icon: string;
}

export const FolderDropZone: React.FC<FolderDropZoneProps> = ({
  title,
  description,
  onFolderSelect,
  selectedFolder,
  icon
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Simulate folder selection
    const simulatedPath = `/path/to/${title.replace(' ', '_')}_folder`;
    onFolderSelect(simulatedPath);
  };

  const handleClick = () => {
    // Simulate folder selection dialog
    const simulatedPath = `/path/to/${title.replace(' ', '_')}_folder`;
    onFolderSelect(simulatedPath);
  };

  return (
    <Card 
      className={`
        transition-all duration-300 cursor-pointer group
        ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-dashed border-2 border-slate-300 hover:border-blue-400'}
        ${selectedFolder ? 'border-green-500 bg-green-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="p-8 text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {selectedFolder ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <div className="text-6xl">{icon}</div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>

        {/* Status */}
        {selectedFolder ? (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">تم اختيار المجلد بنجاح</p>
            <p className="text-sm text-slate-600 break-all">{selectedFolder}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFolderSelect('');
              }}
            >
              تغيير المجلد
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-600">{description}</p>
            <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-slate-500">
              <Upload className="w-4 h-4" />
              <span>أو انقر للاختيار</span>
            </div>
          </div>
        )}

        {/* Drag Over Indicator */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
            <p className="text-blue-600 font-semibold">أفلت المجلد هنا</p>
          </div>
        )}
      </div>
    </Card>
  );
};
