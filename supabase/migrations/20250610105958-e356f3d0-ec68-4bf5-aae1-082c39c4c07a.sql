
-- Add favicon_url column to admin_settings table
ALTER TABLE public.admin_settings 
ADD COLUMN favicon_url text;
