
-- Add products_adder role to the app_role enum
ALTER TYPE app_role ADD VALUE 'products_adder';

-- Create a special category for discounted products if it doesn't exist
INSERT INTO categories (id, name, icon) 
VALUES ('discounts', 'العروض الحصرية', '🏷️')
ON CONFLICT (id) DO NOTHING;

-- Create a function to automatically manage discounted products in the discounts category
CREATE OR REPLACE FUNCTION public.manage_discount_category()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove all products from discount category first
  UPDATE public.products 
  SET categories = array_remove(categories, 'discounts')
  WHERE 'discounts' = ANY(categories);
  
  -- Add products with discounts to the discount category
  UPDATE public.products 
  SET categories = array_append(categories, 'discounts')
  WHERE discount_percentage > 0 
    AND is_active = true 
    AND NOT ('discounts' = ANY(categories));
END;
$$;

-- Create a trigger to automatically manage discount category when products are updated
CREATE OR REPLACE FUNCTION public.trigger_manage_discount_category()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Call the function to manage discount category
  PERFORM public.manage_discount_category();
  RETURN NULL;
END;
$$;

-- Create trigger for product updates
DROP TRIGGER IF EXISTS products_discount_category_trigger ON public.products;
CREATE TRIGGER products_discount_category_trigger
  AFTER INSERT OR UPDATE OF discount_percentage ON public.products
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_manage_discount_category();

-- Create trigger for active_discounts changes
DROP TRIGGER IF EXISTS active_discounts_category_trigger ON public.active_discounts;
CREATE TRIGGER active_discounts_category_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.active_discounts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_manage_discount_category();
