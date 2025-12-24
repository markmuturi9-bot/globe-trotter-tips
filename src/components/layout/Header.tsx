import { Globe, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onCreateTip?: () => void;
}

export function Header({ onCreateTip }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-sm">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">TipTip</span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="w-5 h-5" />
            </Button>

            {onCreateTip && (
              <Button onClick={onCreateTip} size="sm" className="gap-2 shadow-sm">
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