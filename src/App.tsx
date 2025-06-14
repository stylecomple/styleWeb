
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppThemeProvider } from "@/contexts/AppThemeContext";
import { CacheProvider } from "@/contexts/CacheContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import AdminPanel from "./pages/AdminPanel";
import OwnerPanelPage from "./pages/OwnerPanel";
import NotFound from "./pages/NotFound";

// Mobile App Pages
import MobileSplash from "./pages/app/MobileSplash";
import MobileProducts from "./pages/app/MobileProducts";
import MobileProductDetail from "./pages/app/MobileProductDetail";
import MobileCategories from "./pages/app/MobileCategories";
import MobileCategoryDetail from "./pages/app/MobileCategoryDetail";
import MobileSearch from "./pages/app/MobileSearch";
import MobileCart from "./pages/app/MobileCart";
import MobileAuth from "./pages/app/MobileAuth";
import MobileAccount from "./pages/app/MobileAccount";
import MobileSettings from "./pages/app/MobileSettings";
import MobileOrders from "./pages/app/MobileOrders";
import MobilePayment from "./pages/app/MobilePayment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <AppThemeProvider>
                <CacheProvider>
                  <Routes>
                    {/* Main route is now the mobile app */}
                    <Route path="/" element={<MobileSplash />} />
                    
                    {/* Desktop Routes */}
                    <Route path="/desktop" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/owner-panel" element={<OwnerPanelPage />} />
                    
                    {/* Mobile App Routes */}
                    <Route path="/app" element={<MobileSplash />} />
                    <Route path="/app/products" element={<MobileProducts />} />
                    <Route path="/app/product/:id" element={<MobileProductDetail />} />
                    <Route path="/app/categories" element={<MobileCategories />} />
                    <Route path="/app/category/:categoryId" element={<MobileCategoryDetail />} />
                    <Route path="/app/search" element={<MobileSearch />} />
                    <Route path="/app/cart" element={<MobileCart />} />
                    <Route path="/app/auth" element={<MobileAuth />} />
                    <Route path="/app/account" element={<MobileAccount />} />
                    <Route path="/app/settings" element={<MobileSettings />} />
                    <Route path="/app/orders" element={<MobileOrders />} />
                    <Route path="/app/payment" element={<MobilePayment />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </CacheProvider>
              </AppThemeProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
