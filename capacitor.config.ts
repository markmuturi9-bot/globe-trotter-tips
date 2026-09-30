import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Do not change this — TestFlight/App Store Connect identify the app by it.
  appId: 'app.lovable.8119531570f64ad1b5f9255d17b94d5e',
  appName: 'TIPIT',
  webDir: 'dist',
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
