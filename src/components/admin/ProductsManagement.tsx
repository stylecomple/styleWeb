import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit, Eye, Percent, EyeOff, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import EditProductForm from './EditProductForm';
import SearchBar from '@/components/SearchBar';
import SubCategorySection from '@/components/SubCategorySection';
import { ProductOption, Product } from '@/types';

const ProductsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logChange } = useChangeLogger();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', selectedCategory)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery, selectedCategory, selectedSubcategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');
      
      // Apply search filter - enhanced search through name and description
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        const { data: allProducts, error } = await query;
        
        if (error) throw error;
        
        const filteredProducts = (allProducts || []).filter(product => {
          // Safely handle options as Json type
          const productOptions = Array.isArray(product.options) ? product.options : 
                               (product.options && typeof product.options === 'object' && !Array.isArray(product.options)) ? 
                               Object.values(product.options) : [];
          
          const optionNames = Array.isArray(productOptions) ? 
            productOptions.map((opt: any) => typeof opt === 'object' && opt?.name ? opt.name : String(opt)).filter(Boolean) : [];

          const searchableText = [
            product.name || '',
            product.description || '',
            ...(product.categories || []),
            ...optionNames
          ].join(' ').toLowerCase();
          
          return searchTerms.every(term => searchableText.includes(term));
        });
        
        return filteredProducts.map(rawProduct => {
          // Safely transform options
          const rawOptions = rawProduct.options;
          let options: ProductOption[] = [];
          
          if (Array.isArray(rawOptions)) {
            options = rawOptions.map((opt: any) => ({
              name: opt?.name || String(opt),
              price: opt?.price
            }));
          } else if (rawProduct.colors && Array.isArray(rawProduct.colors)) {
            options = rawProduct.colors.map((color: string) => ({ name: color, price: undefined }));
          }
          
          const subcategories = Array.isArray(rawProduct.subcategories) ? rawProduct.subcategories : [];

          return {
            ...rawProduct,
            options,
            subcategories
          } as Product;
        });
      }
      
      // Apply category filter
      if (selectedCategory) {
        query = query.contains('categories', [selectedCategory]);
      }
      
      // Apply subcategory filter
      if (selectedSubcategory) {
        query = query.contains('subcategories', [selectedSubcategory]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform raw database data to match Product interface
      let transformedProducts = data.map(rawProduct => {
        // Safely transform options
        const rawOptions = rawProduct.options;
        let options: ProductOption[] = [];
        
        if (Array.isArray(rawOptions)) {
          options = rawOptions.map((opt: any) => ({
            name: opt?.name || String(opt),
            price: opt?.price
          }));
        } else if (rawProduct.colors && Array.isArray(rawProduct.colors)) {
          options = rawProduct.colors.map((color: string) => ({ name: color, price: undefined }));
        }
        
        const subcategories = Array.isArray(rawProduct.subcategories) ? rawProduct.subcategories : [];

        return {
          ...rawProduct,
          options,
          subcategories
        } as Product;
      });

      // Sort products: if no specific category is selected, show discounted products first
      if (!selectedCategory && !selectedSubcategory) {
        transformedProducts.sort((a, b) => {
          const aHasDiscount = (a.discount_percentage || 0) > 0;
          const bHasDiscount = (b.discount_percentage || 0) > 0;
          
          if (aHasDiscount && !bHasDiscount) return -1;
          if (!aHasDiscount && bHasDiscount) return 1;
          
          // If both have discounts or both don't have discounts, randomize
          return Math.random() - 0.5;
        });
      } else {
        // For specific categories, keep the original order (by created_at desc)
        transformedProducts.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      }

      return transformedProducts;
    }
  });

  const bulkDiscountMutation = useMutation({
    mutationFn: async ({ productIds, discount }: { productIds: string[], discount: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ discount_percentage: discount })
        .in('id', productIds);
      
      if (error) throw error;
      return { productIds, discount };
    },
    onSuccess: ({ productIds, discount }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      logChange('bulk_discount_applied', 'products', undefined, {
        product_count: productIds.length,
        discount_percentage: discount,
        product_ids: productIds
      });
      toast({
        title: 'تم تطبيق الخصم',
        description: `تم تطبيق خصم ${discount}% على ${productIds.length} منتج`,
      });
      setSelectedProducts([]);
      setDiscountPercentage('');
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في تطبيق الخصم',
        variant: 'destructive',
      });
    }
  });

  const bulkInactiveMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', productIds);
      
      if (error) throw error;
      return productIds;
    },
    onSuccess: (productIds) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      logChange('bulk_products_deactivated', 'products', undefined, {
        product_count: productIds.length,
        product_ids: productIds
      });
      toast({
        title: 'تم إلغاء تفعيل المنتجات',
        description: `تم إلغاء تفعيل ${productIds.length} منتج`,
      });
      setSelectedProducts([]);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في إلغاء تفعيل المنتجات',
        variant: 'destructive',
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { data: orderItems, error: checkError } = await supabase
        .from('order_items')
        .select('product_id')
        .in('product_id', productIds);
      
      if (checkError) throw new Error('فشل في التحقق من الطلبات المرتبطة');

      const productsWithOrders = orderItems?.map(item => item.product_id) || [];
      const productsToDelete = productIds.filter(id => !productsWithOrders.includes(id));
      const productsToDeactivate = productIds.filter(id => productsWithOrders.includes(id));

      if (productsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', productsToDelete);
        
        if (deleteError) throw new Error('فشل في حذف بعض المنتجات');
      }

      if (productsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from('products')
          .update({ is_active: false })
          .in('id', productsToDeactivate);
        
        if (deactivateError) throw new Error('فشل في إلغاء تفعيل بعض المنتجات');
      }

      return { deleted: productsToDelete, deactivated: productsToDeactivate };
    },
    onSuccess: ({ deleted, deactivated }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
      if (deleted.length > 0) {
        logChange('bulk_products_deleted', 'products', undefined, {
          product_count: deleted.length,
          product_ids: deleted
        });
      }
      
      if (deactivated.length > 0) {
        logChange('bulk_products_deactivated', 'products', undefined, {
          product_count: deactivated.length,
          product_ids: deactivated,
          reason: 'Products had existing orders'
        });
      }

      let message = '';
      if (deleted.length > 0 && deactivated.length > 0) {
        message = `تم حذف ${deleted.length} منتج وإلغاء تفعيل ${deactivated.length} منتج (مرتبط بطلبات)`;
      } else if (deleted.length > 0) {
        message = `تم حذف ${deleted.length} منتج`;
      } else if (deactivated.length > 0) {
        message = `تم إلغاء تفعيل ${deactivated.length} منتج (مرتبط بطلبات)`;
      }

      toast({
        title: 'تمت العملية',
        description: message,
      });
      setSelectedProducts([]);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف المنتجات',
        variant: 'destructive',
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (product: any) => {
      console.log('Starting product deletion process for:', product.id);
      
      try {
        const { data: orderItems, error: checkError } = await supabase
          .from('order_items')
          .select('id')
          .eq('product_id', product.id);
        
        if (checkError) {
          throw new Error('فشل في التحقق من الطلبات المرتبطة بالمنتج');
        }

        if (orderItems && orderItems.length > 0) {
          const { error: deactivateError } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', product.id);
          
          if (deactivateError) {
            throw new Error('فشل في إلغاء تفعيل المنتج');
          }

          await logChange('product_deactivated', 'product', product.id, {
            product_name: product.name,
            product_price: product.price,
            reason: 'Product has existing orders, deactivated instead of deleted'
          });

          return { ...product, deleted: false, deactivated: true };
        }

        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        
        if (deleteError) {
          throw new Error('فشل في حذف المنتج من قاعدة البيانات');
        }

        await logChange('product_deleted', 'product', product.id, {
          product_name: product.name,
          product_price: product.price
        });

        return { ...product, deleted: true, deactivated: false };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.refetchQueries({ queryKey: ['admin-products'] });
      
      if (result.deactivated) {
        toast({
          title: 'تم إلغاء تفعيل المنتج',
          description: `تم إلغاء تفعيل ${result.name} لأنه مرتبط بطلبات موجودة`,
        });
      } else {
        toast({
          title: 'تم حذف المنتج',
          description: `تم حذف ${result.name} بنجاح`,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'فشل في حذف المنتج';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const toggleProductStatus = useMutation({
    mutationFn: async ({ id, is_active, name }: { id: string; is_active: boolean; name: string }) => {
      const newStatus = !is_active;
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', id);
      
      if (error) throw error;

      await logChange(
        newStatus ? 'product_activated' : 'product_deactivated',
        'product',
        id,
        { product_name: name, new_status: newStatus }
      );

      return { id, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'تم تحديث حالة المنتج',
        description: 'تم تحديث حالة المنتج بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المنتج',
        variant: 'destructive',
      });
    }
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.map(p => p.id) || []);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDiscount = () => {
    const discount = parseInt(discountPercentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال نسبة خصم صحيحة (0-100)',
        variant: 'destructive',
      });
      return;
    }
    
    bulkDiscountMutation.mutate({ productIds: selectedProducts, discount });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    // Handle the special "all" value
    if (categoryId === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const formatOptions = (options: ProductOption[] | string[] | null, mainPrice: number) => {
    if (!options || !Array.isArray(options)) return 'لا توجد خيارات';
    
    if (options.length > 0 && typeof options[0] === 'string') {
      return (options as string[]).slice(0, 3).join(', ') + (options.length > 3 ? '...' : '');
    }
    
    const optionStrings = (options as ProductOption[]).slice(0, 3).map(option => {
      const price = option.price || mainPrice;
      return `${option.name} (${formatPrice(price)})`;
    });
    
    return optionStrings.join(', ') + (options.length > 3 ? '...' : '');
  };

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {editingProduct && (
        <EditProductForm 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
        />
      )}

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            تصفية
          </Button>
        </div>

        {showFilters && (
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الفئة</label>
              <Select value={selectedCategory || 'all'} onValueChange={handleCategorySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCategory && subcategories && subcategories.length > 0 && (
              <SubCategorySection
                subcategories={subcategories}
                selectedSubcategory={selectedSubcategory}
                onSubcategorySelect={handleSubcategorySelect}
              />
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-muted p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              تم تحديد {selectedProducts.length} منتج
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              إلغاء التحديد
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="نسبة الخصم %"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-32"
                min="0"
                max="100"
              />
              <Button
                onClick={handleBulkDiscount}
                disabled={!discountPercentage || bulkDiscountMutation.isPending}
                size="sm"
                className="flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                تطبيق الخصم
              </Button>
            </div>

            <Button
              onClick={() => bulkInactiveMutation.mutate(selectedProducts)}
              disabled={bulkInactiveMutation.isPending}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              إلغاء التفعيل
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف المحدد
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف {selectedProducts.length} منتج محدد؟
                    سيتم إلغاء تفعيل المنتجات المرتبطة بطلبات موجودة بدلاً من حذفها.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteMutation.mutate(selectedProducts)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    تأكيد الحذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === products?.length && products?.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الخصم</TableHead>
              <TableHead>الخيارات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={product.cover_image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  {product.discount_percentage && product.discount_percentage > 0 ? (
                    <Badge variant="destructive">
                      {product.discount_percentage}%
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">لا يوجد</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatOptions(product.options, product.price)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus.mutate({
                        id: product.id,
                        is_active: product.is_active || false,
                        name: product.name
                      })}
                    >
                      {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف "{product.name}"؟
                            {product.stock_quantity && product.stock_quantity > 0 && 
                              " سيتم إلغاء تفعيل المنتج إذا كان مرتبطاً بطلبات موجودة."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProductMutation.mutate(product)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            تأكيد الحذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {products?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد منتجات
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
