import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles } from 'lucide-react';
import ImageUploadCrop from './ImageUploadCrop';
import MultiImageUpload from './MultiImageUpload';
import CategoryManager from './CategoryManager';
import ProductOptionsManager from './ProductOptionsManager';
import { ProductOption } from '@/types';

interface AddProductFormProps {
  onClose: () => void;
}

const AddProductForm = ({ onClose }: AddProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Clean options data before saving
  const cleanOptionsData = (options: ProductOption[]): ProductOption[] => {
    return options.map(option => ({
      name: option.name || '',
      price: typeof option.price === 'number' && !isNaN(option.price) ? option.price : undefined
    })).filter(option => option.name.trim() !== '');
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categories: [] as string[],
    subcategories: [] as string[],
    cover_image: '',
    images: [] as string[],
    options: [] as ProductOption[],
    stock_quantity: '',
    ignore_stock: false
  });

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Fetch categories from database
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `);
      
      if (error) throw error;
      return data || [];
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('Adding product with data:', productData);

      const cleanedOptions = cleanOptionsData(productData.options);

      const productToInsert = {
        name: productData.name,
        description: productData.description || null,
        price: parseInt(productData.price),
        categories: productData.categories,
        subcategories: productData.subcategories,
        cover_image: productData.cover_image || null,
        images: productData.images,
        options: cleanedOptions as any,
        stock_quantity: productData.ignore_stock ? null : (parseInt(productData.stock_quantity) || 0)
      };

      console.log('Product to insert:', productToInsert);

      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select();
      
      console.log('Insert response:', { data, error });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم إضافة المنتج',
        description: 'تم إضافة المنتج الجديد بنجاح',
      });
      setFormData({
        name: '',
        description: '',
        price: '',
        categories: [],
        subcategories: [],
        cover_image: '',
        images: [],
        options: [],
        stock_quantity: '',
        ignore_stock: false
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error adding product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة المنتج',
        variant: 'destructive',
      });
    }
  });

  const generateDescription = async () => {
    if (!formData.name) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم المنتج أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      // Get category and subcategory names for better context
      const categoryNames = formData.categories.map(catId => {
        const category = availableCategories.find(cat => cat.id === catId);
        return category?.name;
      }).filter(Boolean);

      const subcategoryNames = formData.subcategories.map(subId => {
        const subcategory = availableCategories
          .flatMap(cat => cat.subcategories || [])
          .find(sub => sub.id === subId);
        return subcategory?.name;
      }).filter(Boolean);

      const { data, error } = await supabase.functions.invoke('generate-product-description', {
        body: {
          productName: formData.name,
          currentDescription: formData.description,
          categories: categoryNames,
          subcategories: subcategoryNames
        }
      });

      if (error) throw error;

      setFormData(prev => ({ ...prev, description: data.description }));
      toast({
        title: 'تم إنشاء الوصف',
        description: 'تم إنشاء وصف تسويقي للمنتج بنجاح',
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الوصف. تأكد من إعداد مفتاح Gemini AI',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.name || !formData.price || formData.categories.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة واختيار فئة واحدة على الأقل',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.ignore_stock && formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
      toast({
        title: 'خطأ',
        description: 'الكمية المتوفرة يجب أن تكون رقماً موجباً',
        variant: 'destructive',
      });
      return;
    }
    
    addProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subcategories: checked 
        ? [...prev.subcategories, subcategoryId]
        : prev.subcategories.filter(id => id !== subcategoryId)
    }));
  };

  // Get all available subcategories based on selected categories
  const availableSubcategories = availableCategories
    .filter(cat => formData.categories.includes(cat.id))
    .flatMap(cat => cat.subcategories || []);

  return (
    <div className="space-y-6">
      {showCategoryManager && (
        <CategoryManager />
      )}
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إضافة منتج جديد</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCategoryManager(!showCategoryManager)}
            >
              إدارة الفئات
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">السعر (د.ع) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الفئات * (اختر فئة واحدة أو أكثر)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={category.id}
                      checked={formData.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                    />
                    <Label htmlFor={category.id} className="text-sm flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <Label>الفئات الفرعية</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={subcategory.id}
                        checked={formData.subcategories.includes(subcategory.id)}
                        onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, !!checked)}
                      />
                      <Label htmlFor={subcategory.id} className="text-sm flex items-center gap-2">
                        <span>{subcategory.icon}</span>
                        {subcategory.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="ignore_stock"
                  checked={formData.ignore_stock}
                  onCheckedChange={(checked) => handleInputChange('ignore_stock', !!checked)}
                />
                <Label htmlFor="ignore_stock" className="text-sm">
                  تجاهل تتبع المخزون (مخزون غير محدود)
                </Label>
              </div>
              
              {!formData.ignore_stock && (
                <div className="space-y-2">
                  <Label htmlFor="stock">الكمية المتوفرة</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">الوصف</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={isGeneratingDescription || !formData.name}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingDescription ? 'جاري الإنشاء...' : 'إنشاء وصف بالذكاء الاصطناعي'}
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="أدخل وصف المنتج أو استخدم الذكاء الاصطناعي لإنشاء وصف تسويقي"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>الصورة الرئيسية *</Label>
              <ImageUploadCrop
                currentImage={formData.cover_image}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
              />
            </div>

            <div className="space-y-2">
              <Label>الصور الإضافية</Label>
              <MultiImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={10}
              />
            </div>

            <ProductOptionsManager
              options={formData.options}
              onChange={(options) => setFormData(prev => ({ ...prev, options }))}
              mainProductPrice={parseInt(formData.price) || 0}
            />

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-pink-600 hover:bg-pink-700"
                disabled={addProductMutation.isPending}
              >
                {addProductMutation.isPending ? 'جاري الإضافة...' : 'إضافة المنتج'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductForm;
