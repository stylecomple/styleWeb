
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles, Heart, ShoppingBag } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'مرحباً بك في Style! 💄',
      description: 'متجرك المفضل للجمال والأناقة حيث ستجد كل ما تحتاجينه لتكوني أجمل',
      icon: <Sparkles className="w-16 h-16 text-pink-500" />,
      color: 'from-pink-500 to-purple-600'
    },
    {
      title: 'منتجات عالية الجودة ✨',
      description: 'نوفر لك أفضل منتجات التجميل والعطور من أشهر العلامات التجارية العالمية',
      icon: <Heart className="w-16 h-16 text-red-500" />,
      color: 'from-red-500 to-pink-600'
    },
    {
      title: 'تسوق بسهولة وأمان 🛍️',
      description: 'تصفح منتجاتنا، أضفها للسلة، واطلب بكل سهولة مع توصيل سريع وآمن',
      icon: <ShoppingBag className="w-16 h-16 text-purple-500" />,
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-4 border-0 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative p-6 text-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-pink-500 scale-125' 
                      : index < currentStep 
                      ? 'bg-pink-300' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className={`bg-gradient-to-r ${steps[currentStep].color} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-scale-in`}>
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center">
                {steps[currentStep].icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 animate-fade-in">
              {steps[currentStep].title}
            </h2>
            
            <p className="text-gray-600 leading-relaxed animate-fade-in">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} من {steps.length}
            </span>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'ابدأ التسوق' : 'التالي'}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
