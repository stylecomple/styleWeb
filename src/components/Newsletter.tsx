
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="relative py-12 md:py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 md:w-32 md:h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-12 h-12 md:w-24 md:h-24 bg-white rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 md:w-40 md:h-40 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 md:w-28 md:h-28 bg-white rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 md:mb-8">
            <Mail className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            اشترك في نشرتنا الإخبارية
          </h2>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl mb-3 md:mb-4 text-pink-100">
            كن أول من يعلم بأحدث المنتجات والعروض الحصرية
          </p>
          
          <p className="text-sm md:text-lg mb-8 md:mb-12 text-white/80 max-w-2xl mx-auto px-4">
            احصل على خصم 10% على طلبك الأول + نصائح جمالية حصرية وعروض خاصة مباشرة في بريدك الإلكتروني
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm md:text-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                اشتراك
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 px-4">
            <div className="text-center">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🎁</div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">عروض حصرية</h3>
              <p className="text-white/80 text-xs md:text-sm">خصومات خاصة للمشتركين فقط</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">✨</div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">نصائح جمالية</h3>
              <p className="text-white/80 text-xs md:text-sm">أحدث اتجاهات الموضة والجمال</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl mb-2 md:mb-3">🚀</div>
              <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">إطلاق مبكر</h3>
              <p className="text-white/80 text-xs md:text-sm">كن أول من يحصل على المنتجات الجديدة</p>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-white/60 text-xs md:text-sm mt-6 md:mt-8 px-4">
            نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
