import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

const scrollPositions = new Map<string, number>();
let isBackNavigation = false;

window.addEventListener('popstate', () => {
  isBackNavigation = true;
});

function restoreScrollWithRetry(targetY: number, maxAttempts = 20) {
  let attempts = 0;
  const tryScroll = () => {
    if (attempts >= maxAttempts) return;
    attempts++;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (targetY <= maxScroll || attempts >= maxAttempts) {
      window.scrollTo(0, Math.min(targetY, maxScroll));
      if (Math.abs(window.scrollY - targetY) > 5 && attempts < maxAttempts) {
        setTimeout(tryScroll, 100);
      }
    } else {
      setTimeout(tryScroll, 100);
    }
  };
  requestAnimationFrame(tryScroll);
}

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
      if (saved !== undefined && saved > 0) {
        restoreScrollWithRetry(saved);
      }
      isBackNavigation = false;
    } else if (prev !== null && prev !== location) {
      window.scrollTo(0, 0);
    }

    prevLocationRef.current = location;
  }, [location]);
}
