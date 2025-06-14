
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategorySkeleton from '@/components/CategorySkeleton';
import DiscountSwapper from '@/components/DiscountSwapper';
import SearchBar from '@/components/SearchBar';
import CategorySection from '@/components/CategorySection';
import SubCategorySection from '@/components/SubCategorySection';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: searchResults, isLoading } = useProductSearch({
    searchQuery,
    selectedCategory: selectedCategory === 'all' ? null : selectedCategory,
    selectedSubcategory,
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategoriesChange = (newSubcategories: Subcategory[]) => {
    setSubcategories(newSubcategories);
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const products = searchResults?.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* New Modern Logo Section */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Modern minimalist design */}
          <div className="bg-white rounded-full p-8 shadow-2xl border-4 border-gradient-to-r from-pink-200 to-purple-200 hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
            <div className="relative">
              {/* Main brand text */}
              <div className="text-center">
                <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Style
                </h1>
                <p className="text-sm font-medium text-gray-600 tracking-wide">
                  متجر الجمال والأناقة
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 -left-4 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-full blur-xl opacity-20 -z-10 animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced Discount Swapper */}
      <div className="mb-8">
        <DiscountSwapper />
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <SearchBar 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
      </div>

      {/* Categories Section with smooth transition and skeleton */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isSearchFocused 
            ? 'max-h-0 opacity-0 -translate-y-4 mb-0' 
            : 'max-h-[1000px] opacity-100 translate-y-0 mb-8'
        }`}
      >
        {subcategories.length === 0 && !isSearchFocused ? (
          <CategorySkeleton />
        ) : (
          <>
            <CategorySection
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              onSubcategoriesChange={handleSubcategoriesChange}
            />

            {/* Subcategories Section */}
            {subcategories.length > 0 && (
              <SubCategorySection
                subcategories={subcategories}
                selectedSubcategory={selectedSubcategory}
                onSubcategorySelect={handleSubcategorySelect}
              />
            )}
          </>
        )}
      </div>

      {/* Products Section with dynamic spacing and skeletons */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          isSearchFocused ? '-mt-4' : 'mt-0'
        }`}
      >
        {/* Results Summary with skeleton */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'جميع المنتجات'}
          </h2>
          {isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <p className="text-gray-600">
              عدد المنتجات: {products.length}
            </p>
          )}
        </div>

        {/* Products Grid with enhanced skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'لم نجد أي منتجات تطابق بحثك. جرب كلمات مختلفة.' 
                : 'لا توجد منتجات في هذه الفئة حالياً.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
