import { Link, useLocation } from 'wouter';
import { Home, Grid, ShoppingCart, User, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function MobileLayout({ children, hideHeader = false }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/categories', icon: Grid, label: 'الأقسام' },
    { href: '/cart', icon: ShoppingCart, label: 'السلة' },
    { href: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-border/50">
      {/* Header */}
      {!hideHeader && (
        <header className="bg-primary text-primary-foreground p-4 rounded-b-3xl shadow-lg relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="font-medium truncate max-w-[150px]">الرياض، حي الملقا</span>
              <span className="text-xs opacity-70">تغيير</span>
            </div>
            <div className="font-bold text-xl tracking-tight">ساري</div>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="bg-white text-foreground pl-4 pr-10 h-11 rounded-xl border-0 shadow-sm focus-visible:ring-secondary" 
              placeholder="عن ماذا تبحث اليوم؟" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </header>
      )}

      {/* Content */}
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 px-4 py-2 z-50 max-w-md mx-auto shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5 absolute bottom-1" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
