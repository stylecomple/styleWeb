import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface ProductSearchOptions {
  searchQuery: string;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
}

export const useProductSearch = ({ searchQuery, selectedCategory, selectedSubcategory }: ProductSearchOptions) => {
  const [data, setData] = useState<{ products: Product[]; total: number }>({ products: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Function to transform raw product data
  const transformProduct = (rawProduct: any): Product => ({
    ...rawProduct,
    options: rawProduct.options || 
      (rawProduct.colors ? rawProduct.colors.map((color: string) => ({ name: color, price: undefined })) : []),
    subcategories: rawProduct.subcategories || [],
    discount_percentage: rawProduct.discount_percentage || 0
  });

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      // Build the base query
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (selectedCategory && selectedCategory !== 'all') {
        if (selectedCategory === 'discounts') {
          query = query.gt('discount_percentage', 0);
        } else {
          query = query.contains('categories', [selectedCategory]);
        }
      }

      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Execute query
      const { data: products, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        setData({ products: [], total: 0 });
        return;
      }

      // Transform products
      const transformedProducts = (products || []).map(transformProduct);

      setData({
        products: transformedProducts,
        total: transformedProducts.length
      });
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setData({ products: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time listener
  useEffect(() => {
    // Initial fetch
    fetchProducts();

    // Set up realtime subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Products updated, refreshing...');
          fetchProducts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_discounts'
        },
        () => {
          console.log('Discounts updated, refreshing products...');
          fetchProducts();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [searchQuery, selectedCategory, selectedSubcategory]); // Refresh when filters change

  return {
    data,
    isLoading
  };
};
