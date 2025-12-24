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
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              {countryName}
            </span>
            {tip.address && (
              <span className="text-muted-foreground/60 truncate max-w-[120px]">
                {tip.address}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">@{username}</span>
        </div>
      </CardContent>
    </Card>
  );
}