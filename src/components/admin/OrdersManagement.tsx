
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import OrderDetailsDialog from './OrderDetailsDialog';

interface OrdersManagementProps {
  DeleteOrderButton?: React.ComponentType<{ order: any }>;
}

const OrdersManagement = ({ DeleteOrderButton }: OrdersManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
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
            selected_color,
            products (name, cover_image)
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

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: 'تم تحديث الطلب',
        description: 'تم تحديث حالة الطلب بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الطلب',
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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث برقم الطلب أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm md:text-base"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">في الانتظار</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="delivered">تم التسليم</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs md:text-sm">رقم الطلب</TableHead>
                <TableHead className="text-right text-xs md:text-sm hidden sm:table-cell">المبلغ الإجمالي</TableHead>
                <TableHead className="text-right text-xs md:text-sm">الحالة</TableHead>
                <TableHead className="text-right text-xs md:text-sm hidden md:table-cell">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right text-xs md:text-sm hidden lg:table-cell">عدد المنتجات</TableHead>
                <TableHead className="text-right text-xs md:text-sm">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs md:text-sm">
                    #{order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium text-xs md:text-sm hidden sm:table-cell">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                      disabled={updateOrderMutation.isPending}
                    >
                      <SelectTrigger className="w-full sm:w-32 md:w-40 p-1 h-8 text-xs">
                        <Badge className={`${getStatusColor(order.status)} text-xs px-1 py-0`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="confirmed">مؤكد</SelectItem>
                        <SelectItem value="shipped">تم الشحن</SelectItem>
                        <SelectItem value="delivered">تم التسليم</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs md:text-sm hidden md:table-cell">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-xs md:text-sm hidden lg:table-cell">
                    {order.order_items?.length || 0} منتج
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 px-2 md:px-3"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline ml-1 text-xs">عرض</span>
                      </Button>
                      {DeleteOrderButton && <DeleteOrderButton order={order} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm md:text-base">
            {searchTerm || statusFilter !== 'all' ? 'لم يتم العثور على طلبات مطابقة' : 'لا توجد طلبات حالياً'}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersManagement;
