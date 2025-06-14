
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppCache } from '@/hooks/useAppCache';

const MobileSplash = () => {
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const { isLoading, cacheStatus, cachedData } = useAppCache();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Navigate to products page when caching is complete
    if (!isLoading && cacheStatus === 'complete') {
      const navigationTimer = setTimeout(() => {
        navigate('/app/products');
      }, 1200); // Reduced time since updates are now faster
      
      return () => clearTimeout(navigationTimer);
    }
  }, [isLoading, cacheStatus, navigate]);

  const getLoadingText = () => {
    switch (cacheStatus) {
      case 'loading':
        return 'جاري التحميل...';
      case 'cached':
        return 'جاري التحقق من العروض والمنتجات الجديدة...';
      case 'updating':
        return 'جاري تحديث العروض والفئات...';
      case 'complete':
        return 'تم التحميل بنجاح!';
      default:
        return 'جاري التحميل...';
    }
  };

  const getLoadingProgress = () => {
    switch (cacheStatus) {
      case 'loading':
        return 25;
      case 'cached':
        return 65; // Higher progress for cached data
      case 'updating':
        return 85; // Almost complete when doing selective updates
      case 'complete':
        return 100;
      default:
        return 25;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content with staggered animations */}
      <div className={`text-center space-y-8 transition-all duration-1000 transform ${
        showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Logo container with advanced animations */}
        <div className="relative group">
          <div className="absolute -inset-8 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse-slow" />
          
          <div className="relative">
            {/* Rotating ring */}
            <div className="absolute inset-0 w-40 h-40 mx-auto border-4 border-white/30 rounded-full animate-spin-slow" />
            
            {/* Inner glow ring */}
            <div className="absolute inset-2 w-36 h-36 mx-auto border-2 border-white/50 rounded-full animate-ping-slow" />
            
            {/* Logo container - bigger and circular */}
            <div className="relative w-40 h-40 mx-auto bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-all duration-700 hover:scale-110 animate-bounce-gentle shadow-2xl">
              <img 
                src="/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png" 
                alt="Style متجر الجمال والأناقة" 
                className="w-32 h-32 object-contain rounded-full animate-fade-in-scale" 
              />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce delay-100" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce delay-300" />
            <div className="absolute top-8 -left-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-bounce delay-500" />
          </div>
        </div>
        
        {/* Title with typewriter effect */}
        <div className={`space-y-3 transition-all duration-1000 delay-300 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <h1 className="text-5xl font-bold tracking-wide bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent animate-gradient-x">
            Style
          </h1>
          <p className="text-xl font-medium opacity-90 animate-fade-in-up delay-500">
            متجر الجمال والأناقة
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-64 mx-auto transition-all duration-1000 delay-700 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getLoadingProgress()}%` }}
            />
          </div>
        </div>

        {/* Enhanced Cache Status Indicator */}
        {cachedData && (
          <div className={`transition-all duration-1000 delay-900 ${
            showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="flex items-center justify-center gap-2 text-sm mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>
                {cachedData.products?.length || 0} منتج • {cachedData.categories?.length || 0} فئة
              </span>
            </div>
            
            {/* Discount status */}
            {cachedData.discounts && (
              <div className="flex items-center justify-center gap-2 text-xs opacity-80">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                <span>
                  {(cachedData.discounts.activeDiscounts?.length || 0) + (cachedData.discounts.discountedProducts?.length || 0)} عرض نشط
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading text */}
        <div className={`transition-all duration-1000 delay-1000 ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <p className="text-lg font-light opacity-80 animate-fade-in-up">
            {getLoadingText()}
          </p>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-1 h-16 bg-white/20 rounded-full animate-wave delay-0" />
          <div className="w-1 h-12 bg-white/30 rounded-full animate-wave delay-100" />
          <div className="w-1 h-20 bg-white/25 rounded-full animate-wave delay-200" />
          <div className="w-1 h-8 bg-white/35 rounded-full animate-wave delay-300" />
          <div className="w-1 h-14 bg-white/20 rounded-full animate-wave delay-400" />
        </div>
      </div>
    </div>
  );
};

export default MobileSplash;
