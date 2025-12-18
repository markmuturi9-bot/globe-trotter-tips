import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, progress } = useImageUpload();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB.',
          variant: 'destructive',
        });
        continue;
      }

      try {
        const url = await uploadImage(file);
        if (url) {
          onImagesChange([...images, url]);
        }
      } catch (error: any) {
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload image.',
          variant: 'destructive',
        });
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
              <img 
                src={url} 
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Uploading... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Photos ({images.length}/{maxImages})
              </>
            )}
          </Button>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground text-center">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Add up to {maxImages} photos to your tip
        </p>
      )}
    </div>
  );
}
