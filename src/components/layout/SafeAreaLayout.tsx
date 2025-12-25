import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isNative, getPlatform } from '@/lib/capacitor';

interface SafeAreaLayoutProps {
  children: ReactNode;
  className?: string;
  enableTopSafeArea?: boolean;
  enableBottomSafeArea?: boolean;
}

/**
 * SafeAreaLayout component that handles iOS notch and Android status bar
 * Ensures content doesn't overlap with system UI elements
 */
export function SafeAreaLayout({
  children,
  className,
  enableTopSafeArea = true,
  enableBottomSafeArea = true,
}: SafeAreaLayoutProps) {
  useEffect(() => {
    // Add safe area CSS variables
    if (isNative()) {
      document.documentElement.classList.add('native-app');
      document.documentElement.classList.add(`platform-${getPlatform()}`);
    }
  }, []);

  return (
    <div
      className={cn(
        'min-h-screen w-full',
        enableTopSafeArea && 'pt-safe-top',
        enableBottomSafeArea && 'pb-safe-bottom',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * SafeAreaInset component for individual safe area handling
 */
export function SafeAreaInset({
  position,
  className,
}: {
  position: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const positionClasses = {
    top: 'h-safe-top',
    bottom: 'h-safe-bottom',
    left: 'w-safe-left',
    right: 'w-safe-right',
  };

  return <div className={cn(positionClasses[position], className)} />;
}
