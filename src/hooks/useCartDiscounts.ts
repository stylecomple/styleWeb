
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
}

export const useCartDiscounts = (cartItems: CartItem[]) => {
  // Fetch active discounts
  const { data: discounts = [] } = useQuery({
    queryKey: ['active-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Discount[];
    }
  });

  // Fetch product details for cart items to get categories/subcategories
  const { data: products = [] } = useQuery({
    queryKey: ['cart-products', cartItems.map(item => item.id)],
    queryFn: async () => {
      if (cartItems.length === 0) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, categories, subcategories')
        .in('id', cartItems.map(item => item.id));
      
      if (error) throw error;
      return data;
    },
    enabled: cartItems.length > 0
  });

  // Calculate discounted cart items
  const discountedCartItems = useMemo(() => {
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return item;

      // Find the highest applicable discount
      let maxDiscount = 0;
      
      discounts.forEach(discount => {
        if (discount.discount_type === 'all_products') {
          maxDiscount = Math.max(maxDiscount, discount.discount_percentage);
        } else if (discount.discount_type === 'category' && product.categories?.includes(discount.target_value)) {
          maxDiscount = Math.max(maxDiscount, discount.discount_percentage);
        } else if (discount.discount_type === 'subcategory' && product.subcategories?.includes(discount.target_value)) {
          maxDiscount = Math.max(maxDiscount, discount.discount_percentage);
        }
      });

      const originalPrice = item.price;
      const discountedPrice = maxDiscount > 0 
        ? Math.round(originalPrice * (1 - maxDiscount / 100))
        : originalPrice;

      return {
        ...item,
        originalPrice,
        price: discountedPrice,
        discountPercentage: maxDiscount
      };
    });
  }, [cartItems, products, discounts]);

  return {
    discountedCartItems,
    hasDiscounts: discounts.length > 0
  };
};
