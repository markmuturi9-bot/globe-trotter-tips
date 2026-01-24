import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Allowed image types for security
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationError {
  type: 'invalid_type' | 'too_large' | 'auth_required';
  message: string;
}

export function validateImage(file: File): ImageValidationError | null {
  // Validate file type by checking MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      type: 'invalid_type',
      message: `Invalid file type. Allowed: JPEG, PNG, GIF, WebP`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'too_large',
      message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Additional check: verify file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
  };

  const allowedExts = validExtensions[file.type] || [];
  if (extension && !allowedExts.includes(extension)) {
    return {
      type: 'invalid_type',
      message: `File extension doesn't match file type`,
    };
  }

  return null;
}

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Validate before upload
    const validationError = validateImage(file);
    if (validationError) {
      throw new Error(validationError.message);
    }

    setUploading(true);
    setProgress(0);

    try {
      // Create unique file path with sanitized extension
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeExtension = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) ? extension : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${safeExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('tip-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type, // Explicitly set content type
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
    validateImage,
  };
}
