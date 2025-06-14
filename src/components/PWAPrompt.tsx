
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PWAPromptProps {
  onClose?: () => void;
}

const PWAPrompt = ({ onClose }: PWAPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastDismissed = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);
      
      // Show prompt if never dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.removeItem('pwa-prompt-dismissed');
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    onClose?.();
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">تحميل التطبيق</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-white/90 mb-4 text-sm leading-relaxed">
          احصلوا على تجربة أفضل مع تطبيق متجر الجمال والأناقة على هاتفكم!
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-white text-purple-600 hover:bg-white/90 font-semibold flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            تحميل الآن
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            لاحقاً
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;
