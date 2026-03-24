import { useState, useCallback, useEffect } from "react";
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
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Cart from "@/pages/Cart";
import Profile from "@/pages/Profile";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Wallet from "@/pages/Wallet";
import SearchResults from "@/pages/SearchResults";
import Offers from "@/pages/Offers";
import Notifications from "@/pages/Notifications";
import Support from "@/pages/Support";
import Favorites from "@/pages/Favorites";
import Addresses from "@/pages/Addresses";
import FacilityDetails from "@/pages/FacilityDetails";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import CategoryProducts from "@/pages/CategoryProducts";
import Onboarding from "@/pages/Onboarding";
import BuyAgain from "@/pages/BuyAgain";
import OrderDetails from "@/pages/OrderDetails";
import Cards from "@/pages/Cards";
import Referral from "@/pages/Referral";
import Invoice from "@/pages/Invoice";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import Promo from "@/pages/Promo";
import Register from "@/pages/Register";
import PhoneVerification from "@/pages/PhoneVerification";
import Terms from "@/pages/Terms";
import DeleteAccount from "@/pages/DeleteAccount";
import Driver from "@/pages/Driver";
import FlashSales from "@/pages/FlashSales";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

function ScrollRestoration() {
  useScrollRestoration();
  return null;
}

function Router() {
  return (
    <>
    <ScrollRestoration />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-phone" component={PhoneVerification} />
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
