
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Phone, CreditCard, Calendar, User } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  phone: string;
  payment_method: string;
  governorate: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  selected_color: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cover_image: string;
  categories: string[];
  subcategories: string[];
  options: any[];
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
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
}

interface EnhancedOrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedOrderDetailsDialog = ({ order, isOpen, onClose }: EnhancedOrderDetailsDialogProps) => {
  // Fetch order items
  const { data: orderItems } = useQuery({
    queryKey: ['order-items', order?.id],
    queryFn: async () => {
      if (!order?.id) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!order?.id
  });

  // Fetch products for order items
  const { data: products } = useQuery({
    queryKey: ['order-products', orderItems],
    queryFn: async () => {
      if (!orderItems || orderItems.length === 0) return [];
      
      const productIds = orderItems.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!orderItems && orderItems.length > 0
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!order?.user_id
  });

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

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : categoryId;
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories?.find(s => s.id === subcategoryId);
    return subcategory ? `${subcategory.icon} ${subcategory.name}` : subcategoryId;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            تفاصيل الطلب #{order.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">العميل:</span>
                <span>{userProfile?.full_name || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium">الهاتف:</span>
                <span>{order.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">المحافظة:</span>
                <span>{order.governorate}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">تاريخ الطلب:</span>
                <span>{new Date(order.created_at).toLocaleDateString('ar')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">طريقة الدفع:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="font-medium">الحالة:</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              عنوان التسليم
            </h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
              {order.shipping_address}
            </p>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              المنتجات المطلوبة
            </h3>
            
            {orderItems && products ? (
              <div className="space-y-4">
                {orderItems.map((item) => {
                  const product = products.find(p => p.id === item.product_id);
                  if (!product) return null;

                  return (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={product.cover_image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium text-lg">{product.name}</h4>
                          
                          {/* Categories */}
                          {product.categories && product.categories.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">الفئات: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.categories.map((categoryId, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {getCategoryName(categoryId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Subcategories */}
                          {product.subcategories && product.subcategories.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">الفئات الفرعية: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.subcategories.map((subcategoryId, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {getSubcategoryName(subcategoryId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Selected Option */}
                          {item.selected_color && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">الخيار المختار: </span>
                              <Badge variant="secondary">{item.selected_color}</Badge>
                            </div>
                          )}

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-600">الكمية: </span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">السعر: </span>
                              <span className="font-medium">{formatPrice(item.price)}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">المجموع: </span>
                              <span className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">جاري تحميل تفاصيل المنتجات...</div>
            )}
          </div>

          <Separator />

          {/* Order Total */}
          <div className="text-left">
            <div className="text-2xl font-bold">
              إجمالي الطلب: {formatPrice(order.total_amount)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedOrderDetailsDialog;
