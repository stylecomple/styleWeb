
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white h-80 flex flex-col">
      <div className="relative overflow-hidden h-32 flex-shrink-0">
        <Skeleton className="w-full h-full" />
      </div>

      <CardContent className="p-2.5 flex flex-col flex-1">
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-3/4 mb-1.5" />
        
        <div className="flex flex-wrap gap-1 mb-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="flex flex-col mb-2">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="mt-auto flex gap-1.5">
          <Skeleton className="flex-1 h-7 rounded-md" />
          <Skeleton className="w-8 h-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
