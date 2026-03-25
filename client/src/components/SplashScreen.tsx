import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hideNativeSplash } from '@/lib/capacitor';
import { queryClient } from '@/lib/queryClient';

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

      queryClient.setQueryData(['home-data', cityId ?? null], data, { updatedAt: ttl60s });
      queryClient.setQueryData(['/api/banners/active', cityId ?? undefined], data.banners, { updatedAt: ttl60s });
      queryClient.setQueryData(['flash-sales-active'], data.flashSales, { updatedAt: ttl30s });
    })
    .catch(() => {});
}

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    hideNativeSplash();
    prefetchHomeData();

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1400);
    const t4 = setTimeout(() => onFinish(), 1900);
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
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1e1040 0%, #3b1fa8 45%, #5b21b6 75%, #4c1d95 100%)' }}
        >
          {/* Top accent line */}
          <div
            className="w-full h-0.5 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }}
          />

          {/* Subtle corner glow — static, GPU-friendly */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
          />

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">

            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              {/* Outer ring — single pulse animation only */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: phase >= 1 ? 1 : 0.8, opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-[2.5rem]"
                style={{ border: '1px solid rgba(167,139,250,0.25)', margin: '-10px' }}
              />

              <div
                className="w-32 h-32 rounded-[2rem] flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Hexagon wholesale/supply chain mark */}
                  <path
                    d="M30 6L50 18V42L30 54L10 42V18L30 6Z"
                    fill="white"
                    fillOpacity="0.12"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <path
                    d="M30 6L50 18L30 30L10 18L30 6Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M30 30V54L10 42V18L30 30Z"
                    fill="white"
                    fillOpacity="0.6"
                  />
                  <path
                    d="M30 30V54L50 42V18L30 30Z"
                    fill="white"
                    fillOpacity="0.35"
                  />
                  {/* Center check mark */}
                  <circle cx="30" cy="28" r="7" fill="#5b21b6" />
                  <path
                    d="M27 28L29 30.5L33 25.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Brand text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
              transition={{ duration: 0.45 }}
              className="text-center"
              dir="rtl"
            >
              {/* English name */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="h-px w-8 bg-white/20" />
                <span className="text-white/50 text-xs tracking-[0.25em] uppercase font-medium">Muzwd</span>
                <div className="h-px w-8 bg-white/20" />
              </div>

              {/* Arabic name — primary */}
              <h1
                className="text-white font-black leading-none mb-3"
                style={{ fontSize: '3.25rem', textShadow: '0 2px 20px rgba(0,0,0,0.3)', letterSpacing: '-0.01em' }}
              >
                مزود
              </h1>

              {/* Divider accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="h-0.5 rounded-full mx-auto mb-3"
                style={{
                  width: '80px',
                  background: 'linear-gradient(90deg, transparent, #a78bfa, #e9d5ff, #a78bfa, transparent)',
                  transformOrigin: 'center',
                }}
              />

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="text-purple-200 text-base font-medium"
                style={{ letterSpacing: '0.01em' }}
              >
                منصة الجملة للتجار السوريين
              </motion.p>
            </motion.div>
          </div>

          {/* Bottom progress bar */}
          <div className="w-full pb-12 px-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Track */}
              <div className="h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                {/* Fill — CSS transition driven by phase */}
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: phase === 0 ? '0%' : phase === 1 ? '35%' : phase === 2 ? '70%' : '100%',
                    transitionDuration: '600ms',
                    transitionTimingFunction: 'ease-out',
                    background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #e9d5ff)',
                  }}
                />
              </div>

              {/* Bottom label */}
              <p className="text-center text-white/30 text-xs mt-3 tracking-widest" dir="rtl">
                جاري التحميل...
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
