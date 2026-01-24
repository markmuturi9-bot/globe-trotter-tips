import { MapPin, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from './CategoryBadge';
import type { Tip } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface TipCardProps {
  tip: Tip;
  onClick?: () => void;
}

export function TipCard({ tip, onClick }: TipCardProps) {
  const countryName = tip.countries?.name || 'Unknown';
  const username = tip.profiles?.username || 'Anonymous';
  
  return (
    <Card 
      className="hover-lift cursor-pointer overflow-hidden animate-fade-in group border-border/50"
      onClick={onClick}
      role="article"
      aria-label={`Travel tip: ${tip.title} in ${countryName}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {tip.title}
          </h3>
          <CategoryBadge category={tip.category} showIcon={false} />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {tip.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary/70" aria-hidden="true" />
              <span aria-label={`Location: ${countryName}`}>{countryName}</span>
            </span>
            {tip.address && (
              <span className="text-muted-foreground/60 truncate max-w-[120px]" title={tip.address}>
                {tip.address}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={tip.created_at}>
              {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
            </time>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center" aria-hidden="true">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground" aria-label={`Posted by ${username}`}>@{username}</span>
        </div>
      </CardContent>
    </Card>
  );
}