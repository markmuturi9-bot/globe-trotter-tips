import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const routes = [
  { path: '/', label: 'Home (Map/List/Profile)' },
  { path: '/auth', label: 'Auth' },
];

export function DevNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Only show in development
  if (import.meta.env.PROD) return null;
  
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-[100] bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-2 text-xs">
      <div className="text-muted-foreground mb-1 font-medium">Dev Nav</div>
      <div className="flex flex-col gap-1">
        {routes.map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'px-2 py-1 rounded text-left hover:bg-muted transition-colors',
              location.pathname === path && 'bg-primary text-primary-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
