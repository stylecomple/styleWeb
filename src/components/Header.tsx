import React, { useState } from 'react';
import { ShoppingCart, User, Shield, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAppLogo } from '@/hooks/useAppLogo';

const Header = () => {
  const { user, isAdmin, isOwner, isOrderManager, loading, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { logoUrl } = useAppLogo();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = async () => {
    if (user) {
      try {
        console.log('Attempting to sign out...');
        await signOut();
        console.log('Sign out successful');
        navigate('/');
        setMobileMenuOpen(false);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      navigate('/auth');
      setMobileMenuOpen(false);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Debug logging
  console.log('Header render - User:', user?.id, 'isAdmin:', isAdmin, 'isOwner:', isOwner, 'isOrderManager:', isOrderManager, 'loading:', loading);
  
  // Show admin panel button for any user with admin privileges (admin, owner, or order manager)
  const showAdminPanel = !loading && user && (isAdmin || isOwner || isOrderManager);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-pink-100">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo with app logo */}
          <div 
            className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse cursor-pointer group"
            onClick={handleHomeClick}
          >
            {/* App Logo */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                  alt="Style" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Style
              </h1>
              <span className="text-xs md:text-sm text-gray-500 hidden sm:block font-medium">
                متجر الجمال والأناقة
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCartClick}
              className="group flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 relative rounded-full px-4 py-2 transition-all duration-300 hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>السلة</span>
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
            
            {/* Admin Button - Show for admin, owner, or order manager */}
            {showAdminPanel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminClick}
                className="flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full px-4 py-2 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                لوحة التحكم
              </Button>
            )}
            
            {/* Auth Button - Show loading state or auth button */}
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">جاري التحميل...</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuthClick}
                className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 rounded-full px-4 py-2 transition-all duration-300"
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCartClick}
              className="relative rounded-full p-2 border-pink-200 text-pink-600"
            >
              <ShoppingCart className="w-4 h-4" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px]">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
            
            {/* Mobile Menu Toggle - Show loading or menu button */}
            {loading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="border-gray-200 rounded-full p-2"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu - Only show when not loading */}
        {mobileMenuOpen && !loading && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col space-y-3">
              {showAdminPanel && (
                <Button
                  variant="outline"
                  onClick={handleAdminClick}
                  className="w-full justify-start gap-2 border-indigo-200 text-indigo-600"
                >
                  <Shield className="w-4 h-4" />
                  لوحة التحكم
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleAuthClick}
                className="w-full justify-start gap-2 border-gray-200"
              >
                {user ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </div>
            
            {user && (
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-600">
                  مرحباً <span className="font-semibold text-purple-600">{user.user_metadata?.full_name || user.email}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
