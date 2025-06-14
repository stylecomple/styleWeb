import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const OwnerOrdersManagement = () => {
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: async () => {
      console.log('Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      console.log('Fetched orders:', data?.length);
      return data;
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (order: any) => {
      console.log('Starting order deletion for order:', order.id);
      
      // First delete order items
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);
      
      if (orderItemsError) {
        console.error('Error deleting order items:', orderItemsError);
        throw orderItemsError;
      }

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }

      console.log('Order deleted successfully from database');

      // Log the change
      await logChange('order_deleted_by_owner', 'order', order.id, {
        order_total: order.total_amount,
        order_status: order.status,
        user_id: order.user_id
      });

      return order;
    },
    onSuccess: (deletedOrder) => {
      console.log('Order deletion mutation successful, updating cache');
      
      // Update cache immediately to remove the deleted order
      queryClient.setQueryData(['owner-orders'], (oldData: any) => {
        if (!oldData) return oldData;
        const filteredData = oldData.filter((order: any) => order.id !== deletedOrder.id);
        console.log('Updated cache, orders count:', filteredData.length);
        return filteredData;
      });
      
      // Also update other related caches
      queryClient.setQueryData(['admin-orders'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((order: any) => order.id !== deletedOrder.id);
      });
      
      queryClient.setQueryData(['orders'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((order: any) => order.id !== deletedOrder.id);
      });
      
      // Force invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['owner-orders'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['orders'], exact: true });
      
      toast({
        title: 'تم حذف الطلب',
        description: `تم حذف الطلب #${deletedOrder.id.substring(0, 8)} بنجاح من قاعدة البيانات`,
      });
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'فشل في حذف الطلب من قاعدة البيانات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  });

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

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <p className="text-sm text-orange-700">
          تحذير: حذف الطلبات عملية لا يمكن التراجع عنها. يرجى التأكد قبل المتابعة.
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">المبلغ الإجمالي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">عدد المنتجات</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  #{order.id.substring(0, 8)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('ar-EG')}
                </TableCell>
                <TableCell>
                  {order.order_items?.length || 0} منتج
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        disabled={deleteOrderMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد حذف الطلب</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بالطلب نهائياً من قاعدة البيانات.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteOrderMutation.mutate(order)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteOrderMutation.isPending}
                        >
                          {deleteOrderMutation.isPending ? 'جاري الحذف...' : 'حذف نهائياً'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!orders?.length && (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد طلبات حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrdersManagement;
