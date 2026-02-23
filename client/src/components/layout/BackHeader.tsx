import { ArrowRight } from 'lucide-react';
import { useNavigation } from '@/lib/NavigationContext';
import { motion } from 'framer-motion';

interface BackHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function BackHeader({ title, children }: BackHeaderProps) {
  const { goBack } = useNavigation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="gradient-primary text-white p-4 pb-5 rounded-b-[1.5rem] shadow-xl relative z-10 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <button
          onClick={goBack}
          data-testid="button-back"
          className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold flex-1">{title}</h1>
        {children}
      </div>
    </motion.header>
  );
}
