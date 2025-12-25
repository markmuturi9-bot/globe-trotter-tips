import { useEffect, useState } from 'react';
import { isNative, getPlatform, initializeCapacitor, setupBackButton, onAppStateChange } from '@/lib/capacitor';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for native app functionality
 */
export function useNativeApp() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setPlatform(getPlatform());
    setIsNativePlatform(isNative());
    
    // Initialize Capacitor plugins
    initializeCapacitor();

    // Setup Android back button handler
    const removeBackButton = setupBackButton(() => {
      navigate(-1);
    });

    // Listen for app state changes
    const removeAppStateListener = onAppStateChange((isActive) => {
      setIsAppActive(isActive);
    });

    return () => {
      removeBackButton();
      removeAppStateListener();
    };
  }, [navigate]);

  return {
    platform,
    isNative: isNativePlatform,
    isAppActive,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
  };
}
