
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DiscountCarouselSkeleton = () => {
  return (
    <div className="relative h-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl overflow-hidden shadow-lg mb-4">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="flex items-center h-full p-4">
        <div className="flex-shrink-0 w-20 h-20 mr-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-32 mb-2 bg-white/30" />
          <div className="flex items-center gap-2 mt-1">
            <Skeleton className="h-4 w-16 bg-white/30" />
            <Skeleton className="h-4 w-20 bg-white/30" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full mt-1 bg-white/30" />
        </div>
      </div>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-2 h-2 rounded-full bg-white/50" />
        ))}
      </div>
    </div>
  );
};

export default DiscountCarouselSkeleton;
