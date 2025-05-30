
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

export interface Project {
  id: string;
  name: string;
  description?: string;
  old_folder_path: string;
  new_folder_path: string;
  settings: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    }
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: Omit<ProjectInsert, 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const insertData: ProjectInsert = {
        name: projectData.name!,
        old_folder_path: projectData.old_folder_path!,
        new_folder_path: projectData.new_folder_path!,
        description: projectData.description,
        settings: projectData.settings,
        status: projectData.status,
        progress: projectData.progress,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "تم إنشاء المشروع",
        description: "تم إنشاء مشروع المقارنة بنجاح"
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء المشروع",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};
