import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/categories" component={Categories} />
      <Route path="/category/:id" component={CategoryProducts} />
      <Route path="/cart" component={Cart} />
      <Route path="/profile" component={Profile} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/order/:id" component={OrderDetails} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/search/:query" component={SearchResults} />
      <Route path="/offers" component={Offers} />
      <Route path="/buy-again" component={BuyAgain} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/support" component={Support} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/addresses" component={Addresses} />
      <Route path="/facility" component={FacilityDetails} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
