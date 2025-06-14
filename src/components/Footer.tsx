
import React from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/style_for_cosmetic',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/2cosmetic',
      icon: Facebook,
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/style_cosmetic',
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-.38.24-1.07.7-.96.66-1.89 1.31-1.89 1.31s-.22.14-.63.02c-.37-.11-.8-.25-1.32-.46-.64-.26-.64-.62-.01-.65.91-.05 1.91-.47 2.92-.94 2.92-1.38 4.15-2.07 4.15-2.07s.4-.14.67-.02c.17.08.29.19.31.33-.01.06-.01.24-.16.81z"/>
        </svg>
      ),
      color: 'from-sky-500 to-blue-600',
      hoverColor: 'hover:from-sky-600 hover:to-blue-700'
    }
  ];

  const handlePhoneCall = () => {
    window.open('tel:0782 376 3929', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:stylecomplex2021@gmail.com', '_self');
  };

  const handleLocationClick = () => {
    window.open('https://maps.google.com/?q=شارع العمل الشعبي, Baghdad, Iraq', '_blank');
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-600/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Style
          </h2>
          <p className="text-gray-300 text-lg mb-2">متجر الجمال والأناقة</p>
          <p className="text-gray-400">تواصلوا معنا عبر القنوات التالية</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Social Media Links - Better arranged */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-center mb-8 text-pink-300">
              تابعونا على وسائل التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-center gap-4 bg-gradient-to-r ${link.color} ${link.hoverColor} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg py-8 group-hover:transform group-hover:-translate-y-1`}
                    >
                      <IconComponent />
                      <span className="font-semibold">{link.name}</span>
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact and Working Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center md:text-right text-pink-300">
                معلومات التواصل
              </h3>
              
              {/* Phone */}
              <Button
                onClick={handlePhoneCall}
                className="w-full justify-start gap-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg py-6 group"
              >
                <Phone className="group-hover:animate-pulse" />
                <div className="text-right">
                  <div>اتصل بنا</div>
                  <div className="text-sm opacity-90">0782 376 3929</div>
                </div>
                <div className="mr-auto opacity-60 group-hover:opacity-100 transition-opacity">
                  📞
                </div>
              </Button>

              {/* Email */}
              <Button
                onClick={handleEmailClick}
                className="w-full justify-start gap-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg py-6 group"
              >
                <Mail className="group-hover:animate-pulse" />
                <div className="text-right">
                  <div>راسلنا</div>
                  <div className="text-sm opacity-90">stylecomplex2021@gmail.com</div>
                </div>
                <div className="mr-auto opacity-60 group-hover:opacity-100 transition-opacity">
                  ✉️
                </div>
              </Button>

              {/* Location */}
              <Button
                onClick={handleLocationClick}
                className="w-full justify-start gap-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg py-6 group"
              >
                <MapPin className="group-hover:animate-pulse" />
                <div className="text-right">
                  <div>موقعنا</div>
                  <div className="text-sm opacity-90">شارع العمل الشعبي، Baghdad, Iraq</div>
                </div>
                <div className="mr-auto opacity-60 group-hover:opacity-100 transition-opacity">
                  📍
                </div>
              </Button>
            </div>

            {/* Working Hours */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center md:text-right text-pink-300">
                ساعات العمل
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">السبت - الخميس:</span>
                    <span className="text-green-300">10:00 صباحاً - 12:00 مساءً</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">الجمعة:</span>
                      <span className="text-green-300">4:00 عصراً - 12:00 مساءً</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <h4 className="font-semibold mb-3 text-pink-300">خدمة العملاء</h4>
            <p className="text-gray-300">
              نحن هنا لخدمتكم على مدار الساعة عبر وسائل التواصل المختلفة
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Style - متجر الجمال والأناقة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
