import { Capacitor } from '@capacitor/core';

/**
 * Check if we're in a Lovable preview/development environment
 * This specifically checks for preview URLs (containing "preview" in hostname)
 * and local development, NOT published URLs like "myapp.lovable.app"
 */
export function isLovablePreview(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  
  // Lovable preview URLs contain "preview" in the hostname
  // e.g., "id-preview--xyz.lovable.app" or similar patterns
  if (hostname.includes('preview') && (hostname.includes('lovable.app') || hostname.includes('lovableproject.com'))) {
    return true;
  }
  
  return false;
}

/**
 * Check if the app is running as a native mobile app (iOS/Android via Capacitor)
 * Also returns true in Lovable preview to allow testing all routes
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform() || isLovablePreview();
}

/**
 * Check if the app is running in a web browser (not native)
 */
export function isWebBrowser(): boolean {
  return !Capacitor.isNativePlatform();
}

/**
 * Check if this is a published web deployment (not native and not preview)
 */
export function isPublishedWeb(): boolean {
  return !Capacitor.isNativePlatform() && !isLovablePreview();
}

/**
 * Get the current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
