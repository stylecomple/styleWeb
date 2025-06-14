
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Percent, Sparkles, Tag, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Discount {
  id: string;
  discount_type: string;
  target_value: string | null;
  discount_percentage: number;
}

interface DiscountBannerProps {
  discounts?: Discount[];
}

const DiscountBanner = ({ discounts: propDiscounts }: DiscountBannerProps) => {
  const [discounts, setDiscounts] = useState<Discount[]>(propDiscounts || []);
  const [isLoading, setIsLoading] = useState(!propDiscounts);

  useEffect(() => {
    if (propDiscounts) {
      setDiscounts(propDiscounts);
      setIsLoading(false);
      return;
    }

    const fetchDiscounts = async () => {
      try {
        console.log('Fetching active discounts directly from Supabase...');
        
        const { data, error } = await supabase
          .from('active_discounts')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching discounts:', error);
          return;
        }

        console.log('Active discounts fetched:', data);
        setDiscounts(data || []);
      } catch (error) {
        console.error('Error in fetchDiscounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscounts();

    // Set up real-time listener for discount changes
    const channel = supabase
      .channel('discount-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        (payload) => {
          console.log('Discount change detected:', payload);
          fetchDiscounts(); // Refetch discounts on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propDiscounts]);

  if (isLoading || !discounts || discounts.length === 0) {
    return null;
  }

  const getDiscountText = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return `خصم ${discount.discount_percentage}% على جميع المنتجات`;
    } else if (discount.discount_type === 'category') {
      return `خصم ${discount.discount_percentage}% على فئة مختارة`;
    } else {
      return `خصم ${discount.discount_percentage}% على فئة فرعية مختارة`;
    }
  };

  const getDiscountIcon = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return <Package className="w-5 h-5" />;
    } else if (discount.discount_type === 'category') {
      return <Tag className="w-5 h-5" />;
    } else {
      return <Percent className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 animate-bounce">
          <Sparkles className="w-6 h-6 animate-spin" />
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {discounts.map((discount, index) => (
              <div key={discount.id} className="flex items-center gap-2">
                {getDiscountIcon(discount)}
                <span className="font-bold text-lg">
                  {getDiscountText(discount)}
                </span>
                {index < discounts.length - 1 && (
                  <span className="text-white/70 mx-2">•</span>
                )}
              </div>
            ))}
          </div>
          
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
