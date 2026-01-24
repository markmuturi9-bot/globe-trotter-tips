import type { CapacitorConfig } from '@capacitor/cli';

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'app.lovable.8119531570f64ad1b5f9255d17b94d5e',
  appName: 'TIPIT',
  webDir: 'dist',
  // Only use server config in development - production uses bundled assets
  ...(isDevelopment ? {
    server: {
      url: 'https://81195315-70f6-4ad1-b5f9-255d17b94d5e.lovableproject.com?forceHideBadge=true',
      cleartext: false // Always use HTTPS
    }
  } : {}),
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
    allowMixedContent: false, // Security: Disable mixed HTTP/HTTPS content
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
