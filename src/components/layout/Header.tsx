import { Globe, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onCreateTip?: () => void;
}

export function Header({ onCreateTip }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          <span className="font-serif text-xl font-semibold tracking-tight">Wandr</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="w-5 h-5" />
            </Button>
            
            {onCreateTip && (
              <Button
                onClick={onCreateTip}
                size="sm"
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Tip</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
