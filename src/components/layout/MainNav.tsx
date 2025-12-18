import { Map, List, User } from 'lucide-react';
import type { ViewType } from '@/types';
import { cn } from '@/lib/utils';

interface MainNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { view: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { view: 'map', label: 'Map', icon: Map },
  { view: 'list', label: 'List', icon: List },
  { view: 'profile', label: 'Profile', icon: User },
];

export function MainNav({ activeView, onViewChange }: MainNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:relative md:bottom-auto md:border-t-0 md:border-b">
      <div className="flex items-center justify-center">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              'nav-item flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-4',
              activeView === view && 'active'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
