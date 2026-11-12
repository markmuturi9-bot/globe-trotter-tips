import { Map, List, User, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ViewType } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';

interface MainNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCreateTip?: () => void;
}

type NavItem = { view: ViewType; labelKey: 'nav.map' | 'nav.list' | 'nav.friends' | 'nav.profile'; icon: typeof Map };

const left: NavItem[] = [
  { view: 'map', labelKey: 'nav.map', icon: Map },
  { view: 'list', labelKey: 'nav.list', icon: List },
];
const right: NavItem[] = [
  { view: 'friends', labelKey: 'nav.friends', icon: Users },
  { view: 'profile', labelKey: 'nav.profile', icon: User },
];

export function MainNav({ activeView, onViewChange, onCreateTip }: MainNavProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const renderItem = ({ view, labelKey, icon: Icon }: NavItem) => {
    const active = activeView === view;
    return (
      <button
        key={view}
        onClick={() => onViewChange(view)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 min-h-[52px] rounded-[14px] text-xs transition-colors',
          active ? 'bg-accent text-primary font-semibold' : 'text-muted-foreground font-medium'
        )}
      >
        <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 1.75 : 1.5} aria-hidden="true" />
        <span>{t(labelKey)}</span>
      </button>
    );
  };

  return (
    <nav
      className="bg-background/90 backdrop-blur-xl border-t border-border select-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2" style={{ height: 'var(--nav-h)' }}>
        {left.map(renderItem)}
        <button
          // Not logged in: there is nobody to attach a tip to, so go to the login form instead.
          onClick={() => (user ? onCreateTip?.() : navigate('/profile'))}
          aria-label="Add tip"
          className="w-14 h-14 -mt-[22px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_10px_24px_-8px_hsl(var(--primary))]"
        >
          <Plus className="w-[26px] h-[26px]" strokeWidth={2} aria-hidden="true" />
        </button>
        {right.map(renderItem)}
      </div>
    </nav>
  );
}
