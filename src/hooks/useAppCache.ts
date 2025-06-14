
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheData {
  products: any[];
  categories: any[];
  lastUpdated: string;
  version: string;
  // New fields for selective caching
  discounts: {
    activeDiscounts: any[];
    discountedProducts: any[];
  };
  lastDiscountCheck: string;
  lastProductCheck: string;
  lastCategoryCheck: string;
}

const CACHE_KEY = 'style_app_cache';
const CACHE_VERSION = '1.1.0'; // Updated version for new selective caching

export const useAppCache = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'cached' | 'updating' | 'complete'>('loading');
  const [cachedData, setCachedData] = useState<CacheData | null>(null);

  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache version matches
        if (data.version === CACHE_VERSION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  const setCacheData = (data: CacheData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  // Check for discounts updates (always check)
  const checkDiscountUpdates = async (): Promise<{ activeDiscounts: any[]; discountedProducts: any[] }> => {
    try {
      console.log('Checking for discount updates...');
      const { data: activeDiscounts } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true);

      const { data: discountedProducts } = await supabase
        .from('products')
        .select('id, name, discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true);

      return {
        activeDiscounts: activeDiscounts || [],
        discountedProducts: discountedProducts || []
      };
    } catch (error) {
      console.error('Error checking discount updates:', error);
      return { activeDiscounts: [], discountedProducts: [] };
    }
  };

  // Check for new products (always check for new ones)
  const checkNewProducts = async (lastCheck: string) => {
    try {
      console.log('Checking for new products...');
      const { data: newProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('created_at', lastCheck)
        .order('created_at', { ascending: false });

      return newProducts || [];
    } catch (error) {
      console.error('Error checking new products:', error);
      return [];
    }
  };

  // Check for category/subcategory updates (always check)
  const checkCategoryUpdates = async (lastCheck: string) => {
    try {
      console.log('Checking for category updates...');
      const { data: updatedCategories } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .gt('updated_at', lastCheck);

      const { data: updatedSubcategories } = await supabase
        .from('subcategories')
        .select('*')
        .gt('updated_at', lastCheck);

      return {
        categories: updatedCategories || [],
        subcategories: updatedSubcategories || []
      };
    } catch (error) {
      console.error('Error checking category updates:', error);
      return { categories: [], subcategories: [] };
    }
  };

  const fetchFreshData = async (): Promise<CacheData> => {
    console.log('Fetching fresh data...');
    
    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    // Fetch categories with subcategories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `);

    if (categoriesError) throw categoriesError;

    // Fetch discounts
    const discounts = await checkDiscountUpdates();

    const now = new Date().toISOString();

    const cacheData: CacheData = {
      products: products || [],
      categories: categories || [],
      discounts,
      lastUpdated: now,
      lastDiscountCheck: now,
      lastProductCheck: now,
      lastCategoryCheck: now,
      version: CACHE_VERSION
    };

    return cacheData;
  };

  // Selective update function - only updates specific parts
  const performSelectiveUpdates = async (cached: CacheData) => {
    console.log('Performing selective updates...');
    const now = new Date().toISOString();
    let updated = false;
    const updatedCache = { ...cached };

    // Always check discounts (real-time)
    const latestDiscounts = await checkDiscountUpdates();
    if (JSON.stringify(latestDiscounts) !== JSON.stringify(cached.discounts)) {
      console.log('Discount updates found');
      updatedCache.discounts = latestDiscounts;
      updatedCache.lastDiscountCheck = now;
      updated = true;
    }

    // Check for new products (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    if (cached.lastProductCheck < fiveMinutesAgo) {
      const newProducts = await checkNewProducts(cached.lastProductCheck);
      if (newProducts.length > 0) {
        console.log(`Found ${newProducts.length} new products`);
        // Add new products to existing ones (at the beginning)
        updatedCache.products = [...newProducts, ...cached.products];
        updated = true;
      }
      updatedCache.lastProductCheck = now;
    }

    // Check for category updates (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    if (cached.lastCategoryCheck < tenMinutesAgo) {
      const categoryUpdates = await checkCategoryUpdates(cached.lastCategoryCheck);
      if (categoryUpdates.categories.length > 0 || categoryUpdates.subcategories.length > 0) {
        console.log('Category updates found, refreshing categories');
        // Refresh all categories to ensure consistency
        const { data: allCategories } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories (*)
          `);
        updatedCache.categories = allCategories || cached.categories;
        updated = true;
      }
      updatedCache.lastCategoryCheck = now;
    }

    return { updatedCache, updated };
  };

  const initializeCache = async () => {
    setIsLoading(true);
    setCacheStatus('loading');

    try {
      const cached = getCachedData();
      
      if (cached) {
        console.log('Found cached data, performing selective updates...');
        setCachedData(cached);
        setCacheStatus('cached');
        
        // Perform selective updates
        const { updatedCache, updated } = await performSelectiveUpdates(cached);
        
        if (updated) {
          console.log('Updates applied to cache');
          setCacheData(updatedCache);
          setCachedData(updatedCache);
        }
        
        setCacheStatus('complete');
      } else {
        console.log('No cache found, fetching initial data...');
        setCacheStatus('updating');
        
        const freshData = await fetchFreshData();
        setCacheData(freshData);
        setCachedData(freshData);
        setCacheStatus('complete');
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
      setCacheStatus('complete');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedData(null);
  };

  useEffect(() => {
    initializeCache();
    
    // Set up periodic checks for critical updates
    const discountInterval = setInterval(async () => {
      if (cachedData) {
        const latestDiscounts = await checkDiscountUpdates();
        if (JSON.stringify(latestDiscounts) !== JSON.stringify(cachedData.discounts)) {
          console.log('Background discount update');
          const updatedCache = {
            ...cachedData,
            discounts: latestDiscounts,
            lastDiscountCheck: new Date().toISOString()
          };
          setCacheData(updatedCache);
          setCachedData(updatedCache);
        }
      }
    }, 30000); // Check every 30 seconds for discounts

    return () => {
      clearInterval(discountInterval);
    };
  }, []);

  return {
    isLoading,
    cacheStatus,
    cachedData,
    clearCache,
    refreshCache: initializeCache
  };
};
