
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSound } from './useNotificationSound';
import { useToast } from './use-toast';

export const useOrderNotifications = () => {
  const { isAdmin } = useAuth();
  const { playNotificationSound, enableAudio } = useNotificationSound();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const audioEnabledRef = useRef(false);
  const lastProcessedOrderRef = useRef<string | null>(null);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudioOnInteraction = async () => {
      if (!audioEnabledRef.current) {
        await enableAudio();
        audioEnabledRef.current = true;
        console.log('🔊 Audio enabled for notifications');
      }
    };

    document.addEventListener('click', enableAudioOnInteraction, { once: true });
    document.addEventListener('keydown', enableAudioOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
    };
  }, [enableAudio]);

  useEffect(() => {
    if (!isAdmin) return;

    console.log('🔔 Setting up order notifications for admin...');

    // Cleanup existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `orders-notifications-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('🆕 NEW ORDER DETECTED!', payload);
          
          const orderId = payload.new.id;
          
          // Prevent duplicate notifications
          if (lastProcessedOrderRef.current === orderId) {
            console.log('⚠️ Duplicate order notification prevented');
            return;
          }
          
          lastProcessedOrderRef.current = orderId;
          
          // Check store status
          try {
            const { data: settings } = await (supabase as any)
              .from('admin_settings')
              .select('is_store_open')
              .single();
            
            if (settings && !settings.is_store_open) {
              console.log('🏪 Store is closed, skipping notification');
              return;
            }
          } catch (error) {
            console.error('⚠️ Error checking store status:', error);
          }
          
          // Play notification sound
          console.log('🔔 Playing notification sound for new order...');
          try {
            const soundPlayed = await playNotificationSound();
            if (soundPlayed) {
              console.log('✅ Notification sound played successfully');
            } else {
              console.log('⚠️ Sound failed to play, showing alert');
              alert('🔔 طلب جديد! New Order Received!');
            }
          } catch (error) {
            console.error('❌ Error playing notification sound:', error);
            alert('🔔 طلب جديد! New Order Received!');
          }
          
          // Show toast notification
          toast({
            title: "🔔 طلب جديد!",
            description: `تم استلام طلب جديد برقم: ${orderId.slice(0, 8)}...`,
            duration: 8000,
          });
          
          // Send Telegram notification
          try {
            const { error } = await supabase.functions.invoke('send-telegram-notification', {
              body: { orderId }
            });
            
            if (error) {
              console.error('❌ Error sending telegram notification:', error);
            }
          } catch (error) {
            console.error('❌ Error invoking telegram function:', error);
          }

          // Send email notification
          try {
            console.log('📧 Sending email notification...');
            const { error } = await supabase.functions.invoke('send-order-notification', {
              body: { orderId }
            });
            
            if (error) {
              console.error('❌ Error sending email notification:', error);
            } else {
              console.log('✅ Email notification sent successfully');
            }
          } catch (error) {
            console.error('❌ Error invoking email notification function:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to order notifications');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🧹 Cleaning up order notifications...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAdmin, playNotificationSound, toast, enableAudio]);

  // Test notification function
  const triggerTestNotification = async () => {
    console.log('🧪 Testing notification sound...');
    
    try {
      const soundPlayed = await playNotificationSound();
      if (soundPlayed) {
        console.log('✅ Test notification sound played successfully');
        toast({
          title: "🔔 اختبار الإشعار",
          description: "تم تشغيل صوت الإشعار بنجاح",
          duration: 4000,
        });
      } else {
        console.log('⚠️ Test sound failed');
        toast({
          title: "⚠️ فشل الاختبار",
          description: "لم يتم تشغيل الصوت، تحقق من إعدادات المتصفح",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('❌ Error in test notification:', error);
      toast({
        title: "❌ خطأ في الاختبار",
        description: "حدث خطأ أثناء اختبار الصوت",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return { triggerTestNotification };
};
