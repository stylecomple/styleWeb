
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Package, ShoppingCart, Store } from 'lucide-react';
import { format } from 'date-fns';

const ChangesLogPanel = () => {
  const { data: changes, isLoading } = useQuery({
    queryKey: ['changes-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changes_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const getActionColor = (actionType: string) => {
    if (actionType.includes('added') || actionType.includes('created')) {
      return 'bg-green-100 text-green-800';
    }
    if (actionType.includes('deleted') || actionType.includes('removed')) {
      return 'bg-red-100 text-red-800';
    }
    if (actionType.includes('updated') || actionType.includes('changed')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (actionType.includes('store_closed')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (actionType.includes('store_opened')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'store': return <Store className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            سجل التغييرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          سجل التغييرات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {changes?.map((change) => (
            <div key={change.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEntityIcon(change.entity_type)}
                  <span className="font-medium">{change.admin_name}</span>
                </div>
                <Badge className={getActionColor(change.action_type)}>
                  {change.action_type}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                <div>النوع: {change.entity_type}</div>
                {change.entity_id && (
                  <div>المعرف: {change.entity_id}</div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">
                    {format(new Date(change.created_at), 'yyyy/MM/dd')} - {format(new Date(change.created_at), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
              
              {change.details && (
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(change.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
          
          {!changes?.length && (
            <div className="text-center py-8 text-gray-500">
              لا توجد تغييرات مسجلة
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangesLogPanel;
