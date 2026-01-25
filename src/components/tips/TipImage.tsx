import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { Skeleton } from '@/components/ui/skeleton';

interface TipImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function TipImage({ src, alt, className = '' }: TipImageProps) {
  const { signedUrl, loading, error } = useSignedImageUrl(src);

  if (loading) {
    return <Skeleton className={className || 'w-full aspect-video'} />;
  }

  if (error || !signedUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center text-muted-foreground text-sm ${className}`}>
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
