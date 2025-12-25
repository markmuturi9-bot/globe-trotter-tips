import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

/**
 * Initialize Capacitor plugins for native mobile experience
 */
export async function initializeCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Configure status bar for native feel
    await StatusBar.setStyle({ style: Style.Light });
    
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#6366f1' });
    }

    // Hide splash screen after app is ready
    await SplashScreen.hide();
  } catch (error) {
    console.warn('Capacitor initialization error:', error);
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
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Handle back button on Android
 */
export function setupBackButton(callback: () => void) {
  if (Capacitor.getPlatform() !== 'android') {
    return () => {};
  }

  const listener = App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      callback();
    }
  });

  return () => {
    listener.then(l => l.remove());
  };
}

/**
 * Handle app state changes (foreground/background)
 */
export function onAppStateChange(callback: (isActive: boolean) => void) {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const listener = App.addListener('appStateChange', ({ isActive }) => {
    callback(isActive);
  });

  return () => {
    listener.then(l => l.remove());
  };
}
