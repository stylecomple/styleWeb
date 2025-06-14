
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { useAppLogo } from '@/hooks/useAppLogo';
import BottomNavigation from './BottomNavigation';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  backPath?: string;
}

const MobileAppLayout = ({ children, title, showBackButton = true, backPath }: MobileAppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAppTheme();
  const { logoUrl } = useAppLogo();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      // Smart back navigation within the app
      const currentPath = location.pathname;
      
      if (currentPath.startsWith('/app/category/')) {
        navigate('/app/categories');
      } else if (currentPath.startsWith('/app/product/')) {
        navigate('/app/products');
      } else if (currentPath === '/app/auth') {
        navigate('/app/products');
      } else if (currentPath === '/app/orders') {
        navigate('/app/account');
      } else {
        // Default fallback to products page
        navigate('/app/products');
      }
    }
  };

  // Hide back button on main navigation pages
  const hideBackButton = [
    '/app/products', 
    '/app/categories', 
    '/app/cart', 
    '/app/account',
    '/app/search'
  ].includes(location.pathname);

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      {/* Header with slide down animation */}
      <div className={`border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-40 transition-all duration-500 transform backdrop-blur-sm ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } ${
        theme === 'dark'
          ? 'bg-gray-900/95 border-gray-700 text-white'
          : 'bg-white/95 border-gray-200 text-gray-800'
      }`}>
        {showBackButton && !hideBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={`p-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-pink-900/30 hover:text-pink-400 text-gray-300'
                : 'hover:bg-pink-50 hover:text-pink-600 text-gray-700'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
        
        {/* App Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30"></div>
            <div className="relative w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <img 
                src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                alt="Style" 
                className="w-7 h-7 object-contain rounded-full"
              />
            </div>
          </div>
        </div>
        
        <h1 className="text-lg font-semibold flex-1">{title}</h1>
      </div>

      {/* Content with custom scrollbar and fade in animation */}
      <ScrollArea className="flex-1">
        <div className={`pb-32 transition-all duration-700 ease-out transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {children}
        </div>
      </ScrollArea>

      {/* Bottom Navigation - always visible */}
      <BottomNavigation />
    </div>
  );
};

export default MobileAppLayout;
