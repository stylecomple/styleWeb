
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              name,
              cover_image
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'shipped':
        return 'تم الشحن';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول لعرض طلباتك</p>
          <Button onClick={() => navigate('/auth')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">طلباتي</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        طلب رقم: {order.id.slice(0, 8)}...
                      </CardTitle>
                      <p className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <Badge className={`flex items-center gap-2 ${getStatusColor(order.status || 'pending')}`}>
                      {getStatusIcon(order.status || 'pending')}
                      {getStatusLabel(order.status || 'pending')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">تفاصيل الطلب:</h4>
                        <p className="text-sm text-gray-600">
                          المجموع: {formatPrice(order.total_amount)}
                        </p>
                        {order.phone && (
                          <p className="text-sm text-gray-600">
                            الهاتف: {order.phone}
                          </p>
                        )}
                      </div>
                      
                      {order.shipping_address && (
                        <div>
                          <h4 className="font-semibold mb-2">عنوان التوصيل:</h4>
                          <p className="text-sm text-gray-600">{order.shipping_address}</p>
                        </div>
                      )}
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">المنتجات:</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.products?.cover_image || '/placeholder.svg'}
                                alt={item.products?.name || 'منتج'}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.products?.name || 'منتج غير معروف'}</p>
                                <p className="text-sm text-gray-600">
                                  الكمية: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد طلبات</h2>
            <p className="text-gray-600 mb-6">لم تقم بإجراء أي طلبات بعد</p>
            <Button onClick={() => navigate('/')}>
              ابدأ التسوق الآن
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
