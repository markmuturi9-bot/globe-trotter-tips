import { ChevronLeft, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DesignToggle } from "@/components/theme/DesignToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import appLogo from "@/assets/app-logo.png";

interface HeaderProps {
  backTo?: { to: string; title: string };
}

const iconButton =
  "w-11 h-11 rounded-[14px] border border-border bg-card flex items-center justify-center text-foreground";

export function Header({ backTo }: HeaderProps) {
  const { user } = useAuth();
  const { isAdmin, isModerator } = useAdmin();
  const navigate = useNavigate();

  return (
    <header
      className="bg-background/95 backdrop-blur-xl border-b border-border select-none"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      <div className="px-5 flex items-center justify-between" style={{ height: "var(--header-h)" }}>
        {backTo ? (
          <div className="flex items-center gap-3">
            <Link to={backTo.to} className={iconButton} aria-label="Back">
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{backTo.title}</h1>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <img src={appLogo} alt="" className="w-9 h-9 rounded-xl" aria-hidden="true" />
            <span className="font-display text-[22px] font-bold tracking-tight">TIPIT</span>
          </div>
        )}

        {!backTo && (
          <div className="flex items-center gap-2" role="toolbar" aria-label="App actions">
            {/* Admin-only tools, invisible for normal users */}
            {isAdmin && <DesignToggle />}
            {user && isModerator && (
              <button
                className={iconButton}
                onClick={() => navigate("/admin")}
                aria-label="Open moderation dashboard"
              >
                <Shield className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
