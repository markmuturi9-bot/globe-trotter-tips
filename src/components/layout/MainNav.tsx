import { Map, List, User, Users } from 'lucide-react';
import type { ViewType } from '@/types';
import { cn } from '@/lib/utils';

interface MainNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { view: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { view: 'map', label: 'Map', icon: Map },
  { view: 'list', label: 'List', icon: List },
  { view: 'friends', label: 'Friends', icon: Users },
  { view: 'profile', label: 'Profile', icon: User },
];

export function MainNav({ activeView, onViewChange }: MainNavProps) {
  return (
    <nav
      className="bg-background border-t border-border md:border-t-0 md:border-b"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-center gap-1 py-1 md:py-0">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            aria-label={`Navigate to ${label}`}
            aria-current={activeView === view ? 'page' : undefined}
            className={cn(
              "nav-item flex flex-col md:flex-row items-center gap-1.5 md:gap-2 py-2.5 md:py-4 px-4 md:px-6 rounded-xl md:rounded-none mx-1 md:mx-0 transition-all duration-200",
              activeView === view
                ? "active bg-accent/50 md:bg-transparent"
                : "hover:bg-accent/30 md:hover:bg-transparent"
            )}
          >
            <Icon 
              className={cn("w-5 h-5 transition-colors", activeView === view && "text-primary")} 
              aria-hidden="true"
            />
            <span className="text-[11px] md:text-sm">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}