import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { isNative, setupBackButton } from './capacitor';
import { App as CapApp } from '@capacitor/app';

const ROOT_PATHS = ['/', '/categories', '/cart', '/profile'];

interface NavigationContextType {
  canGoBack: boolean;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  canGoBack: false,
  goBack: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const lastBackPress = useRef<number>(0);
  const initialPath = useRef(location);
  const hasNavigated = useRef(false);

  const isRootPage = ROOT_PATHS.includes(location);

  useEffect(() => {
    if (location !== initialPath.current) {
      hasNavigated.current = true;
    }
  }, [location]);

  const canGoBack = !isRootPage && hasNavigated.current;

  const goBack = useCallback(() => {
    if (canGoBack) {
      window.history.back();
    } else {
      setLocation('/');
    }
  }, [canGoBack, setLocation]);

  const handleBackAction = useCallback(() => {
    const currentPath = window.location.pathname;
    const isRoot = ROOT_PATHS.includes(currentPath);

    if (!isRoot) {
      window.history.back();
      return;
    }

    const now = Date.now();
    if (now - lastBackPress.current < 2000) {
      if (isNative) {
        CapApp.exitApp();
      } else {
        window.close();
      }
    } else {
      lastBackPress.current = now;
      if (!isNative) {
        window.history.pushState(null, '', currentPath);
      }
      toast('اضغط مرة أخرى للخروج من التطبيق', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          border: 'none',
          borderRadius: '24px',
          fontSize: '14px',
          textAlign: 'center',
          direction: 'rtl',
        },
      });
    }
  }, []);

  useEffect(() => {
    if (isNative) {
      return setupBackButton(handleBackAction);
    }

    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => handleBackAction();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleBackAction]);

  return (
    <NavigationContext.Provider value={{ canGoBack, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}
