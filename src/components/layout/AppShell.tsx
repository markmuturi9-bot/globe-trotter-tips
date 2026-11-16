import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MainNav } from "@/components/layout/MainNav";
import type { ViewType } from "@/types";

interface AppShellProps {
  activeView: ViewType;
  children: ReactNode;
  onCreateTip?: () => void;
  /**
   * true: the page scrolls inside the shell (List, Friends, Profile, Settings).
   * false: nothing scrolls and the content fills the whole area, going under
   * the header and nav (Map).
   */
  scrollContent?: boolean;
  /** Slide the header away when scrolling down, bring it back when scrolling up. */
  hideHeaderOnScroll?: boolean;
  /** Replaces the logo in the header with a back arrow + title (Settings). */
  backTo?: { to: string; title: string };
}

/** Total header height including the iPhone notch area. */
export const HEADER_TOTAL = "calc(var(--header-h) + env(safe-area-inset-top))";
/** Total nav height including the iPhone home-indicator area. */
export const NAV_TOTAL = "calc(var(--nav-h) + max(env(safe-area-inset-bottom), 8px))";

/**
 * The app frame: one column that is exactly the screen height.
 * - Header and bottom nav float on top (the content scrolls underneath them).
 * - The content area has padding so the first and last element can always be
 *   reached and never end up behind the header or the nav.
 * - There is exactly ONE scroll surface (<main>). Safe areas are handled in the
 *   header (top) and nav (bottom) only.
 */
export function AppShell({
  activeView,
  children,
  onCreateTip,
  scrollContent = true,
  hideHeaderOnScroll = false,
  backTo,
}: AppShellProps) {
  const navigate = useNavigate();
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastY = useRef(0);

  // Lock the page itself so only <main> can scroll (no rubber-banding of the whole app).
  useEffect(() => {
    document.documentElement.classList.add("app-shell-mounted");
    document.body.classList.add("app-shell-mounted");
    return () => {
      document.documentElement.classList.remove("app-shell-mounted");
      document.body.classList.remove("app-shell-mounted");
    };
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      if (!hideHeaderOnScroll) return;
      const y = e.currentTarget.scrollTop;
      const delta = y - lastY.current;
      if (y <= 0) {
        setHeaderHidden(false); // never hide at the very top
      } else if (delta > 8) {
        setHeaderHidden(true);
      } else if (delta < -4) {
        setHeaderHidden(false);
      }
      lastY.current = Math.max(y, 0);
    },
    [hideHeaderOnScroll]
  );

  return (
    <div className="relative h-dvh bg-background overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 z-40 transition-transform duration-200 ease-out"
        style={{ transform: headerHidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <Header backTo={backTo} />
      </div>

      <main
        onScroll={handleScroll}
        className={
          scrollContent
            ? "absolute inset-0 overflow-y-auto app-scroll-container"
            : "absolute inset-0 overflow-hidden"
        }
      >
        {scrollContent ? (
          <div
            className="flex flex-col min-h-full"
            style={{
              paddingTop: HEADER_TOTAL,
              // nav height + 24px so the last element can scroll fully clear of the nav
              paddingBottom: `calc(${NAV_TOTAL} + 24px)`,
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-40">
        <MainNav
          activeView={activeView}
          onViewChange={(view) => navigate(`/${view}`)}
          onCreateTip={onCreateTip}
        />
      </div>
    </div>
  );
}
