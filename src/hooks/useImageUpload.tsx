import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    setUploading(true);
    setProgress(0);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('tip-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tip-images')
        .getPublicUrl(filePath);

      setProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) urls.push(url);
      setProgress(((i + 1) / files.length) * 100);
    }

    return urls;
  };

  return {
    uploadImage,
    uploadMultiple,
    uploading,
    progress,
  };
}
