import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

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
  const [historyLength, setHistoryLength] = useState(0);
  const initialPath = useRef(location);
  const hasNavigated = useRef(false);

  const isRootPage = ROOT_PATHS.includes(location);

  useEffect(() => {
    if (location !== initialPath.current) {
      hasNavigated.current = true;
    }
    setHistoryLength(window.history.length);
  }, [location]);

  const canGoBack = !isRootPage && hasNavigated.current;

  const goBack = useCallback(() => {
    if (canGoBack) {
      window.history.back();
    } else {
      setLocation('/');
    }
  }, [canGoBack, setLocation]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const currentPath = window.location.pathname;
      const isRoot = ROOT_PATHS.includes(currentPath);

      if (isRoot) {
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          window.close();
          if ((navigator as any).app?.exitApp) {
            (navigator as any).app.exitApp();
          }
        } else {
          lastBackPress.current = now;
          window.history.pushState(null, '', currentPath);
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
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <NavigationContext.Provider value={{ canGoBack, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}
