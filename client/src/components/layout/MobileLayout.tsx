import { Link, useLocation } from 'wouter';
import { Home, Grid, ShoppingCart, User, Search, Bell, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function MobileLayout({ children, hideHeader = false }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Get cart count
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/cart/${user.id}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
  });

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/categories', icon: Grid, label: 'الأقسام' },
    { href: '/cart', icon: ShoppingCart, label: 'السلة', badge: cartCount > 0 ? cartCount : null },
    { href: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="min-h-screen gradient-mesh pb-24 font-sans max-w-md mx-auto overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-md mx-auto">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      {!hideHeader && (
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="gradient-primary text-white p-5 pb-8 rounded-b-[2rem] shadow-xl relative z-10 overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-2xl tracking-tight">مزود</div>
              </div>
              <Link href="/notifications">
                <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/15 hover:bg-white/25 text-white relative backdrop-blur-sm border border-white/10">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </Button>
              </Link>
            </div>
            
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl flex items-center overflow-hidden shadow-lg shadow-black/5">
                <Search className="w-5 h-5 text-gray-400 mr-4 ml-2" />
                <Input 
                  className="border-none shadow-none focus-visible:ring-0 bg-transparent h-13 text-right placeholder:text-gray-400 text-gray-700 font-medium" 
                  placeholder="ابحث عن منتج أو علامة تجارية..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="m-1.5 rounded-xl h-10 w-10 p-0 gradient-primary border-0 shadow-md disabled:opacity-50"
                >
                  <Search className="w-4 h-4 text-white" />
                </Button>
              </div>
            </form>
          </div>
        </motion.header>
      )}

      {/* Content */}
      <main className="relative z-10 page-transition">
        {children}
      </main>

      {/* Premium Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pb-2 pt-1">
        <div className="glass rounded-[1.75rem] px-2 py-2 shadow-xl shadow-black/10">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div 
                    className="relative"
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className={cn(
                      "flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl transition-all duration-300 relative",
                      isActive 
                        ? "text-white" 
                        : "text-gray-500 hover:text-gray-700"
                    )}>
                      {/* Active Background */}
                      {isActive && (
                        <motion.div 
                          layoutId="navIndicator"
                          className="absolute inset-0 gradient-primary rounded-2xl shadow-lg shadow-primary/30"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <div className="relative">
                          <item.icon className={cn(
                            "w-6 h-6 transition-all",
                            isActive && "drop-shadow-lg"
                          )} strokeWidth={isActive ? 2.5 : 2} />
                          
                          {/* Cart Badge */}
                          {item.badge && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -left-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white"
                            >
                              {item.badge}
                            </motion.span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[11px] font-semibold transition-all",
                          isActive ? "text-white" : ""
                        )}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
