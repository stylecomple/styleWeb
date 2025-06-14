
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderDetailsDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog = ({ order, isOpen, onClose }: OrderDetailsDialogProps) => {
  if (!order) return null;

  const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const paymentMethodLabels = {
    cash_on_delivery: 'الدفع عند الاستلام',
    zain_cash: 'زين كاش',
    visa_card: 'فيزا كارد'
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} دينار`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-right">
            تفاصيل الطلب رقم: {order.id.slice(0, 8)}...
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>معلومات الطلب</span>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>رقم الطلب:</strong> {order.id}</p>
                  <p><strong>تاريخ الطلب:</strong> {new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
                  <p><strong>المبلغ الإجمالي:</strong> {formatPrice(order.total_amount)}</p>
                  {order.payment_method && (
                    <p><strong>طريقة الدفع:</strong> {paymentMethodLabels[order.payment_method as keyof typeof paymentMethodLabels] || order.payment_method}</p>
                  )}
                </div>
                <div>
                  <p><strong>رقم الهاتف:</strong> {order.phone || 'غير محدد'}</p>
                  {order.governorate && (
                    <p><strong>المحافظة:</strong> {order.governorate}</p>
                  )}
                  <p><strong>عنوان الشحن:</strong> {order.shipping_address || 'غير محدد'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>المنتجات المطلوبة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.products?.cover_image || '/placeholder.svg'}
                        alt={item.products?.name || 'منتج'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.products?.name || 'منتج غير معروف'}</h4>
                        <div className="text-sm text-gray-600">
                          <p>الكمية: {item.quantity}</p>
                          <p>السعر: {formatPrice(item.price)}</p>
                          {item.selected_color && (
                            <p>اللون: {item.selected_color}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-pink-600">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
