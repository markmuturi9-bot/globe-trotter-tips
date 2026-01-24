# TIPIT - Complete Codebase for AI Review

This document contains the complete source code for the TIPIT application, organized for AI review to verify App Store and Google Play compliance.

---

## Table of Contents

1. [Configuration Files](#1-configuration-files)
2. [Entry Points](#2-entry-points)
3. [Pages](#3-pages)
4. [Hooks (Business Logic)](#4-hooks-business-logic)
5. [Components - Layout](#5-components---layout)
6. [Components - Views](#6-components---views)
7. [Components - Tips](#7-components---tips)
8. [Components - Map](#8-components---map)
9. [Components - Theme](#9-components---theme)
10. [Components - GDPR](#10-components---gdpr)
11. [Components - Friends](#11-components---friends)
12. [Components - Chat](#12-components---chat)
13. [Types](#13-types)
14. [Edge Functions](#14-edge-functions)
15. [Styling](#15-styling)

---

## 1. Configuration Files

### capacitor.config.ts
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8119531570f64ad1b5f9255d17b94d5e',
  appName: 'TIPIT',
  webDir: 'dist',
  server: {
    url: 'https://81195315-70f6-4ad1-b5f9-255d17b94d5e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#faf9f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0b0b10",
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'TIPIT'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        cream: "hsl(var(--warm-cream))",
        category: {
          general: "hsl(var(--category-general))",
          food: "hsl(var(--category-food))",
          attractions: "hsl(var(--category-attractions))",
          activities: "hsl(var(--category-activities))",
          accommodation: "hsl(var(--category-accommodation))",
          other: "hsl(var(--category-other))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': 'var(--shadow-sm)',
        'medium': 'var(--shadow-md)',
        'strong': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### public/manifest.json
```json
{
  "name": "TIPIT",
  "short_name": "TIPIT",
  "description": "Share travel tips with the world",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0b10",
  "theme_color": "#7c3aed",
  "icons": [
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 2. Entry Points

### src/main.tsx
```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
```

### src/App.tsx
```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SystemChromeSync } from "@/components/theme/SystemChromeSync";
import { CookieConsent } from "@/components/gdpr/CookieConsent";
import Map from "./pages/Map";
import List from "./pages/List";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <SystemChromeSync />
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/map" replace />} />
              <Route path="/map" element={<Map />} />
              <Route path="/list" element={<List />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
```

---

## 3. Pages

### src/pages/Auth.tsx
```typescript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        if (!acceptedTerms) {
          setErrors({ terms: "You must accept the terms to sign up" });
          setLoading(false);
          return;
        }
        
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.username);

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome to TIPIT!",
            description: "Your account has been created successfully.",
          });
          navigate("/");
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign in failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 mb-5 shadow-lg shadow-primary/25">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">TIPIT</h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Share your travel tips with the world
          </p>
        </div>

        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/80 animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
              <Button 
                variant={!isSignUp ? "default" : "ghost"} 
                className={`flex-1 ${!isSignUp ? '' : 'hover:bg-background/50'}`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </Button>
              <Button 
                variant={isSignUp ? "default" : "ghost"} 
                className={`flex-1 ${isSignUp ? '' : 'hover:bg-background/50'}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="tipsare"
                  />
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline font-medium" target="_blank">
                        terms of service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                        privacy policy
                      </Link>
                    </Label>
                  </div>
                  {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          By using the service, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-primary hover:underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
```

### src/pages/Map.tsx
```typescript
import { useEffect, useState } from "react";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { MapView } from "@/components/views/MapView";
import { AppShell } from "@/components/layout/AppShell";

export default function Map() {
  const [showCreateTip, setShowCreateTip] = useState(false);

  // Hard lock scroll on the map screen
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <AppShell activeView="map" onCreateTip={() => setShowCreateTip(true)} scrollContent={false}>
      <MapView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}
```

### src/pages/Privacy.tsx
```typescript
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-medium mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              We value your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and protect your information 
              in accordance with the EU General Data Protection Regulation (GDPR) and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">2. Data Controller</h2>
            <p className="text-muted-foreground leading-relaxed">
              The data controller for the processing of your personal data is the service owner. 
              You can contact us via email for questions about data protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">3. What Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account information:</strong> Email address, username</li>
              <li><strong>Content you create:</strong> Travel tips, locations, images you upload</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information</li>
              <li><strong>Usage data:</strong> How you interact with the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">4. Legal Basis for Processing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We process your personal data based on:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Contract:</strong> To provide the service you registered for</li>
              <li><strong>Consent:</strong> When you accept cookies or certain data processing</li>
              <li><strong>Legitimate interest:</strong> To improve and secure the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">5. How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and improve the service</li>
              <li>Manage your user account</li>
              <li>Enable social features (friends, sharing)</li>
              <li>Send important messages about the service</li>
              <li>Analyze usage to improve the experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We never sell your personal data. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li><strong>Service providers:</strong> Who help us run the service (hosting, authentication)</li>
              <li><strong>Legal requirements:</strong> If required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">7. Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored on secure servers within the EU/EEA. We use encryption and 
              other technical measures to protect your data. We retain your data 
              as long as you have an account with us or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> You can request a copy of your data</li>
              <li><strong>Correction:</strong> You can correct inaccurate data</li>
              <li><strong>Deletion:</strong> You can request that we delete your data</li>
              <li><strong>Restriction:</strong> You can limit how we use your data</li>
              <li><strong>Data portability:</strong> You can export your data</li>
              <li><strong>Objection:</strong> You can object to certain processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can exercise these rights via your profile settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies for the service to function correctly. See our cookie banner 
              for more information and to manage your preferences. Necessary cookies 
              are required for authentication and cannot be turned off.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">10. Changes to Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy when needed. For significant changes, we will notify 
              you via email or in the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">11. Complaints</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are dissatisfied with how we handle your personal data, you have the right to 
              file a complaint with a data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-medium mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this privacy policy or how we process your data, 
              contact us via the service's contact function.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Hooks (Business Logic)

### src/hooks/useAuth.tsx
```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### src/hooks/useTips.tsx
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tip, TipCategory, Country } from '@/types';

export function useTips() {
  return useQuery({
    queryKey: ['tips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:profiles_public!tips_user_id_fkey(id, username, avatar_url),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
  });
}

export function useTipsByCountry(countryId: string | null) {
  return useQuery({
    queryKey: ['tips', 'country', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:profiles_public!tips_user_id_fkey(id, username, avatar_url),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .eq('country_id', countryId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
    enabled: !!countryId,
  });
}

export function useTipsByUser(userId: string | null) {
  return useQuery({
    queryKey: ['tips', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:profiles_public!tips_user_id_fkey(id, username, avatar_url),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
    enabled: !!userId,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Country[];
    },
  });
}

export function useCountriesWithTips() {
  const { data: tips } = useTips();
  const { data: countries } = useCountries();
  
  if (!tips || !countries) return { data: [], isLoading: true };
  
  const countryIdsWithTips = new Set(tips.map(tip => tip.country_id));
  const countriesWithTips = countries.filter(country => countryIdsWithTips.has(country.id));
  
  const tipCountByCountry = tips.reduce((acc, tip) => {
    acc[tip.country_id] = (acc[tip.country_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    data: countriesWithTips.map(country => ({
      ...country,
      tipCount: tipCountByCountry[country.id] || 0,
    })),
    isLoading: false,
  };
}

interface CreateTipInput {
  country_id: string;
  category: TipCategory;
  title: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export function useCreateTip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTipInput) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('Not authenticated - please sign in again');
      }
      
      const { data, error } = await supabase
        .from('tips')
        .insert({
          user_id: user.id,
          country_id: input.country_id,
          category: input.category,
          title: input.title,
          description: input.description,
          address: input.address || null,
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          images: input.images || null,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
    },
  });
}

interface UpdateTipInput {
  id: string;
  country_id?: string;
  category?: TipCategory;
  title?: string;
  description?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
}

export function useUpdateTip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateTipInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('tips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
    },
  });
}

export function useDeleteTip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tipId: string) => {
      const { error } = await supabase
        .from('tips')
        .delete()
        .eq('id', tipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
    },
  });
}
```

---

## 5. Components - Layout

### src/components/layout/AppShell.tsx
```typescript
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MainNav } from "@/components/layout/MainNav";
import type { ViewType } from "@/types";

interface AppShellProps {
  activeView: ViewType;
  children: ReactNode;
  onCreateTip?: () => void;
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
```

---

## 6. Components - GDPR

### src/components/gdpr/CookieConsent.tsx
*(This file handles GDPR cookie consent)*

---

## 7. Types

### src/types/index.ts
```typescript
export type TipCategory = 
  | 'general'
  | 'food'
  | 'attractions'
  | 'activities'
  | 'accommodation'
  | 'other';

export type PrivacySetting = 'public' | 'friends_only' | 'private';

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  country_id: string | null;
  privacy_setting: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  country_id: string | null;
  privacy_setting: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Tip {
  id: string;
  user_id: string;
  country_id: string;
  category: TipCategory;
  title: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: PublicProfile;
  countries?: Country;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: PublicProfile;
  addressee?: PublicProfile;
}

export interface Chat {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  participant_one_profile?: PublicProfile;
  participant_two_profile?: PublicProfile;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  tip_reference: string | null;
  created_at: string;
  sender?: PublicProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  related_user_id: string | null;
  related_tip_id: string | null;
  created_at: string;
}

export type ViewType = 'map' | 'list' | 'friends' | 'profile';

export const CATEGORY_LABELS: Record<TipCategory, string> = {
  general: 'General',
  food: 'Food',
  attractions: 'Attractions',
  activities: 'Activities',
  accommodation: 'Accommodation',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<TipCategory, string> = {
  general: '📍',
  food: '🍽️',
  attractions: '🏛️',
  activities: '🎯',
  accommodation: '🏨',
  other: '💡',
};
```

---

## 8. Edge Functions

### supabase/functions/get-mapbox-key/index.ts
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxKey = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!mapboxKey) {
      throw new Error('Mapbox key not configured');
    }

    return new Response(
      JSON.stringify({ key: mapboxKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
```

### supabase/functions/search-address/index.ts
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, country } = await req.json();
    const mapboxKey = Deno.env.get('MAPBOX_ACCESS_TOKEN');

    if (!mapboxKey) {
      throw new Error('Mapbox key not configured');
    }

    const countryParam = country ? `&country=${country}` : '';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxKey}&limit=5${countryParam}`;

    const response = await fetch(url);
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
```

---

## 9. Database Types (Auto-generated)

### src/integrations/supabase/types.ts
*(Auto-generated from database schema - contains all table types, enums, and relationships)*

Key tables:
- `profiles` - User data with RLS
- `tips` - Travel tips with RLS
- `countries` - Reference data
- `friendships` - Friend relationships
- `chats` / `messages` - Messaging
- `notifications` - User notifications
- `user_roles` - Admin/moderator roles

---

## 10. Security Summary

### RLS Policies Active

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own only | Own only | Own only | ❌ |
| tips | Public | Own | Own | Own + Admin |
| countries | Public | ❌ | ❌ | ❌ |
| friendships | Participants | Requester | Participants | Participants |
| chats | Participants | Participants | ❌ | ❌ |
| messages | Chat members | Chat members | ❌ | ❌ |
| notifications | Owner | ❌ | Owner | ❌ |
| user_roles | Admin/Own | Admin | Admin | Admin |

### API Key Security
- ✅ Mapbox key stored in Edge Function environment
- ✅ Supabase anon key (publishable) in client
- ✅ No private keys in client code

---

## Notes for Reviewers

1. **Authentication**: Uses Supabase Auth with email/password. Auto-confirm enabled.
2. **Data Access**: All tables protected by Row-Level Security policies.
3. **Input Validation**: Zod schemas validate all user inputs.
4. **Privacy**: GDPR-compliant with cookie consent and privacy policy.
5. **Native Features**: Uses Capacitor plugins for status bar, splash screen.
6. **No Private APIs**: All iOS/Android APIs are public Capacitor plugins.
