
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface PageSkeletonProps {
  type?: 'products' | 'categories' | 'profile' | 'orders' | 'general';
}

const PageSkeleton = ({ type = 'general' }: PageSkeletonProps) => {
  if (type === 'products') {
    return (
      <div className="p-4 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-center mb-8">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        
        {/* Discount swapper skeleton */}
        <Skeleton className="h-16 w-full rounded-2xl" />
        
        {/* Search bar skeleton */}
        <Skeleton className="h-12 w-full rounded-full" />
        
        {/* Categories skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
        
        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="w-full h-32" />
              <CardContent className="p-2.5">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <div className="flex gap-1 mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-7 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'categories') {
    return (
      <div className="p-4 space-y-4">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="p-4 space-y-4">
        {/* Profile header */}
        <div className="text-center mb-6">
          <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        {/* Menu items */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-6 h-6" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'orders') {
    return (
      <div className="p-4 space-y-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // General skeleton
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-48 mb-6" />
      {[...Array(5)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/6" />
        </div>
      ))}
    </div>
  );
};

export default PageSkeleton;
