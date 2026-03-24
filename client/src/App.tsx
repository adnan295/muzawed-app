import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import { NavigationProvider } from "@/lib/NavigationContext";
import { SplashScreen } from "@/components/SplashScreen";
import { UpdateModal } from "@/components/UpdateModal";
import { APP_VERSION, isVersionOutdated } from "@/lib/appVersion";
import { Capacitor } from "@capacitor/core";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

// Eager — critical first-paint routes
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import PhoneVerification from "@/pages/PhoneVerification";
import NotFound from "@/pages/not-found";

// Lazy — all other pages (split into separate chunks to reduce initial JS)
const Categories = lazy(() => import("@/pages/Categories"));
const Cart = lazy(() => import("@/pages/Cart"));
const Profile = lazy(() => import("@/pages/Profile"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const Offers = lazy(() => import("@/pages/Offers"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Support = lazy(() => import("@/pages/Support"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const FacilityDetails = lazy(() => import("@/pages/FacilityDetails"));
const Settings = lazy(() => import("@/pages/Settings"));
const CategoryProducts = lazy(() => import("@/pages/CategoryProducts"));
const BuyAgain = lazy(() => import("@/pages/BuyAgain"));
const Cards = lazy(() => import("@/pages/Cards"));
const Referral = lazy(() => import("@/pages/Referral"));
const Invoice = lazy(() => import("@/pages/Invoice"));
const Terms = lazy(() => import("@/pages/Terms"));
const DeleteAccount = lazy(() => import("@/pages/DeleteAccount"));
const FlashSales = lazy(() => import("@/pages/FlashSales"));
const Promo = lazy(() => import("@/pages/Promo"));
// Heaviest pages get their own chunks
const Admin = lazy(() => import("@/pages/Admin"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const Driver = lazy(() => import("@/pages/Driver"));

function PageFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 rounded-full bg-purple-400" />
        </div>
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

function ScrollRestoration() {
  useScrollRestoration();
  return null;
}

function Router() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          {/* Eager routes */}
          <Route path="/" component={Home} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify-phone" component={PhoneVerification} />
          {/* Lazy routes */}
          <Route path="/categories" component={Categories} />
          <Route path="/category/:id" component={CategoryProducts} />
          <Route path="/cart" component={Cart} />
          <Route path="/profile" component={Profile} />
          <Route path="/product/:id" component={ProductDetails} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/orders/:id" component={OrderDetails} />
          <Route path="/order/:id" component={OrderDetails} />
          <Route path="/invoice/:id" component={Invoice} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/cards" component={Cards} />
          <Route path="/referral" component={Referral} />
          <Route path="/search/:query" component={SearchResults} />
          <Route path="/offers" component={Offers} />
          <Route path="/buy-again" component={BuyAgain} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/support" component={Support} />
          <Route path="/privacy-policy" component={Terms} />
          <Route path="/delete-account" component={DeleteAccount} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/addresses" component={Addresses} />
          <Route path="/facility" component={FacilityDetails} />
          <Route path="/settings" component={Settings} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/driver" component={Driver} />
          <Route path="/flash-sales" component={FlashSales} />
          <Route path="/promo/:bannerId" component={Promo} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

interface VersionInfo {
  minVersion: string;
  playStoreUrl: string;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Check for app updates after splash dismisses — Android only
  useEffect(() => {
    if (showSplash) return;
    if (!Capacitor.isNativePlatform()) return;
    if (Capacitor.getPlatform() !== "android") return;

    fetch("/api/app/version")
      .then((r) => r.json())
      .then((data: VersionInfo) => {
        if (data?.minVersion && isVersionOutdated(APP_VERSION, data.minVersion)) {
          setUpdateInfo(data);
        }
      })
      .catch(() => {});
  }, [showSplash]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationProvider>
          <TooltipProvider>
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            {updateInfo && !showSplash && (
              <UpdateModal
                playStoreUrl={updateInfo.playStoreUrl}
                currentVersion={APP_VERSION}
                minVersion={updateInfo.minVersion}
              />
            )}
            <Toaster />
            <SonnerToaster position="top-center" richColors />
            <Router />
          </TooltipProvider>
        </NavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
