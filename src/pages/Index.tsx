
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import DiscountSwapper from '@/components/DiscountSwapper';
import { useNavigate } from 'react-router-dom';
import { useCache } from '@/contexts/CacheContext';

const Index = () => {
  const navigate = useNavigate();
  const { cachedData } = useCache();

  // Get total product count - use cache first
  const { data: productCount } = useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      // Use cached products count if available
      if (cachedData?.products) {
        console.log('Using cached products count');
        return cachedData.products.length;
      }

      // Fallback to database query
      console.log('Fetching product count from database');
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleStartShopping = () => {
    navigate('/products');
  };

  const handleBrowseCollections = () => {
    navigate('/products');
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Discount Swapper */}
      <DiscountSwapper />
      
      <Hero 
        onStartShopping={handleStartShopping}
        onBrowseCollections={handleBrowseCollections}
        onCategoryClick={handleCategoryClick}
        productCount={productCount}
      />
      <FeaturesSection />
    </div>
  );
};

export default Index;
