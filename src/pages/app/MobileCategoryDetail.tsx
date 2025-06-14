
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

interface Product {
  id: string;
  name: string;
  price: number;
  cover_image?: string;
  categories?: string[];
  subcategories?: string[];
  options?: any[];
  discount_percentage?: number;
  is_active: boolean;
}

const MobileCategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category as Category;
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

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

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', categoryId, selectedSubcategory],
    queryFn: async (): Promise<Product[]> => {
      if (!categoryId) return [];
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .contains('categories', [categoryId]);

      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []) as Product[];
    },
    enabled: !!categoryId
  });

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <MobileAppLayout title={category?.name || 'الفئة'} backPath="/app/categories">
      <div className="p-4 space-y-4">
        {/* Subcategories with skeleton */}
        {category?.subcategories && category.subcategories.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">الفئات الفرعية</h3>
            
            <Button
              variant={selectedSubcategory === null ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSubcategorySelect(null)}
            >
              جميع المنتجات
            </Button>

            {category.subcategories.map((subcategory) => (
              <Button
                key={subcategory.id}
                variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSubcategorySelect(subcategory.id)}
              >
                <span className="text-lg ml-2">{subcategory.icon}</span>
                {subcategory.name}
              </Button>
            ))}
          </div>
        )}

        {/* Products with enhanced skeletons */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">المنتجات</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500">لا توجد منتجات في هذه الفئة حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileCategoryDetail;
