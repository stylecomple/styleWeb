
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MobileAppLayout from '@/components/MobileAppLayout';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number | null;
  images: string[] | null;
  cover_image: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
  categories: string[] | null;
  subcategories: string[] | null;
  options: any;
  colors: string[] | null;
}

const MobileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
    queryKey: ['search-products', searchQuery],
    queryFn: async (): Promise<DatabaseProduct[]> => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as DatabaseProduct[];
    },
    enabled: !!searchQuery.trim()
  });

  const transformedProducts = products?.map((item): any => {
    const options = item.options || 
      (item.colors ? item.colors.map((color: string) => ({ name: color, price: undefined })) : []);

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      discount_percentage: item.discount_percentage,
      images: item.images || [],
      cover_image: item.cover_image,
      is_active: item.is_active,
      stock_quantity: item.stock_quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      categories: item.categories || [],
      subcategories: item.subcategories || [],
      options
    };
  });

  return (
    <MobileAppLayout title="البحث">
      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right"
          />
        </div>

        {/* Results */}
        {!searchQuery.trim() ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ابحث عن المنتجات</h3>
            <p className="text-gray-500">اكتب في الحقل أعلاه للبحث عن المنتجات</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
            ))}
          </div>
        ) : transformedProducts && transformedProducts.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              تم العثور على {transformedProducts.length} منتج
            </p>
            <div className="grid grid-cols-2 gap-4">
              {transformedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">لم نجد أي منتجات تطابق بحثك عن "{searchQuery}"</p>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileSearch;
