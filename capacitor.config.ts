import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Do not change this — TestFlight/App Store Connect identify the app by it.
  appId: 'com.tipit.app',
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
