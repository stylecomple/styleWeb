
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChangeLogger } from './useChangeLogger';

interface AdminSettings {
  is_store_open: boolean;
  favicon_url?: string;
  visa_card_config: {
    enabled: boolean;
    merchant_id?: string;
    api_key?: string;
    secret_key?: string;
  };
  zain_cash_config: {
    enabled: boolean;
    merchant_id?: string;
    api_key?: string;
    secret_key?: string;
  };
  theme_config: {
    christmas: boolean;
    valentine: boolean;
    halloween: boolean;
  };
}

export const useAdminSettings = () => {
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings exist, create default ones
          const defaultSettings = {
            is_store_open: true,
            hide_lovable_banner: true,
            visa_card_config: { enabled: false },
            zain_cash_config: { enabled: false },
            theme_config: { christmas: false, valentine: false, halloween: false }
          };
          
          const { data: newSettings, error: insertError } = await supabase
            .from('admin_settings')
            .insert(defaultSettings)
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newSettings;
        }
        throw error;
      }
      
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<AdminSettings>) => {
      const previousSettings = data;
      
      const { data: updatedSettings, error } = await supabase
        .from('admin_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;

      // Log store open/close changes
      if (newSettings.is_store_open !== undefined && previousSettings) {
        const actionType = newSettings.is_store_open ? 'store_opened' : 'store_closed';
        await logChange(actionType, 'store', 'main_store', {
          previous_status: previousSettings.is_store_open,
          new_status: newSettings.is_store_open
        });
      }

      // Log favicon changes
      if (newSettings.favicon_url && previousSettings) {
        await logChange('favicon_updated', 'settings', 'favicon', {
          previous_favicon: previousSettings.favicon_url || 'default',
          new_favicon: 'custom_uploaded'
        });
      }

      // Log theme changes
      if (newSettings.theme_config && previousSettings) {
        await logChange('theme_updated', 'settings', 'theme_config', {
          previous_themes: previousSettings.theme_config,
          new_themes: newSettings.theme_config
        });
      }
      
      return updatedSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-settings-badge'] });
    }
  });

  return {
    data,
    isLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};
