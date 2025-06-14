
-- Add hide_lovable_banner column to admin_settings table
ALTER TABLE public.admin_settings 
ADD COLUMN hide_lovable_banner boolean DEFAULT false;
