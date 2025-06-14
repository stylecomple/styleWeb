import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Percent, Tag, Package, AlertTriangle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Discount {
  id: string;
  discount_type: 'all_products';
  target_value: null;
  discount_percentage: number;
  created_at: string;
  is_active: boolean;
}

const DiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [bulkDiscountPercentage, setBulkDiscountPercentage] = useState<number>(10);

  // Fetch active discounts
  const { data: discounts, isLoading: discountsLoading } = useQuery({
    queryKey: ['active-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_discounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Discount[];
    }
  });

  // Bulk discount mutation - applies discount to all products
  const bulkDiscountMutation = useMutation({
    mutationFn: async (percentage: number) => {
      console.log(`Applying bulk discount of ${percentage}% to all products...`);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // Use the RPC function to update all products
      const { error: rpcError } = await supabase.rpc('update_all_products_discount', {
        new_discount: percentage
      });

      if (rpcError) {
        console.error('Error applying bulk discount:', rpcError);
        throw new Error(rpcError.message || 'فشل في تطبيق الخصم الشامل');
      }

      // Create a record in active_discounts
      const discountData = {
        discount_type: 'all_products' as const,
        target_value: null,
        discount_percentage: percentage,
        created_by: userData.user.id,
        is_active: true
      };

      const { error: insertError } = await supabase
        .from('active_discounts')
        .insert([discountData]);

      if (insertError) {
        console.error('Error recording discount:', insertError);
        // Don't throw here as the discount was already applied
      }

      console.log(`Successfully applied ${percentage}% discount to all products`);
      return { percentage };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['all-products-for-discounts'] });
      
      toast({
        title: 'تم تطبيق الخصم الشامل',
        description: `تم تطبيق خصم ${data.percentage}% على جميع المنتجات بنجاح`,
      });
    },
    onError: (error: Error) => {
      console.error('Bulk discount application failed:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم الشامل',
        variant: 'destructive',
      });
    }
  });

  // Reset all discounts mutation
  const resetDiscountsMutation = useMutation({
    mutationFn: async () => {
      console.log('Resetting all product discounts to 0...');

      const { error: rpcError } = await supabase.rpc('reset_all_product_discounts');

      if (rpcError) {
        console.error('Error resetting discounts:', rpcError);
        throw new Error(rpcError.message || 'فشل في إعادة تعيين الخصومات');
      }

      // Deactivate all active discounts
      const { error: updateError } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('is_active', true);

      if (updateError) {
        console.error('Error deactivating discounts:', updateError);
        // Don't throw here as the products were already reset
      }

      console.log('Successfully reset all discounts to 0');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['all-products-for-discounts'] });
      
      toast({
        title: 'تم إعادة تعيين الخصومات',
        description: 'تم إعادة تعيين جميع خصومات المنتجات إلى 0%',
      });
    },
    onError: (error: Error) => {
      console.error('Reset discounts failed:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إعادة تعيين الخصومات',
        variant: 'destructive',
      });
    }
  });

  // Delete discount mutation
  const deleteDiscountMutation = useMutation({
    mutationFn: async (discountId: string) => {
      const { error: updateError } = await supabase
        .from('active_discounts')
        .update({ is_active: false })
        .eq('id', discountId);
      
      if (updateError) throw updateError;

      // Reset all products to 0 discount
      const { error: resetError } = await supabase.rpc('reset_all_product_discounts');
      
      if (resetError) {
        console.error('Error resetting discounts:', resetError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      
      toast({
        title: 'تم حذف الخصم',
        description: 'تم إزالة الخصم وإعادة تعيين الخصومات',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الخصم',
        variant: 'destructive',
      });
    }
  });

  const handleBulkDiscount = () => {
    if (bulkDiscountPercentage < 0 || bulkDiscountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 0 و 100',
        variant: 'destructive',
      });
      return;
    }

    bulkDiscountMutation.mutate(bulkDiscountPercentage);
  };

  const handleResetDiscounts = () => {
    resetDiscountsMutation.mutate();
  };

  if (discountsLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bulk Discount Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            إدارة الخصومات الشاملة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              هذه العمليات ستؤثر على جميع المنتجات في قاعدة البيانات. تأكد من صحة النسبة قبل التطبيق.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="bulk-discount">نسبة الخصم (%)</Label>
              <Input
                id="bulk-discount"
                type="number"
                min="0"
                max="100"
                value={bulkDiscountPercentage}
                onChange={(e) => setBulkDiscountPercentage(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkDiscount} disabled={bulkDiscountMutation.isPending}>
                <Percent className="w-4 h-4 mr-2" />
                تطبيق الخصم
              </Button>
              <Button onClick={handleResetDiscounts} variant="destructive" disabled={resetDiscountsMutation.isPending}>
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            الخصومات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discounts && discounts.length > 0 ? (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5" />
                    <div>
                      <div className="font-medium">جميع المنتجات</div>
                      <Badge variant="secondary">خصم {discount.discount_percentage}%</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDiscountMutation.mutate(discount.id)}
                    disabled={deleteDiscountMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لا توجد خصومات نشطة حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountManagement;
