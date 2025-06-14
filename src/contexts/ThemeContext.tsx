
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ThemeConfig {
  christmas: boolean;
  valentine: boolean;
  halloween: boolean;
}

interface ThemeContextType {
  activeTheme: 'christmas' | 'valentine' | 'halloween' | 'default';
  themeConfig: ThemeConfig;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to validate and extract theme config
const parseThemeConfig = (themeConfig: any): ThemeConfig => {
  const defaultConfig: ThemeConfig = {
    christmas: false,
    valentine: false,
    halloween: false,
  };

  if (!themeConfig || typeof themeConfig !== 'object' || Array.isArray(themeConfig)) {
    return defaultConfig;
  }

  return {
    christmas: typeof themeConfig.christmas === 'boolean' ? themeConfig.christmas : false,
    valentine: typeof themeConfig.valentine === 'boolean' ? themeConfig.valentine : false,
    halloween: typeof themeConfig.halloween === 'boolean' ? themeConfig.halloween : false,
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<'christmas' | 'valentine' | 'halloween' | 'default'>('default');
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings-theme'],
    queryFn: async () => {
      console.log('Fetching theme settings...');
      const { data, error } = await supabase
        .from('admin_settings')
        .select('theme_config')
        .single();
      
      if (error) {
        console.error('Theme settings error:', error);
        throw error;
      }
      
      console.log('Theme settings fetched:', data);
      return data;
    },
    refetchInterval: 30000, // Check every 30 seconds for changes
    staleTime: 1000, // Cache for 1 second to reduce conflicts
  });

  const themeConfig: ThemeConfig = parseThemeConfig(settings?.theme_config);

  // Determine and apply active theme
  useEffect(() => {
    console.log('Theme config in context:', themeConfig);
    
    let newActiveTheme: 'christmas' | 'valentine' | 'halloween' | 'default' = 'default';
    
    // Determine active theme based on which one is true
    if (themeConfig.christmas) {
      newActiveTheme = 'christmas';
    } else if (themeConfig.valentine) {
      newActiveTheme = 'valentine';
    } else if (themeConfig.halloween) {
      newActiveTheme = 'halloween';
    }

    console.log('Setting active theme to:', newActiveTheme);
    setActiveTheme(newActiveTheme);
  }, [themeConfig.christmas, themeConfig.valentine, themeConfig.halloween]);

  // Apply theme classes to body
  useEffect(() => {
    console.log('Applying theme classes for:', activeTheme);
    
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-christmas', 'theme-valentine', 'theme-halloween');
    
    // Add active theme class if not default
    if (activeTheme !== 'default') {
      const themeClass = `theme-${activeTheme}`;
      body.classList.add(themeClass);
      console.log(`Applied theme class: ${themeClass}`);
      console.log('Current body classes:', body.className);
    } else {
      console.log('Applied default theme (no classes)');
    }

    return () => {
      // Cleanup on unmount
      body.classList.remove('theme-christmas', 'theme-valentine', 'theme-halloween');
    };
  }, [activeTheme]);

  // Listen for real-time updates to admin_settings
  useEffect(() => {
    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_settings',
        },
        (payload) => {
          console.log('Admin settings updated via realtime:', payload);
          // Invalidate and refetch theme settings immediately
          queryClient.invalidateQueries({ queryKey: ['admin-settings-theme'] });
          queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
          
          // Force refetch to get the latest data
          queryClient.refetchQueries({ queryKey: ['admin-settings-theme'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <ThemeContext.Provider value={{ activeTheme, themeConfig, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
