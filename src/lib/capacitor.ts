import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";

/**
 * Initialize Capacitor plugins for native mobile experience
 */
export async function initializeCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Set a safe default; we'll sync to the actual theme once React mounts.
    await setNativeStatusBarTheme("dark");

    // Hide splash screen after app is ready
    await SplashScreen.hide();
  } catch (error) {
    console.warn("Capacitor initialization error:", error);
  }
}

export async function setNativeStatusBarTheme(theme: "light" | "dark") {
  if (!Capacitor.isNativePlatform()) return;

  // Use these as defaults; actual page background is controlled by CSS tokens.
  const bg = theme === "dark" ? "#0b0b10" : "#fcfcfc";

  try {
    // Icon/text color
    await StatusBar.setStyle({ style: theme === "dark" ? Style.Light : Style.Dark });

    // Android-only background behind status bar
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: bg });
    }
  } catch {
    // Some platforms/configurations may not support all calls.
  }
}

/**
 * Check if running on native platform (iOS/Android)
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getPlatform(): "ios" | "android" | "web" {
  return Capacitor.getPlatform() as "ios" | "android" | "web";
}

/**
 * Handle back button on Android
 */
export function setupBackButton(callback: () => void) {
  if (Capacitor.getPlatform() !== "android") {
    return () => {};
  }

  const listener = App.addListener("backButton", ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      callback();
    }
  });

  return () => {
    listener.then((l) => l.remove());
  };
}

/**
 * Handle app state changes (foreground/background)
 */
export function onAppStateChange(callback: (isActive: boolean) => void) {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const listener = App.addListener("appStateChange", ({ isActive }) => {
    callback(isActive);
  });

  return () => {
    listener.then((l) => l.remove());
  };
}
