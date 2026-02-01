import { ReactNode, useEffect } from "react";
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

  // iOS (and some webviews) will "scroll-chain"/rubber-band from an inner scroller
  // to the viewport when the inner scroller hits its bounds.
  // We hard-lock viewport scroll whenever the AppShell is mounted so header + bottom-nav
  // can NEVER shift vertically (works in Lovable preview AND native builds).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: (html.style as any).overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyInset: (body.style as any).inset,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyOverscroll: (body.style as any).overscrollBehavior,
    };

    html.classList.add("app-shell-mounted");
    body.classList.add("app-shell-mounted");

    html.style.overflow = "hidden";
    (html.style as any).overscrollBehavior = "none";

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    (body.style as any).inset = "0";
    body.style.width = "100%";
    body.style.height = "100%";
    (body.style as any).overscrollBehavior = "none";

    return () => {
      html.classList.remove("app-shell-mounted");
      body.classList.remove("app-shell-mounted");

      html.style.overflow = prev.htmlOverflow;
      (html.style as any).overscrollBehavior = prev.htmlOverscroll;

      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      (body.style as any).inset = prev.bodyInset;
      body.style.width = prev.bodyWidth;
      body.style.height = prev.bodyHeight;
      (body.style as any).overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

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
        className={`flex-1 ${scrollContent ? "overflow-y-auto app-scroll-container overscroll-contain" : "overflow-hidden"}`}
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