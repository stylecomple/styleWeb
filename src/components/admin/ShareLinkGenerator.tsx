
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ShareLinkGenerator = () => {
  const [shareLink, setShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const generateShareLink = () => {
    // Generate the app share link (points to the splash screen)
    const currentUrl = window.location.origin;
    const appLink = `${currentUrl}/app`;
    setShareLink(appLink);
    
    // Auto-copy to clipboard
    navigator.clipboard.writeText(appLink).then(() => {
      setIsCopied(true);
      toast({
        title: "تم إنشاء الرابط",
        description: "تم نسخ رابط التطبيق إلى الحافظة تلقائياً",
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(() => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
      });
    });
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        setIsCopied(true);
        toast({
          title: "تم النسخ",
          description: "تم نسخ الرابط إلى الحافظة",
        });
        
        setTimeout(() => setIsCopied(false), 3000);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="share-link">رابط مشاركة التطبيق</Label>
        <p className="text-sm text-muted-foreground">
          قم بإنشاء رابط لمشاركة التطبيق مع العملاء. سيتم فتح التطبيق من الشاشة الترحيبية.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={generateShareLink}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
        >
          <Share className="w-4 h-4" />
          إنشاء رابط المشاركة
        </Button>
      </div>

      {shareLink && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <Label htmlFor="generated-link">الرابط المُنشأ</Label>
          <div className="flex gap-2">
            <Input
              id="generated-link"
              value={shareLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 min-w-[100px]"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  نسخ
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• هذا الرابط سيوجه العملاء مباشرة إلى التطبيق</p>
            <p>• يمكن مشاركة هذا الرابط عبر وسائل التواصل الاجتماعي أو الرسائل</p>
            <p>• الرابط يفتح شاشة الترحيب ثم ينتقل تلقائياً إلى صفحة المنتجات</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareLinkGenerator;
