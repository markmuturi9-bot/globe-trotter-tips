import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import appLogo from "@/assets/logo.png";

interface HeaderProps {
  onCreateTip?: () => void;
}

export function Header({ onCreateTip }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-border/30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={appLogo} alt="TipTip" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="font-display text-xl font-semibold tracking-tight">TipTip</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          
          {user && (
            <>
              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="w-5 h-5" />
              </Button>

              {onCreateTip && (
                <Button onClick={onCreateTip} size="sm" className="gap-2 shadow-sm ml-1">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Tip</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}