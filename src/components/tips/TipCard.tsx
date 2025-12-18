import { MapPin, Clock } from 'lucide-react';
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
      className="hover-lift cursor-pointer overflow-hidden animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-foreground line-clamp-1">{tip.title}</h3>
          <CategoryBadge category={tip.category} showIcon={false} />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tip.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {countryName}
            </span>
            {tip.address && (
              <span className="text-muted-foreground/70 truncate max-w-[120px]">
                {tip.address}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">by @{username}</span>
        </div>
      </CardContent>
    </Card>
  );
}
