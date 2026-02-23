import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const isPopStateRef = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isPopStateRef.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const saveCurrentScroll = () => {
      scrollPositions.set(location, window.scrollY);
    };
    window.addEventListener('beforeunload', saveCurrentScroll);
    return () => window.removeEventListener('beforeunload', saveCurrentScroll);
  }, [location]);

  useEffect(() => {
    const prevPath = prevLocationRef.current;

    if (prevPath !== location) {
      scrollPositions.set(prevPath, window.scrollY);
    }

    if (isPopStateRef.current) {
      const saved = scrollPositions.get(location);
      if (saved !== undefined) {
        requestAnimationFrame(() => {
          setTimeout(() => window.scrollTo(0, saved), 0);
        });
      }
      isPopStateRef.current = false;
    } else if (prevPath !== location) {
      window.scrollTo(0, 0);
    }

    prevLocationRef.current = location;
  }, [location]);
}
