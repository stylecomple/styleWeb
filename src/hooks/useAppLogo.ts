
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAppLogo = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('app_logo_url')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    }
  });

  return {
    logoUrl: settings?.app_logo_url,
    isLoading
  };
};
