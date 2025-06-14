
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import OrdersManagement from './OrdersManagement';

const EnhancedOrdersManagement = () => {
  const { isOwner } = useAuth();
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      await logChange('order_deleted', 'order', order.id, {
        order_total: order.total_amount,
        order_status: order.status
      });

      return order;
    },
    onSuccess: (deletedOrder) => {
      console.log('Order deletion mutation successful, updating cache');
      
      // Update cache immediately to remove the deleted order
      queryClient.setQueryData(['admin-orders'], (oldData: any) => {
        if (!oldData) return oldData;
        const filteredData = oldData.filter((order: any) => order.id !== deletedOrder.id);
        console.log('Updated cache, orders count:', filteredData.length);
        return filteredData;
      });
      
      // Also update other related caches
      queryClient.setQueryData(['owner-orders'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((order: any) => order.id !== deletedOrder.id);
      });
      
      queryClient.setQueryData(['orders'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((order: any) => order.id !== deletedOrder.id);
      });
      
      // Force invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['admin-orders'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['owner-orders'], exact: true });
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

  const DeleteOrderButton = ({ order }: { order: any }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
          disabled={deleteOrderMutation.isPending}
        >
          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline ml-1">حذف</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm md:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm md:text-base">تأكيد حذف الطلب</AlertDialogTitle>
          <AlertDialogDescription className="text-xs md:text-sm">
            هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بالطلب نهائياً من قاعدة البيانات.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="text-xs md:text-sm">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteOrderMutation.mutate(order)}
            className="bg-red-600 hover:bg-red-700 text-xs md:text-sm"
            disabled={deleteOrderMutation.isPending}
          >
            {deleteOrderMutation.isPending ? 'جاري الحذف...' : 'حذف نهائياً'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Pass the DeleteOrderButton component to OrdersManagement
  return <OrdersManagement DeleteOrderButton={DeleteOrderButton} />;
};

export default EnhancedOrdersManagement;
