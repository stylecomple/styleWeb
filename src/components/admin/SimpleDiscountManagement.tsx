
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useAuth } from '@/contexts/AuthContext';
import { Percent, Square, AlertTriangle } from 'lucide-react';

const SimpleDiscountManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logChange } = useChangeLogger();
  const queryClient = useQueryClient();
  
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Check if there are any active discounts
  const { data: hasActiveDiscount, isLoading } = useQuery({
    queryKey: ['has-active-discount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    }
  });

  // Get current discount percentage if any
  const { data: currentDiscountPercentage } = useQuery({
    queryKey: ['current-discount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('discount_percentage')
        .gt('discount_percentage', 0)
        .eq('is_active', true)
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0].discount_percentage : 0;
    },
    enabled: !!hasActiveDiscount
  });

  // Get total active products count for confirmation
  const { data: totalProducts } = useQuery({
    queryKey: ['total-active-products'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      return count || 0;
    }
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async (discount: number) => {
      console.log('Applying store-wide discount to active products:', discount);
      
      if (!user) throw new Error('User not authenticated');

      // Update only active products
      const { error } = await supabase
        .from('products')
        .update({ 
          discount_percentage: discount,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true);

      if (error) {
        console.error('Error applying store discount:', error);
        throw new Error(`فشل في تطبيق الخصم على المتجر: ${error.message}`);
      }

      console.log(`Store discount ${discount}% applied successfully to active products`);
      return discount;
    },
    onSuccess: async (discount) => {
      console.log('Store discount applied successfully:', discount);
      
      // Log the operation
      try {
        await logChange('store_discount_applied', 'products', 'ACTIVE_PRODUCTS', {
          discount_percentage: discount,
          operation: 'update_active_products_discount',
          affected_products: totalProducts,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Error logging operation:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم تطبيق خصم المتجر',
        description: `تم تطبيق خصم ${discount}% على جميع المنتجات النشطة (${totalProducts} منتج) بنجاح`,
      });

      setDiscountPercentage(0);
    },
    onError: (error: any) => {
      console.error('Store discount application failed:', error);
      toast({
        title: 'خطأ في تطبيق خصم المتجر',
        description: error.message || 'فشل في تطبيق الخصم على المنتجات',
        variant: 'destructive',
      });
    }
  });

  const stopDiscountMutation = useMutation({
    mutationFn: async () => {
      console.log('Stopping store discounts on active products');
      
      if (!user) throw new Error('User not authenticated');

      // Reset only active products to 0 discount
      const { error } = await supabase
        .from('products')
        .update({ 
          discount_percentage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true);

      if (error) {
        console.error('Error stopping store discounts:', error);
        throw new Error(`فشل في إيقاف خصومات المتجر: ${error.message}`);
      }

      console.log('Store discounts stopped successfully');
      return true;
    },
    onSuccess: async () => {
      console.log('Store discounts stopped successfully');
      
      // Log the operation
      try {
        await logChange('store_discount_stopped', 'products', 'ACTIVE_PRODUCTS', {
          operation: 'reset_active_products_discounts',
          affected_products: totalProducts,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Error logging operation:', logError);
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['has-active-discount'] });
      queryClient.invalidateQueries({ queryKey: ['current-discount'] });
      
      toast({
        title: 'تم إيقاف خصومات المتجر',
        description: `تم إيقاف جميع الخصومات من ${totalProducts} منتج نشط بنجاح`,
      });
    },
    onError: (error: any) => {
      console.error('Error stopping discounts:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إيقاف خصومات المتجر',
        variant: 'destructive',
      });
    }
  });

  const handleApplyDiscount = () => {
    if (discountPercentage <= 0 || discountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 1 و 100',
        variant: 'destructive',
      });
      return;
    }

    console.log('Starting store-wide discount application with:', discountPercentage);
    applyDiscountMutation.mutate(discountPercentage);
  };

  const handleStopDiscount = () => {
    console.log('Starting store discount removal');
    stopDiscountMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Store Discount Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Percent className="w-5 h-5" />
            خصم المتجر العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            هذه العملية ستقوم بتطبيق خصم على جميع المنتجات النشطة في المتجر ({totalProducts} منتج).
          </p>
        </CardContent>
      </Card>

      {/* Apply Store Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            تطبيق خصم عام على المتجر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>نسبة الخصم (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                placeholder="أدخل نسبة الخصم"
              />
              <p className="text-sm text-gray-600 mt-1">
                سيتم تطبيق هذا الخصم على جميع المنتجات النشطة ({totalProducts} منتج)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApplyDiscount}
              disabled={applyDiscountMutation.isPending}
              className="flex-1"
            >
              {applyDiscountMutation.isPending ? 'جاري التطبيق...' : `تطبيق خصم ${discountPercentage}% على المتجر`}
            </Button>
            
            {hasActiveDiscount && (
              <Button
                variant="outline"
                onClick={handleStopDiscount}
                disabled={stopDiscountMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Square className="w-4 h-4 mr-2" />
                {stopDiscountMutation.isPending ? 'جاري الإيقاف...' : 'إيقاف خصم المتجر'}
              </Button>
            )}
          </div>

          {hasActiveDiscount && currentDiscountPercentage && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">
                يوجد حالياً خصم {currentDiscountPercentage}% مطبق على جميع المنتجات النشطة ({totalProducts} منتج)
              </p>
            </div>
          )}

          {/* Operation Log Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>معلومات العملية:</strong> جميع العمليات يتم تسجيلها في سجل التغييرات وتطبق فقط على المنتجات النشطة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDiscountManagement;
