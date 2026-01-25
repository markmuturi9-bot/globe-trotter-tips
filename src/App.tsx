import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SystemChromeSync } from "@/components/theme/SystemChromeSync";
import { CookieConsent } from "@/components/gdpr/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isNativeApp } from "@/lib/platform";

// Pages
import Landing from "./pages/Landing";
import Map from "./pages/Map";
import List from "./pages/List";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

// Configure QueryClient with better defaults for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches on mobile
    },
  },
});

// Hook to determine if app routes should be shown
function useShowAppRoutes(): boolean {
  // Check on every render to ensure correct detection
  return isNativeApp();
}

// Component that uses the online status hook
function OnlineStatusMonitor() {
  useOnlineStatus();
  return null;
}

// Main app routes component
function AppRoutes() {
  const showAppRoutes = useShowAppRoutes();
  
  return (
    <Routes>
      {/* Public pages - always accessible */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/support" element={<Support />} />
      
      {showAppRoutes ? (
        <>
          {/* Native app routes - full app functionality */}
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<Map />} />
          <Route path="/list" element={<List />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        <>
          {/* Web browser routes - landing page only */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SystemChromeSync />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <OnlineStatusMonitor />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
