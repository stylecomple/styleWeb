
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string;
  phone: string;
  governorate: string;
  payment_method: string;
}

const MobileOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['mobile-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  if (!user) {
    return (
      <MobileAppLayout title="طلباتي">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-gray-600 mb-4">يجب تسجيل الدخول لعرض طلباتك</p>
            <Button onClick={() => navigate('/app/auth')}>
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title="طلباتي">
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        طلب رقم #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status === 'pending' && 'قيد الانتظار'}
                        {order.status === 'confirmed' && 'مؤكد'}
                        {order.status === 'delivered' && 'تم التسليم'}
                        {order.status === 'cancelled' && 'ملغي'}
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع:</span>
                      <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المحافظة:</span>
                      <span>{order.governorate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span>
                        {order.payment_method === 'cash_on_delivery' && 'الدفع عند الاستلام'}
                        {order.payment_method === 'visa_card' && 'فيزا كارد'}
                        {order.payment_method === 'zain_cash' && 'زين كاش'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500 mb-4">لم تقم بإجراء أي طلبات بعد</p>
            <Button onClick={() => navigate('/app/products')}>
              ابدأ التسوق
            </Button>
          </div>
        )}
      </div>
    </MobileAppLayout>
  );
};

export default MobileOrders;
