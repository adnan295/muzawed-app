import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => onFinish(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #5b21b6 60%, #4c1d95 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -right-32 w-96 h-96 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-300 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.1, 0.03] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-1/3 left-1/4 w-64 h-64 bg-pink-300 rounded-full blur-3xl"
            />

            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  y: [100, -200],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: 3 + Math.random() * 5,
                  height: 3 + Math.random() * 5,
                  left: `${Math.random() * 100}%`,
                  bottom: '-10%',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: phase >= 0 ? 1 : 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
              className="relative"
            >
              <div className="w-28 h-28 rounded-[2rem] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl shadow-black/20">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <path d="M28 8L44 18V38L28 48L12 38V18L28 8Z" fill="white" fillOpacity="0.9" />
                    <path d="M28 8L44 18L28 28L12 18L28 8Z" fill="white" />
                    <path d="M28 28V48L12 38V18L28 28Z" fill="white" fillOpacity="0.7" />
                    <path d="M28 28V48L44 38V18L28 28Z" fill="white" fillOpacity="0.5" />
                    <circle cx="28" cy="26" r="6" fill="#7c3aed" />
                    <path d="M25 26L27 28L31 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 1 ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg"
              >
                <span className="text-sm">✨</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                مزود
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: phase >= 1 ? 80 : 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="h-1 bg-gradient-to-l from-yellow-400 to-white/60 rounded-full mx-auto mb-3"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="text-purple-200 text-sm font-medium"
              >
                مزودك الأول للتجارة بالجملة
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-1.5 mt-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
