
import React from 'react';
import { Sparkles, Zap, Star } from 'lucide-react';

interface GlobalDiscountAlertProps {
  discountPercentage: number;
}

const GlobalDiscountAlert = ({ discountPercentage }: GlobalDiscountAlertProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-2 left-10 animate-bounce delay-100">
          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
        <div className="absolute top-6 right-20 animate-bounce delay-300">
          <Star className="w-5 h-5 text-yellow-200 animate-spin" />
        </div>
        <div className="absolute bottom-4 left-1/4 animate-bounce delay-500">
          <Zap className="w-7 h-7 text-orange-300 animate-pulse" />
        </div>
        <div className="absolute bottom-2 right-1/3 animate-bounce delay-700">
          <Sparkles className="w-4 h-4 text-pink-200 animate-spin" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white rounded-full opacity-60 animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Main discount text with glow effect */}
          <div className="relative inline-block">
            <h2 
              className="text-4xl md:text-6xl font-black text-white mb-4 animate-pulse"
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6)',
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))'
              }}
            >
              خصم {discountPercentage}%
            </h2>
            
            {/* Glowing ring around the text */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
            <p className="text-2xl md:text-3xl font-bold text-white animate-bounce">
              على جميع المنتجات
            </p>
            <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>

          {/* Animated call to action */}
          <div className="relative">
            <p className="text-lg md:text-xl text-pink-100 font-semibold animate-pulse">
              🔥 عرض محدود - لا تفوت الفرصة! 🔥
            </p>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-white/20 rounded-lg blur-xl animate-ping opacity-50"></div>
          </div>

          {/* Floating emojis */}
          <div className="mt-4 text-3xl">
            <span className="inline-block animate-bounce delay-100">🎉</span>
            <span className="inline-block animate-bounce delay-200 mx-2">💎</span>
            <span className="inline-block animate-bounce delay-300">🛍️</span>
            <span className="inline-block animate-bounce delay-400 mx-2">✨</span>
            <span className="inline-block animate-bounce delay-500">🎁</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDiscountAlert;
