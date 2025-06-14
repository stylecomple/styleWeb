
-- Add app_logo_url column to admin_settings table
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS app_logo_url text;
