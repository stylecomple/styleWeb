
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategorySkeleton from '@/components/CategorySkeleton';
import PageSkeleton from '@/components/PageSkeleton';
import DiscountSwapper from '@/components/DiscountSwapper';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Product } from '@/types';
import { useCache } from '@/contexts/CacheContext';
import { useNavigate } from 'react-router-dom';

const MobileProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);
  const [hasDbError, setHasDbError] = useState(false);
  const {
    cachedData,
    cacheStatus
  } = useCache();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Auto-remove Lovable badge
  useEffect(() => {
    const removeBadge = () => {
      const badge = document.getElementById("lovable-badge");
      if (badge) {
        badge.remove();
      }
    };

    // Try immediately
    removeBadge();

    // Also try after a short delay in case badge loads later
    const timer = setTimeout(removeBadge, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh logic after splash screen
  useEffect(() => {
    if (!hasAutoRefreshed && cacheStatus === 'complete') {
      console.log('Auto-refreshing discount data after splash...');
      queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
      queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
      setHasAutoRefreshed(true);
    }
  }, [cacheStatus, hasAutoRefreshed, queryClient]);

  // Optimized discount check query with NaN prevention
  const { data: discountedProducts, isLoading: isDiscountLoading, error: discountError } = useQuery({
    queryKey: ['mobile-discounted-products', refreshCount],
    queryFn: async () => {
      console.log('Fetching discounted products...');
      
      // Check cached data first for immediate response
      if (cachedData?.discounts?.discountedProducts && refreshCount === 0) {
        console.log('Using cached discounted products');
        return cachedData.discounts.discountedProducts.filter(product => 
          product.price && !isNaN(product.price) && product.discount_percentage > 0
        );
      }

      // Fallback to database query for fresh data
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, cover_image, discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .not('price', 'is', null)
        .order('discount_percentage', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        setHasDbError(true);
        throw error;
      }
      
      setHasDbError(false);
      
      // Filter out products with invalid prices or discounts
      const validProducts = (data || []).filter(product => 
        product.price && 
        !isNaN(Number(product.price)) && 
        product.discount_percentage > 0 &&
        product.discount_percentage <= 100
      );

      console.log('Valid discounted products:', validProducts.length);
      return validProducts;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 3
  });

  // Use cached data if available, otherwise fetch from database
  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['mobile-products'],
    queryFn: async (): Promise<Product[]> => {
      // If we have cached data and it's complete, use it
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached products data');
        return cachedData.products.map((rawProduct: any) => {
          const options = rawProduct.options || (rawProduct.colors ? rawProduct.colors.map((color: string) => ({
            name: color,
            price: undefined
          })) : []);
          const subcategories = rawProduct.subcategories || [];
          return {
            ...rawProduct,
            options,
            subcategories,
            discount_percentage: rawProduct.discount_percentage || 0
          } as Product;
        });
      }

      // Fallback to database query
      console.log('Fetching products from database');
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', {
        ascending: false
      });
      
      if (error) {
        console.error('Database error:', error);
        setHasDbError(true);
        throw error;
      }
      
      setHasDbError(false);
      
      return (data || []).map(rawProduct => {
        const options = (rawProduct as any).options || ((rawProduct as any).colors ? (rawProduct as any).colors.map((color: string) => ({
          name: color,
          price: undefined
        })) : []);
        const subcategories = (rawProduct as any).subcategories || [];
        return {
          ...rawProduct,
          options,
          subcategories,
          discount_percentage: rawProduct.discount_percentage || 0
        } as Product;
      });
    },
    enabled: !cachedData || cacheStatus === 'complete',
    staleTime: 60000
  });

  const {
    data: categories,
    error: categoriesError
  } = useQuery({
    queryKey: ['mobile-categories-filter'],
    queryFn: async () => {
      // Use cached categories if available
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached categories data');
        return cachedData.categories;
      }

      // Fallback to database query
      console.log('Fetching categories from database');
      const {
        data,
        error
      } = await supabase.from('categories').select('*');
      
      if (error) {
        console.error('Database error:', error);
        setHasDbError(true);
        throw error;
      }
      
      setHasDbError(false);
      return data;
    },
    enabled: !cachedData || cacheStatus === 'complete',
    staleTime: 300000
  });

  // Check for database errors
  useEffect(() => {
    if (discountError || productsError || categoriesError) {
      setHasDbError(true);
    }
  }, [discountError, productsError, categoriesError]);

  // Set up real-time updates for discounts
  useEffect(() => {
    const channel = supabase
      .channel('discount-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        () => {
          console.log('Discount updated, refreshing...');
          setRefreshCount(0); // Reset refresh count
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'discount_percentage.gt.0'
        },
        () => {
          console.log('Product discount updated, refreshing...');
          setRefreshCount(0); // Reset refresh count
          queryClient.invalidateQueries({ queryKey: ['mobile-discounted-products'] });
          queryClient.invalidateQueries({ queryKey: ['mobile-products'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter products based on category
  const filteredProducts = products?.filter(product => {
    const matchesCategory = !selectedCategory || product.categories && product.categories.includes(selectedCategory);
    return matchesCategory;
  }) || [];

  // Auto-rotate discount carousel
  useEffect(() => {
    if (discountedProducts && discountedProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentDiscountIndex(prev => (prev + 1) % discountedProducts.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [discountedProducts?.length]);

  const handleClearFilters = () => {
    setSelectedCategory('');
  };
  
  const handleDiscountProductClick = (productId: string) => {
    navigate(`/app/product/${productId}`);
  };

  // Show comprehensive skeleton if there are database issues
  if (hasDbError) {
    return (
      <MobileAppLayout title="المنتجات" showBackButton={false}>
        <PageSkeleton type="products" />
      </MobileAppLayout>
    );
  }

  // Show loading skeletons while data is loading
  const showProductsLoading = isProductsLoading || (cachedData && cacheStatus !== 'complete');
  const showCategoriesLoading = !categories;

  return (
    <MobileAppLayout title="المنتجات" showBackButton={false}>
      <div className="space-y-4 p-4">
        {/* Import and use DiscountSwapper instead of the inline discount carousel */}
        <DiscountSwapper />

        {/* Refresh indicator when auto-refreshing */}
        {refreshCount > 0 && refreshCount < 2 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-800">
                جاري تحديث العروض... (محاولة {refreshCount}/2)
              </span>
            </div>
          </div>
        )}

        {/* Category Filter with skeleton */}
        {showCategoriesLoading ? (
          <CategorySkeleton />
        ) : categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant={selectedCategory === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('')} className="whitespace-nowrap rounded-full">
              الكل
            </Button>
            {categories.map((category: any) => (
              <Button key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category.id)} className="whitespace-nowrap rounded-full">
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Active Filters */}
        {selectedCategory && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">تصفية نشطة</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-blue-600 hover:text-blue-800">
              مسح التصفية
            </Button>
          </div>
        )}

        {/* Products Grid with enhanced skeletons */}
        {showProductsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">
              {selectedCategory ? 'لا توجد منتجات في هذه الفئة.' : 'لا توجد منتجات متاحة حالياً.'}
            </p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileProducts;
