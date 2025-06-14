
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, Star, Heart, Smartphone } from 'lucide-react';
import AnimatedStats from './AnimatedStats';
import CountUpAnimation from './CountUpAnimation';
import PWAPrompt from './PWAPrompt';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onStartShopping: () => void;
  onBrowseCollections: () => void;
  onCategoryClick: (categoryId: string) => void;
  productCount?: number;
}

const Hero = ({
  onStartShopping,
  onBrowseCollections,
  onCategoryClick,
  productCount
}: HeroProps) => {
  const navigate = useNavigate();

  const categories = [{
    id: 'makeup',
    name: 'مكياج',
    icon: '💄',
    color: 'from-pink-400 to-rose-500'
  }, {
    id: 'perfumes',
    name: 'عطور',
    icon: '🌸',
    color: 'from-purple-400 to-indigo-500'
  }, {
    id: 'flowers',
    name: 'ورد',
    icon: '🌹',
    color: 'from-red-400 to-pink-500'
  }, {
    id: 'home',
    name: 'مستلزمات منزلية',
    icon: '🏠',
    color: 'from-blue-400 to-cyan-500'
  }];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          {/* Animated Logo Section - Made Circular */}
          <div className="mb-12 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl border border-white/50 transform hover:scale-110 transition-all duration-500 hover:rotate-3">
                <img alt="متجر الجمال والأناقة" className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full filter drop-shadow-lg animate-fade-in" src="/lovable-uploads/0da9cc01-5559-440a-9102-1c28fa7d67dc.jpg" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-pink-600" />
            <span className="text-pink-800 font-medium">أجمل المنتجات للعائلة</span>
            <Sparkles className="w-5 h-5 text-pink-600" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight my-0 py-[10px]">
            متجر الجمال
            <br />
            والأناقة
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            اكتشفوا عالماً من الجمال والأناقة مع مجموعتنا المتميزة من المكياج والعطور وكل ما تحتاجونه لإطلالة مثالية
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button onClick={onStartShopping} size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <ShoppingBag className="w-5 h-5 mr-2" />
              ابدأوا التسوق الآن
            </Button>
            
            <Button onClick={onBrowseCollections} variant="outline" size="lg" className="border-2 border-pink-300 text-pink-700 hover:bg-pink-50 px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:-translate-y-1">
              <Heart className="w-5 h-5 mr-2" />
              تصفحوا المجموعات
            </Button>
            
            {/* Mobile App Button */}
            <Button 
              onClick={() => navigate('/app/products')} 
              variant="outline" 
              size="lg" 
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:-translate-y-1"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              التطبيق
            </Button>
          </div>

          {/* Responsive Stats Section with Product Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 max-w-6xl mx-auto px-4">
            {/* Product Count Card - Responsive and prominent */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-3">
                <CountUpAnimation end={productCount || 1000} duration={2500} suffix="+" />
              </div>
              <div className="text-gray-700 font-semibold text-lg md:text-xl">منتج متنوع</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
            </div>
            
            {/* Other Stats Cards */}
            <AnimatedStats />
          </div>
        </div>

        {/* Categories Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            تسوقوا حسب الفئة
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            اختاروا من مجموعتنا المتنوعة من المنتجات عالية الجودة
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => (
              <div key={category.id} onClick={() => onCategoryClick(category.id)} className="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
                <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20`}>
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-white/80 fill-current" />
                    <Star className="w-4 h-4 text-white/80 fill-current" />
                    <Star className="w-4 h-4 text-white/80 fill-current" />
                    <Star className="w-4 h-4 text-white/80 fill-current" />
                    <Star className="w-4 h-4 text-white/80 fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PWA Installation Prompt */}
      <PWAPrompt />
    </div>
  );
};

export default Hero;
