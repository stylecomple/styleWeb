
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import CategorySkeleton from '@/components/CategorySkeleton';
import PageSkeleton from '@/components/PageSkeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCache } from '@/contexts/CacheContext';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

const MobileCategories = () => {
  const navigate = useNavigate();
  const { cachedData, cacheStatus } = useCache();
  const [hasDbError, setHasDbError] = useState(false);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['mobile-categories'],
    queryFn: async (): Promise<Category[]> => {
      // Use cached data if available
      if (cachedData && cacheStatus === 'complete') {
        console.log('Using cached categories data');
        return cachedData.categories;
      }

      // Fallback to database query
      console.log('Fetching categories from database');
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `);
      
      if (error) {
        console.error('Database error:', error);
        setHasDbError(true);
        throw error;
      }
      
      setHasDbError(false);
      return data || [];
    },
    enabled: !cachedData || cacheStatus === 'complete'
  });

  // Check for database errors
  useEffect(() => {
    if (error) {
      setHasDbError(true);
    }
  }, [error]);

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

  const handleCategoryPress = (category: Category) => {
    navigate(`/app/category/${category.id}`, { 
      state: { category } 
    });
  };

  // Show comprehensive skeleton if there are database issues
  if (hasDbError) {
    return (
      <MobileAppLayout title="الفئات" showBackButton={false}>
        <PageSkeleton type="categories" />
      </MobileAppLayout>
    );
  }

  const showLoading = isLoading || (cachedData && cacheStatus !== 'complete');

  return (
    <MobileAppLayout title="الفئات" showBackButton={false}>
      <div className="p-4 space-y-4">
        {showLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <Button
                key={category.id}
                variant="outline"
                className="w-full h-16 justify-start text-lg font-semibold animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleCategoryPress(category)}
              >
                <span className="text-2xl ml-3">{category.icon}</span>
                <div className="text-right">
                  <div>{category.name}</div>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="text-sm text-gray-500 font-normal">
                      {category.subcategories.length} فئة فرعية
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فئات</h3>
            <p className="text-gray-500">لا توجد فئات متاحة حالياً.</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileCategories;
