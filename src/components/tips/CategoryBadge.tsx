import type { TipCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: TipCategory;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({ category, showIcon = true, className }: CategoryBadgeProps) {
  return (
    <span className={cn('category-badge', `category-${category}`, className)}>
      {showIcon && <span className="mr-1">{CATEGORY_ICONS[category]}</span>}
      {CATEGORY_LABELS[category]}
    </span>
  );
}
