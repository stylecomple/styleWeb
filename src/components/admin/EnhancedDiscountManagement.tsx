
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useAdvancedDiscountQuery } from '@/hooks/useAdvancedDiscountQuery';
import DiscountWhereClause from './DiscountWhereClause';
import { Percent, Target, Database, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhereCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  category_id: string;
}

interface Discount {
  id: string;
  discount_type: 'all_products' | 'category' | 'subcategory';
  target_value: string | null;
  discount_percentage: number;
  created_at: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
  stock_quantity: number;
  is_active: boolean;
  categories: string[];
  subcategories: string[];
}

const EnhancedDiscountManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  
  const [discountType, setDiscountType] = useState<'all_products' | 'category' | 'subcategory'>('all_products');
  const [targetValue, setTargetValue] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Available fields for WHERE clause filtering
  const availableFields = [
    { value: 'name', label: 'اسم المنتج', type: 'string' },
    { value: 'price', label: 'السعر', type: 'number' },
    { value: 'discount_percentage', label: 'نسبة الخصم الحالية', type: 'number' },
    { value: 'stock_quantity', label: 'الكمية المتوفرة', type: 'number' },
    { value: 'is_active', label: 'نشط', type: 'boolean' },
    { value: 'categories', label: 'الفئات', type: 'array' },
    { value: 'subcategories', label: 'الفئات الفرعية', type: 'array' },
    { value: 'colors', label: 'الألوان', type: 'array' },
    { value: 'created_at', label: 'تاريخ الإنشاء', type: 'string' },
    { value: 'updated_at', label: 'تاريخ التحديث', type: 'string' }
  ];

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch subcategories
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*');
      
      if (error) throw error;
      return data as Subcategory[];
    }
  });

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

  // Advanced products query with WHERE conditions
  const { data: filteredProducts, isLoading: productsLoading, error: productsError } = useAdvancedDiscountQuery({
    table: 'products',
    select: 'id, name, price, discount_percentage, stock_quantity, is_active, categories, subcategories',
    whereConditions: whereConditions,
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  });

  // Apply complex discount mutation
  const applyComplexDiscountMutation = useMutation({
    mutationFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      console.log('Applying complex discount with conditions:', whereConditions);

      // Create the discount record in active_discounts table
      const discountData = {
        discount_type: discountType,
        target_value: discountType === 'all_products' ? null : targetValue,
        discount_percentage: discountPercentage,
        created_by: userData.user.id,
        is_active: true
      };

      const { data: discountRecord, error: insertError } = await supabase
        .from('active_discounts')
        .insert([discountData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating discount record:', insertError);
        throw insertError;
      }

      // Apply discount to filtered products if conditions are specified and we have valid data
      if (whereConditions.length > 0 && filteredProducts && !productsError && Array.isArray(filteredProducts)) {
        console.log(`Applying discount to ${filteredProducts.length} filtered products`);
        
        const productIds = filteredProducts.map((p: any) => p.id);
        
        // Apply discounts to specific products using the improved RPC function
        const { error: rpcError } = await supabase.rpc('apply_active_discounts', {
          product_ids: productIds
        });

        if (rpcError) {
          console.error('Error applying discounts to filtered products:', rpcError);
          throw rpcError;
        }
      } else {
        // Apply to all products using the standard RPC function
        const { error: rpcError } = await supabase.rpc('apply_active_discounts');

        if (rpcError) {
          console.error('Error applying discounts via RPC:', rpcError);
          throw rpcError;
        }
      }

      await logChange(
        'complex_discount_applied',
        'products',
        discountType === 'all_products' ? 'all_products' : targetValue,
        {
          discount_percentage: discountPercentage,
          discount_type: discountType,
          target_value: targetValue,
          where_conditions: whereConditions,
          affected_products_count: (filteredProducts && !productsError && Array.isArray(filteredProducts)) ? filteredProducts.length : 0
        }
      );

      console.log(`Successfully applied ${discountPercentage}% complex discount`);
      return discountRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-discount-query'] });
      
      setDiscountPercentage(0);
      setTargetValue('');
      setWhereConditions([]);
      
      toast({
        title: 'تم تطبيق الخصم المعقد',
        description: `تم تطبيق خصم ${discountPercentage}% بشروط متقدمة بنجاح`,
      });
    },
    onError: (error: Error) => {
      console.error('Complex discount application failed:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تطبيق الخصم المعقد',
        variant: 'destructive',
      });
    }
  });

  const handleApplyComplexDiscount = () => {
    if (discountPercentage < 0 || discountPercentage > 100) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون نسبة الخصم بين 0 و 100',
        variant: 'destructive',
      });
      return;
    }

    if (discountType !== 'all_products' && !targetValue) {
      toast({
        title: 'خطأ',
        description: 'يجب اختيار الفئة أو الفئة الفرعية',
        variant: 'destructive',
      });
      return;
    }

    const validProducts = filteredProducts && !productsError && Array.isArray(filteredProducts);
    console.log('Applying complex discount:', { 
      discountType, 
      targetValue, 
      discountPercentage, 
      whereConditions,
      filteredProductsCount: validProducts ? filteredProducts.length : 0 
    });
    
    applyComplexDiscountMutation.mutate();
  };

  const getDiscountDisplayText = (discount: Discount) => {
    if (discount.discount_type === 'all_products') {
      return 'جميع المنتجات';
    } else if (discount.discount_type === 'category') {
      const category = categories?.find(c => c.id === discount.target_value);
      return `فئة: ${category?.name || discount.target_value}`;
    } else {
      const subcategory = subcategories?.find(s => s.id === discount.target_value);
      return `فئة فرعية: ${subcategory?.name || discount.target_value}`;
    }
  };

  const getProductsCount = () => {
    if (productsError) return 0;
    if (!filteredProducts || !Array.isArray(filteredProducts)) return 0;
    return filteredProducts.length;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Discount Application */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            تطبيق خصم معقد مع شروط متقدمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              يمكنك تطبيق خصومات معقدة باستخدام شروط WHERE متقدمة لاستهداف منتجات محددة بدقة.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discount-type">نوع الخصم</Label>
              <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الخصم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_products">جميع المنتجات</SelectItem>
                  <SelectItem value="category">فئة محددة</SelectItem>
                  <SelectItem value="subcategory">فئة فرعية محددة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discountType === 'category' && (
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {discountType === 'subcategory' && (
              <div>
                <Label htmlFor="subcategory">الفئة الفرعية</Label>
                <Select value={targetValue} onValueChange={setTargetValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الفرعية" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.icon} {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="discount-percentage">نسبة الخصم (%)</Label>
              <Input
                id="discount-percentage"
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                placeholder="أدخل نسبة الخصم"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'إخفاء' : 'إظهار'} الفلاتر المتقدمة
            </Button>
            
            {whereConditions.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {whereConditions.length} شرط نشط
              </Badge>
            )}
          </div>

          {showAdvancedFilters && (
            <DiscountWhereClause
              onWhereChange={setWhereConditions}
              availableFields={availableFields}
            />
          )}

          {whereConditions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">المنتجات المفلترة</span>
              </div>
              {productsLoading ? (
                <p className="text-sm text-blue-600">جاري تحميل المنتجات المفلترة...</p>
              ) : productsError ? (
                <p className="text-sm text-red-600">خطأ في تحميل المنتجات: {productsError.message}</p>
              ) : (
                <p className="text-sm text-blue-700">
                  سيتم تطبيق الخصم على {getProductsCount()} منتج مطابق للشروط
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={handleApplyComplexDiscount}
            disabled={applyComplexDiscountMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {applyComplexDiscountMutation.isPending 
              ? 'جاري تطبيق الخصم المعقد...' 
              : `تطبيق خصم معقد ${discountPercentage}%`
            }
          </Button>
        </CardContent>
      </Card>

      {/* Active Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            الخصومات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discounts && discounts.length > 0 ? (
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{getDiscountDisplayText(discount)}</p>
                      <p className="text-sm text-gray-600">
                        خصم {discount.discount_percentage}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      نشط
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                      disabled={false}
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد خصومات نشطة حالياً</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDiscountManagement;
