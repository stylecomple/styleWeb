
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, User, Mail, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

const FeedbackManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Fetch all feedback
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Update feedback status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast({
        title: 'تم تحديث الحالة',
        description: 'تم تحديث حالة التعليق بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة التعليق',
        variant: 'destructive',
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            تمت المراجعة
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            تم الحل
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const pendingCount = feedbacks?.filter(f => f.status === 'pending').length || 0;
  const reviewedCount = feedbacks?.filter(f => f.status === 'reviewed').length || 0;
  const resolvedCount = feedbacks?.filter(f => f.status === 'resolved').length || 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تمت المراجعة</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reviewedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم الحل</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            إدارة التعليقات
          </CardTitle>
          <CardDescription>
            قائمة بجميع تعليقات العملاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الموضوع</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks?.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{feedback.user_name || 'غير محدد'}</span>
                      <span className="text-sm text-muted-foreground">{feedback.user_email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{feedback.subject}</TableCell>
                  <TableCell>
                    {feedback.rating ? renderStars(feedback.rating) : 'بدون تقييم'}
                  </TableCell>
                  <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(feedback.created_at), 'yyyy/MM/dd')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedFeedback(feedback)}
                          >
                            عرض
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>تفاصيل التعليق</DialogTitle>
                            <DialogDescription>
                              تعليق من {selectedFeedback?.user_name || 'عميل غير محدد'}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedFeedback && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">اسم العميل:</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedFeedback.user_name || 'غير محدد'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">البريد الإلكتروني:</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedFeedback.user_email || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">الموضوع:</label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {selectedFeedback.subject}
                                </p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">الرسالة:</label>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                  {selectedFeedback.message}
                                </p>
                              </div>
                              
                              {selectedFeedback.rating && (
                                <div>
                                  <label className="text-sm font-medium">التقييم:</label>
                                  <div className="mt-1">
                                    {renderStars(selectedFeedback.rating)}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(selectedFeedback.id, 'reviewed')}
                                  disabled={selectedFeedback.status === 'reviewed'}
                                >
                                  وضع علامة كمراجع
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(selectedFeedback.id, 'resolved')}
                                  disabled={selectedFeedback.status === 'resolved'}
                                >
                                  وضع علامة كمحلول
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!feedbacks || feedbacks.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تعليقات حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;
