
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  // Set up real-time updates for product discounts
  useEffect(() => {
    const channel = supabase
      .channel(`product-updates-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`
        },
        (payload) => {
          console.log('Real-time product update:', payload);
          // Invalidate queries to refresh product data
          queryClient.invalidateQueries({ queryKey: ['product-search'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        (payload) => {
          console.log('Real-time discount update affecting products:', payload);
          // Invalidate queries when discounts change
          queryClient.invalidateQueries({ queryKey: ['product-search'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id, queryClient]);

  const handleViewProduct = () => {
    navigate(`/app/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const effectivePrice = getEffectivePrice();
    addToCart({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      originalPrice: product.price,
      image: product.cover_image || '/placeholder.svg',
      discountPercentage: product.discount_percentage,
    });
  };

  const getEffectivePrice = () => {
    // Only apply discount if it's greater than 0
    if (product.discount_percentage && product.discount_percentage > 0) {
      return product.price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  };

  // Check if product actually has a valid discount
  const hasValidDiscount = product.discount_percentage && product.discount_percentage > 0;

  // Get category and subcategory names for display
  const categoryName = product.categories && product.categories.length > 0 ? product.categories[0] : '';
  const subcategoryName = product.subcategories && product.subcategories.length > 0 ? product.subcategories[0] : '';

  // Define cool colors for categories and subcategories
  const getCategoryColor = (category: string) => {
    const colors = {
      'makeup': 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
      'perfumes': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
      'flowers': 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
      'home': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'default': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getSubcategoryColor = (subcategory: string) => {
    const colors = {
      'lipstick': 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
      'foundation': 'bg-gradient-to-r from-orange-400 to-amber-400 text-white',
      'eyeshadow': 'bg-gradient-to-r from-purple-400 to-violet-400 text-white',
      'fragrance': 'bg-gradient-to-r from-indigo-400 to-blue-400 text-white',
      'default': 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
    };
    return colors[subcategory as keyof typeof colors] || colors.default;
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white cursor-pointer h-80 flex flex-col hover:scale-105"
      onClick={handleViewProduct}
    >
      <div className="relative overflow-hidden h-32 flex-shrink-0">
        <img
          src={product.cover_image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Only show discount badge if there's actually a discount */}
        {hasValidDiscount && (
          <Badge className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg animate-pulse px-1.5 py-0.5">
            -{product.discount_percentage}%
          </Badge>
        )}
      </div>

      <CardContent className="p-2.5 flex flex-col flex-1 relative">
        <h3 className="font-semibold text-xs mb-1.5 text-gray-800 line-clamp-2 min-h-[2rem] leading-tight">
          {product.name}
        </h3>
        
        {/* Category and Subcategory with compact styling */}
        {(categoryName || subcategoryName) && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {categoryName && categoryName !== 'discounts' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getCategoryColor(categoryName)}`}>
                {categoryName}
              </span>
            )}
            {subcategoryName && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getSubcategoryColor(subcategoryName)}`}>
                {subcategoryName}
              </span>
            )}
          </div>
        )}

        {/* Price - only show discount styling if there's actually a discount */}
        <div className="flex flex-col mb-2">
          {hasValidDiscount ? (
            <>
              <span className="text-sm font-bold text-pink-600">
                {Math.round(getEffectivePrice()).toLocaleString()} د.ع
              </span>
              <span className="text-xs text-gray-500 line-through">
                {product.price.toLocaleString()} د.ع
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-pink-600">
              {product.price.toLocaleString()} د.ع
            </span>
          )}
        </div>

        {/* Action buttons - fixed position at bottom with smaller size */}
        <div className="mt-auto flex gap-1.5">
          <Button 
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-1.5 rounded-md text-xs transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 h-7"
          >
            <Eye className="w-3 h-3 mr-1" />
            عرض
          </Button>
          
          <Button
            onClick={handleAddToCart}
            className="px-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-1.5 rounded-md text-xs transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 h-7 min-w-[2.5rem]"
          >
            <ShoppingCart className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
