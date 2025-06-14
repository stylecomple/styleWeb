
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Calendar } from 'lucide-react';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

const StatisticsPanel = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start: start.toISOString(), end: now.toISOString() };
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-statistics', timePeriod],
    queryFn: async () => {
      const { start, end } = getDateRange(timePeriod);
      
      // إحصائيات الطلبات
      const { data: ordersStats } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', start)
        .lte('created_at', end);

      // إحصائيات المنتجات الأكثر مبيعاً
      const { data: topProducts } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products(name)
        `)
        .gte('created_at', start)
        .lte('created_at', end);

      // إحصائيات المستخدمين الجدد
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', start)
        .lte('created_at', end);

      // حساب الإجماليات
      const totalRevenue = ordersStats?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = ordersStats?.length || 0;
      const completedOrders = ordersStats?.filter(order => order.status === 'completed').length || 0;
      const pendingOrders = ordersStats?.filter(order => order.status === 'pending').length || 0;
      const cancelledOrders = ordersStats?.filter(order => order.status === 'cancelled').length || 0;

      // تجميع المنتجات الأكثر مبيعاً
      const productSales = topProducts?.reduce((acc: any, item: any) => {
        const productName = item.products?.name || 'منتج غير معروف';
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {});

      const topSellingProducts = Object.entries(productSales || {})
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      // بيانات المخطط الزمني للطلبات
      const ordersByDate = ordersStats?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString('ar-IQ');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const timelineData = Object.entries(ordersByDate || {})
        .map(([date, count]) => ({ date, count }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        newUsers: newUsers?.length || 0,
        topSellingProducts,
        timelineData,
        orderStatusData: [
          { name: 'مكتملة', value: completedOrders, color: '#10B981' },
          { name: 'معلقة', value: pendingOrders, color: '#F59E0B' },
          { name: 'ملغية', value: cancelledOrders, color: '#EF4444' }
        ]
      };
    }
  });

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ar-IQ')} د.ع`;
  };

  const periodLabels = {
    day: 'آخر يوم',
    week: 'آخر أسبوع',
    month: 'آخر شهر',
    year: 'آخر سنة'
  };

  if (isLoading) {
    return <div className="text-center">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إحصائيات المتجر</h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">آخر يوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">{periodLabels[timePeriod]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">{periodLabels[timePeriod]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون الجدد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newUsers || 0}</div>
            <p className="text-xs text-muted-foreground">{periodLabels[timePeriod]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المكتملة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedOrders || 0}</div>
            <p className="text-xs text-muted-foreground">من أصل {stats?.totalOrders || 0} طلب</p>
          </CardContent>
        </Card>
      </div>

      {/* المخططات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط الطلبات حسب التاريخ */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات حسب التاريخ</CardTitle>
            <CardDescription>{periodLabels[timePeriod]}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.timelineData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مخطط حالة الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
            <CardDescription>{periodLabels[timePeriod]}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.orderStatusData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.orderStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* المنتجات الأكثر مبيعاً */}
      <Card>
        <CardHeader>
          <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          <CardDescription>{periodLabels[timePeriod]}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.topSellingProducts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPanel;
