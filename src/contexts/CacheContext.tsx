
import React, { createContext, useContext, ReactNode } from 'react';
import { useAppCache } from '@/hooks/useAppCache';

interface CacheContextType {
  isLoading: boolean;
  cacheStatus: 'loading' | 'cached' | 'updating' | 'complete';
  cachedData: any;
  clearCache: () => void;
  refreshCache: () => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider = ({ children }: { children: ReactNode }) => {
  const cacheData = useAppCache();

  return (
    <CacheContext.Provider value={cacheData}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};
