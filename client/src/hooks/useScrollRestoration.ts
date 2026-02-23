import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

const scrollPositions = new Map<string, number>();
let isBackNavigation = false;

window.addEventListener('popstate', () => {
  isBackNavigation = true;
});

export function useScrollRestoration() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevLocationRef.current;

    if (prev !== null && prev !== location) {
      scrollPositions.set(prev, window.scrollY);
    }

    if (isBackNavigation && prev !== null) {
      const saved = scrollPositions.get(location);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, saved ?? 0);
        });
      });
      isBackNavigation = false;
    } else if (prev !== null && prev !== location) {
      window.scrollTo(0, 0);
    }

    prevLocationRef.current = location;
  }, [location]);
}
