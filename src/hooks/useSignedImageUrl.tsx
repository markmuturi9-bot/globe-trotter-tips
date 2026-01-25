import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts the file path from a Supabase storage URL
 * Handles both public URLs and signed URLs
 */
function extractFilePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Look for tip-images bucket in the path
    const match = pathname.match(/\/storage\/v1\/(?:object\/(?:public|sign)\/)?tip-images\/(.+)/);
    if (match) {
      // Remove any query parameters from the path
      return match[1].split('?')[0];
    }
    
    // Also handle direct bucket paths
    const directMatch = pathname.match(/tip-images\/(.+)/);
    if (directMatch) {
      return directMatch[1].split('?')[0];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Hook to get a signed URL for an image stored in private storage
 * Returns the original URL if it's not a Supabase storage URL
 */
export function useSignedImageUrl(imageUrl: string | null | undefined): {
  signedUrl: string | null;
  loading: boolean;
  error: Error | null;
} {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }

    // Check if this is a Supabase storage URL that needs signing
    const filePath = extractFilePath(imageUrl);
    
    if (!filePath) {
      // Not a storage URL, use as-is
      setSignedUrl(imageUrl);
      setLoading(false);
      return;
    }

    // Check if it's already a valid signed URL (has token parameter)
    if (imageUrl.includes('token=')) {
      setSignedUrl(imageUrl);
      setLoading(false);
      return;
    }

    async function getSignedUrl() {
      try {
        const { data, error: signError } = await supabase.storage
          .from('tip-images')
          .createSignedUrl(filePath!, 60 * 60); // 1 hour expiry

        if (signError) {
          console.error('Error creating signed URL:', signError);
          setError(signError);
          // Fallback to original URL
          setSignedUrl(imageUrl);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (e) {
        console.error('Failed to get signed URL:', e);
        setError(e as Error);
        setSignedUrl(imageUrl);
      } finally {
        setLoading(false);
      }
    }

    getSignedUrl();
  }, [imageUrl]);

  return { signedUrl, loading, error };
}

/**
 * Hook to get signed URLs for multiple images
 */
export function useSignedImageUrls(imageUrls: (string | null | undefined)[]): {
  signedUrls: (string | null)[];
  loading: boolean;
} {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setSignedUrls([]);
      setLoading(false);
      return;
    }

    async function getSignedUrls() {
      const urls = await Promise.all(
        imageUrls.map(async (url) => {
          if (!url) return null;
          
          const filePath = extractFilePath(url);
          
          if (!filePath) {
            return url;
          }
          
          // Already signed
          if (url.includes('token=')) {
            return url;
          }

          try {
            const { data, error } = await supabase.storage
              .from('tip-images')
              .createSignedUrl(filePath, 60 * 60);
            
            if (error) {
              console.error('Error creating signed URL:', error);
              return url;
            }
            
            return data.signedUrl;
          } catch (e) {
            console.error('Failed to get signed URL:', e);
            return url;
          }
        })
      );

      setSignedUrls(urls);
      setLoading(false);
    }

    getSignedUrls();
  }, [JSON.stringify(imageUrls)]);

  return { signedUrls, loading };
}
