
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const FeedbackButton = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: 0,
    user_name: '',
    user_email: ''
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const feedbackData = {
        ...data,
        user_id: user?.id || null,
        user_email: data.user_email || user?.email || '',
        rating: data.rating || null
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'تم إرسال رأيك',
        description: 'شكراً لك! تم إرسال رأيك بنجاح وسيصل للإدارة',
      });
      setFormData({
        subject: '',
        message: '',
        rating: 0,
        user_name: '',
        user_email: ''
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الرأي، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى كتابة رأيك',
        variant: 'destructive',
      });
      return;
    }

    if (!user && (!formData.user_name.trim() || !formData.user_email.trim())) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسمك وبريدك الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="focus:outline-none transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= formData.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 hover:from-pink-600 hover:to-purple-700"
        >
          <MessageSquare className="w-5 h-5 mr-3" />
          <span>أرسل رأيك</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            شاركنا رأيك
          </DialogTitle>
          <DialogDescription className="text-center">
            رأيك مهم جداً لتطوير التطبيق وتحسين الخدمة
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">الاسم *</label>
                <Input
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  placeholder="اسمك الكريم"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">البريد الإلكتروني *</label>
                <Input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                  placeholder="your@email.com"
                  className="mt-1"
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-700">الموضوع (اختياري)</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="عن ماذا تريد أن تتحدث؟"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">رأيك *</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="شاركنا رأيك أو اقتراحك..."
              rows={4}
              className="mt-1"
              required
            />
          </div>
          
          <div className="text-center">
            <label className="text-sm font-medium text-gray-700 block mb-3">التقييم (اختياري)</label>
            {renderStars()}
            {formData.rating > 0 && (
              <p className="text-xs text-purple-600 mt-2 font-medium">
                تقييمك: {formData.rating} من 5 نجوم
              </p>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={submitFeedbackMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex-1"
            >
              {submitFeedbackMutation.isPending ? (
                'جاري الإرسال...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  إرسال الرأي
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;
