
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useChangeLogger = () => {
  const { user } = useAuth();

  const logChange = async (
    actionType: string,
    entityType: string,
    entityId?: string,
    details?: any
  ) => {
    if (!user) return;

    try {
      // Get admin name from user metadata first, then fallback to profiles
      let adminName = user.user_metadata?.full_name || user.email || 'Unknown';
      
      // Try to get additional profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        adminName = profile.full_name;
      }

      await supabase
        .from('changes_log')
        .insert({
          admin_id: user.id,
          admin_name: adminName,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          details: details
        });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  };

  return { logChange };
};
