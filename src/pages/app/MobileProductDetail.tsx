
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MobileAppLayout from '@/components/MobileAppLayout';

const MobileProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['mobile-product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Handle legacy colors field - convert to options format
      const options = data.options || 
        (data.colors ? data.colors.map((color: string) => ({ name: color, price: undefined })) : []);
      
      return {
        ...data,
        options
      } as Product;
    },
    enabled: !!id
  });

  const getEffectivePrice = () => {
    if (!product) return 0;
    
    // Check if selected option has a custom price
    const selectedOptionData = product.options?.find(opt => opt.name === selectedOption);
    const basePrice = selectedOptionData?.price !== undefined ? selectedOptionData.price : product.price;
    
    if (product.discount_percentage && product.discount_percentage > 0) {
      return basePrice * (1 - product.discount_percentage / 100);
    }
    return basePrice;
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/app/auth');
      return;
    }

    if (!product) return;

    // If product has options but none selected, show error
    if (product.options && product.options.length > 0 && !selectedOption) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الخيار المطلوب",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: getEffectivePrice(),
      image: product.cover_image || '/placeholder.svg',
      quantity,
      selectedOption: selectedOption || null
    });

    toast({
      title: "تم إضافة المنتج",
      description: "تم إضافة المنتج إلى السلة بنجاح",
    });
  };

  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.cover_image) images.push(product.cover_image);
    if (product.images && product.images.length > 0) {
      images.push(...product.images.filter(img => img !== product.cover_image));
    }
    return images;
  };

  const allImages = getAllImages();
  const hasValidDiscount = product?.discount_percentage && product.discount_percentage > 0;

  if (isLoading) {
    return (
      <MobileAppLayout title="المنتج">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </MobileAppLayout>
    );
  }

  if (!product) {
    return (
      <MobileAppLayout title="المنتج غير موجود">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">المنتج غير موجود</h2>
            <Button onClick={() => navigate('/app/products')}>
              العودة للمنتجات
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title={product.name}>
      <div className="p-4 space-y-6">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={allImages[selectedImageIndex] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
            />
            {hasValidDiscount && (
              <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold">
                خصم {product.discount_percentage}%
              </Badge>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-pink-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              {hasValidDiscount ? (
                <>
                  <span className="text-2xl font-bold text-pink-600">
                    {Math.round(getEffectivePrice()).toLocaleString()} د.ع
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {(product.options?.find(opt => opt.name === selectedOption)?.price || product.price).toLocaleString()} د.ع
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-pink-600">
                  {Math.round(getEffectivePrice()).toLocaleString()} د.ع
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-4">
                {product.description}
              </p>
            )}
          </div>

          {/* Options Selection */}
          {product.options && product.options.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">اختر الخيار:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.options.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => setSelectedOption(option.name)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        selectedOption === option.name
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.name}</div>
                      {option.price !== undefined && option.price !== product.price && (
                        <div className="text-sm text-gray-600">
                          {option.price.toLocaleString()} د.ع
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quantity Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">الكمية:</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              أضف للسلة ({Math.round(getEffectivePrice() * quantity).toLocaleString()} د.ع)
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileProductDetail;
