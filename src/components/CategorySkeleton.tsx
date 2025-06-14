
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CategorySkeleton = () => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {[...Array(6)].map((_, index) => (
        <Skeleton 
          key={index} 
          className="whitespace-nowrap rounded-full h-10 w-24 flex-shrink-0" 
        />
      ))}
    </div>
  );
};

export default CategorySkeleton;
