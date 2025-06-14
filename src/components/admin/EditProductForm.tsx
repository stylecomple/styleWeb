import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles } from 'lucide-react';
import ProductOptionsManager from './ProductOptionsManager';
import { ProductOption } from '@/types';

interface EditProductFormProps {
  product: any;
  onClose: () => void;
}

const EditProductForm = ({ product, onClose }: EditProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Convert old colors format to new options format
  const convertColorsToOptions = (colors: string[] | null): ProductOption[] => {
    if (!colors || !Array.isArray(colors)) return [];
    return colors.map(color => ({ name: color, price: undefined }));
  };
  
  // Convert old options format if needed
  const convertLegacyOptions = (options: any): ProductOption[] => {
    if (!options) return [];
    if (Array.isArray(options)) {
      // Check if it's the old colors format (array of strings)
      if (options.length > 0 && typeof options[0] === 'string') {
        return convertColorsToOptions(options);
      }
      // New format (array of objects) - clean up any malformed price values
      return options.map(option => ({
        name: option.name || '',
        price: typeof option.price === 'number' ? option.price : undefined
      }));
    }
    return [];
  };

  // Clean options data before saving
  const cleanOptionsData = (options: ProductOption[]): ProductOption[] => {
    return options.map(option => ({
      name: option.name || '',
      price: typeof option.price === 'number' && !isNaN(option.price) ? option.price : undefined
    })).filter(option => option.name.trim() !== ''); // Remove empty options
  };

  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    categories: product.categories || [],
    subcategories: product.subcategories || [],
    cover_image: product.cover_image || '',
    images: product.images?.join('\n') || '',
    options: convertLegacyOptions(product.options || product.colors),
    stock_quantity: product.stock_quantity?.toString() || '',
    discount_percentage: product.discount_percentage?.toString() || '0'
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('Updating product with data:', productData);
      
      const images = productData.images 
        ? productData.images.split('\n').filter((url: string) => url.trim()) 
        : [];

      // Clean the options data before sending to database
      const cleanedOptions = cleanOptionsData(productData.options);

      const productToUpdate = {
        name: productData.name,
        description: productData.description || null,
        price: parseInt(productData.price),
        categories: productData.categories,
        subcategories: productData.subcategories,
        cover_image: productData.cover_image || null,
        images: images,
        options: cleanedOptions as any, // Cast to Json type
        stock_quantity: parseInt(productData.stock_quantity) || 0,
        discount_percentage: parseInt(productData.discount_percentage) || 0
      };

      console.log('Product to update:', productToUpdate);

      const { data, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', product.id)
        .select();
      
      console.log('Update response:', { data, error });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم تحديث المنتج',
        description: 'تم تحديث المنتج بنجاح',
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المنتج',
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
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    
    updateProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryValue]
        : prev.categories.filter(cat => cat !== categoryValue)
    }));
  };

  const handleSubcategoryChange = (subcategoryValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subcategories: checked 
        ? [...prev.subcategories, subcategoryValue]
        : prev.subcategories.filter(sub => sub !== subcategoryValue)
    }));
  };

  const isExclusiveOffer = formData.categories.includes('exclusive_offers');

  // Get all available subcategories based on selected categories
  const availableSubcategories = availableCategories
    .filter(cat => formData.categories.includes(cat.id))
    .flatMap(cat => cat.subcategories || []);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>تعديل المنتج</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="stock">الكمية المتوفرة</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                placeholder="0"
              />
            </div>

            {isExclusiveOffer && (
              <div className="space-y-2">
                <Label htmlFor="discount">نسبة الخصم (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>الفئات الرئيسية *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={category.id}
                    checked={formData.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <Label 
                    htmlFor={category.id} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.icon} {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <Label>الفئات الفرعية</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSubcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={subcategory.id}
                      checked={formData.subcategories.includes(subcategory.id)}
                      onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked as boolean)}
                    />
                    <Label 
                      htmlFor={subcategory.id} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {subcategory.icon} {subcategory.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="cover_image">رابط الصورة الرئيسية</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => handleInputChange('cover_image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">روابط الصور الإضافية (سطر واحد لكل رابط)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => handleInputChange('images', e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={3}
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
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? 'جاري التحديث...' : 'تحديث المنتج'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProductForm;
