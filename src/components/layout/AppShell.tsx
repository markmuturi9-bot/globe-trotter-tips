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
    <div className="h-dvh bg-background flex flex-col overflow-hidden relative">
      {/* Fixed header - absolutely positioned to prevent any movement */}
      <header 
        className="flex-shrink-0 z-40"
        style={{ 
          position: 'sticky',
          top: 0,
          touchAction: 'none',
        }}
      >
        <Header onCreateTip={onCreateTip} />
      </header>

      {/* Desktop nav below header */}
      <nav 
        className="hidden md:block flex-shrink-0 z-30"
        style={{ 
          position: 'sticky',
          top: 64,
          touchAction: 'none',
        }}
      >
        <MainNav activeView={activeView} onViewChange={(view) => navigate(`/${view}`)} />
      </nav>

      {/* Main content area - isolated scroll container */}
      <main 
        className={`flex-1 ${scrollContent ? "overflow-y-auto app-scroll-container" : "overflow-hidden"}`}
        style={{
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </main>

      {/* Fixed mobile nav at bottom - absolutely positioned */}
      <nav 
        className="md:hidden flex-shrink-0 z-40"
        style={{ 
          position: 'sticky',
          bottom: 0,
          touchAction: 'none',
        }}
      >
        <MainNav activeView={activeView} onViewChange={(view) => navigate(`/${view}`)} />
      </nav>
    </div>
  );
}