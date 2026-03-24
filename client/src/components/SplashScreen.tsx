import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hideNativeSplash } from '@/lib/capacitor';
import { queryClient } from '@/lib/queryClient';

// Read cached user from localStorage so we can include cityId in the request
function getCachedCityId(): number | undefined {
  try {
    const saved = localStorage.getItem('muzwd_user');
    if (!saved) return undefined;
    const user = JSON.parse(saved);
    return user?.cityId ?? undefined;
  } catch {
    return undefined;
  }
}

// Fetch the combined home-data endpoint during the splash animation.
// One network round-trip pre-warms the React Query cache for all Home page data.
// If a cached user has a cityId, it's passed to the endpoint so city-specific
// products and banners are seeded too.
function prefetchHomeData() {
  const cityId = getCachedCityId();
  const url = cityId
    ? `/api/home-data?cityId=${cityId}`
    : '/api/home-data';

  fetch(url, { credentials: 'include' })
    .then(r => r.json())
    .then((data: {
      categories: any[];
      brands: any[];
      cities: any[];
      products: any[];
      banners: any[];
      flashSales: any[];
    }) => {
      const now = Date.now();
      const ttl60s = now + 60_000;
      const ttl30s = now + 30_000;

      // Seed Home page primary query key: ['home-data', cityId | null]
      queryClient.setQueryData(['home-data', cityId ?? null], data, { updatedAt: ttl60s });

      // AdsCarousel key: ['/api/banners/active', cityId | undefined]
      queryClient.setQueryData(['/api/banners/active', cityId ?? undefined], data.banners, { updatedAt: ttl60s });

      // FlashSaleBanner key: ['flash-sales-active']
      queryClient.setQueryData(['flash-sales-active'], data.flashSales, { updatedAt: ttl30s });
    })
    .catch(() => {
      // Network error — cache stays empty; pages will fetch individually as usual
    });
}

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    hideNativeSplash();

    // Fire the combined prefetch immediately — runs in parallel with the animation
    prefetchHomeData();

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1400);
    const t4 = setTimeout(() => onFinish(), 1900);
    // Safety net: always finish even if animations stall
    const tSafety = setTimeout(() => onFinish(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tSafety);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 60%, #4c1d95 100%)' }}
        >
          {/* Static decorative circles - no animation, GPU-friendly */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-300/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative"
            >
              <div className="w-28 h-28 rounded-[2rem] bg-white/15 flex items-center justify-center border border-white/20 shadow-xl">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <path d="M28 8L44 18V38L28 48L12 38V18L28 8Z" fill="white" fillOpacity="0.9" />
                  <path d="M28 8L44 18L28 28L12 18L28 8Z" fill="white" />
                  <path d="M28 28V48L12 38V18L28 28Z" fill="white" fillOpacity="0.7" />
                  <path d="M28 28V48L44 38V18L28 28Z" fill="white" fillOpacity="0.5" />
                  <circle cx="28" cy="26" r="6" fill="#7c3aed" />
                  <path d="M25 26L27 28L31 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg"
              >
                <span className="text-sm">✨</span>
              </motion.div>
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-5xl font-black text-white tracking-tight mb-2">Muzwd</h1>
              <div
                className="h-1 bg-gradient-to-l from-yellow-400 to-white/60 rounded-full mx-auto mb-3"
                style={{ width: phase >= 1 ? 80 : 0, transition: 'width 0.3s ease' }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-purple-200 text-sm font-medium"
              >
                مزوّدك الأول للتجارة بالجملة
              </motion.p>
            </motion.div>

            {/* Simple loading dots - CSS only, no JS animation loop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-1.5 mt-2"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/70 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
