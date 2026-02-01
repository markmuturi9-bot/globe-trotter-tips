import { Bell, Plus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import appLogo from "@/assets/app-logo.png";

interface HeaderProps {
  onCreateTip?: () => void;
}

export function Header({ onCreateTip }: HeaderProps) {
  const { user } = useAuth();
  const { isModerator } = useAdmin();
  const navigate = useNavigate();

  return (
    <header
      className="z-40 bg-background border-b border-border select-none"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={appLogo} alt="" className="w-9 h-9 rounded-xl shadow-sm" aria-hidden="true" />
          <span className="font-display text-xl font-semibold tracking-tight">TIPIT</span>
        </div>

        <div className="flex items-center gap-1" role="toolbar" aria-label="App actions">
          <ThemeToggle />

          {user && (
            <>
              {isModerator && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl"
                  onClick={() => navigate('/admin')}
                  aria-label="Open moderation dashboard"
                >
                  <Shield className="w-5 h-5" aria-hidden="true" />
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
              </Button>

              {onCreateTip && (
                <Button 
                  onClick={onCreateTip} 
                  size="sm" 
                  className="gap-2 shadow-sm ml-1"
                  aria-label="Add new travel tip"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
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