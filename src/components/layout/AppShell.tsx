import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MainNav } from "@/components/layout/MainNav";
import type { ViewType } from "@/types";

interface AppShellProps {
  activeView: ViewType;
  children: ReactNode;
  onCreateTip?: () => void;
  /**
   * When true, the content area scrolls while header+nav stay static.
   * When false, nothing inside the shell scrolls (useful for map).
   */
  scrollContent?: boolean;
}

export function AppShell({
  activeView,
  children,
  onCreateTip,
  scrollContent = true,
}: AppShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Header onCreateTip={onCreateTip} />

      {/* Desktop nav below header */}
      <div className="hidden md:block">
        <MainNav activeView={activeView} onViewChange={(view) => navigate(`/${view}`)} />
      </div>

      <main className={scrollContent ? "flex-1 overflow-y-auto" : "flex-1 overflow-hidden"}>
        {children}
      </main>

      {/* Mobile nav at bottom */}
      <div className="md:hidden">
        <MainNav activeView={activeView} onViewChange={(view) => navigate(`/${view}`)} />
      </div>
    </div>
  );
}
