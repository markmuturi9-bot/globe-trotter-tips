import { X, MapPin, Clock, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import type { Tip } from '@/types';
import { format } from 'date-fns';

interface TipDetailProps {
  tip: Tip;
  onClose: () => void;
}

export function TipDetail({ tip, onClose }: TipDetailProps) {
  const countryName = tip.countries?.name || 'Unknown';
  const username = tip.profiles?.username || 'Anonymous';
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <CategoryBadge category={tip.category} />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(100%-4rem)]">
          <h2 className="font-serif text-2xl font-semibold mb-4">{tip.title}</h2>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {countryName}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              @{username}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {format(new Date(tip.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-foreground whitespace-pre-wrap">{tip.description}</p>
          </div>
          
          {tip.address && (
            <div className="p-4 bg-muted rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-sm text-muted-foreground">{tip.address}</p>
                  {tip.latitude && tip.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${tip.latitude},${tip.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      Open in Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {tip.images && tip.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {tip.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${tip.title} - Image ${index + 1}`}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
