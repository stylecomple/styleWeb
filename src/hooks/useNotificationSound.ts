
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
  }, []);

  // Create a simple beep sound using Web Audio API
  const createBeepSound = useCallback(async () => {
    if (!audioContextRef.current) {
      await initializeAudio();
    }
    
    if (!audioContextRef.current) {
      return false;
    }

    try {
      const context = audioContextRef.current;
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Create oscillator for beep sound
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Configure the beep sound
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
      oscillator.type = 'sine';

      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6);

      // Play the sound
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.6);

      return true;
    } catch (error) {
      console.error('Error creating beep sound:', error);
      return false;
    }
  }, [initializeAudio]);

  const playNotificationSound = useCallback(async () => {
    console.log('🔊 Playing notification sound...');
    
    try {
      // Try to get custom sound from settings first
      const { data: settings } = await (supabase as any)
        .from('admin_settings')
        .select('notification_sound_url')
        .single();

      let soundPlayed = false;

      // Try custom sound if available
      if (settings?.notification_sound_url) {
        try {
          const audio = new Audio(settings.notification_sound_url);
          audio.volume = 0.8;
          audio.crossOrigin = 'anonymous';
          
          await audio.play();
          console.log('✅ Custom sound played');
          soundPlayed = true;
        } catch (error) {
          console.log('❌ Custom sound failed, trying fallback');
        }
      }

      // If custom sound failed or not available, use Web Audio API beep
      if (!soundPlayed) {
        soundPlayed = await createBeepSound();
        if (soundPlayed) {
          console.log('✅ Beep sound played');
        }
      }

      // Final fallback: try a simple audio element with data URL
      if (!soundPlayed) {
        try {
          // Simple beep sound as data URL
          const beepDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIaAyjE8N2QQAoUXrPl76RQDwQ+ltryxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg+ltzyxnkpBSl+zPLaizsHGGS57+OZSA4PVqXn77BdGAg=';
          const audio = new Audio(beepDataUrl);
          audio.volume = 0.8;
          await audio.play();
          console.log('✅ Fallback beep played');
          soundPlayed = true;
        } catch (error) {
          console.error('❌ All sound methods failed:', error);
        }
      }

      return soundPlayed;
    } catch (error) {
      console.error('❌ Error in playNotificationSound:', error);
      return false;
    }
  }, [createBeepSound]);

  const enableAudio = useCallback(async () => {
    await initializeAudio();
  }, [initializeAudio]);

  return { playNotificationSound, enableAudio };
};
