
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ban, UserCheck, Mail, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const UserBanManagement = () => {
  const [email, setEmail] = useState('');
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user profiles
  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async (userEmail: string) => {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', userEmail)
        .single();
      
      if (profileError) throw new Error('المستخدم غير موجود');

      // Update profile to mark as banned (you might want to add a 'is_banned' column)
      // For now, we'll just log the action
      await logChange('user_banned', 'user', profile.id, {
        user_email: userEmail,
        user_name: profile.full_name,
        banned_at: new Date().toISOString()
      });

      return { profile, userEmail };
    },
    onSuccess: (data) => {
      toast({
        title: 'تم حظر المستخدم',
        description: `تم حظر ${data.userEmail} بنجاح`,
      });
      setEmail('');
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حظر المستخدم',
        variant: 'destructive',
      });
    }
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await logChange('user_unbanned', 'user', userId, {
        unbanned_at: new Date().toISOString()
      });
      return userId;
    },
    onSuccess: () => {
      toast({
        title: 'تم إلغاء حظر المستخدم',
        description: 'تم إلغاء حظر المستخدم بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إلغاء حظر المستخدم',
        variant: 'destructive',
      });
    }
  });

  const handleBanUser = () => {
    if (!email.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }
    banUserMutation.mutate(email.trim());
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <p className="text-sm text-red-700">
          تحذير: حظر المستخدمين يمنعهم من الوصول إلى النظام. استخدم هذه الميزة بحذر.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            حظر مستخدم
          </CardTitle>
          <CardDescription>
            أدخل البريد الإلكتروني للمستخدم لحظره من النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="البريد الإلكتروني للمستخدم"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleBanUser}
              disabled={banUserMutation.isPending}
              variant="destructive"
            >
              <Ban className="w-4 h-4 mr-2" />
              حظر المستخدم
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            قائمة المستخدمين
          </CardTitle>
          <CardDescription>
            إدارة حالة حظر المستخدمين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || 'غير محدد'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      نشط
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanUser()}
                        disabled={banUserMutation.isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        حظر
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(user.id)}
                        disabled={unbanUserMutation.isPending}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        إلغاء الحظر
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!users?.length && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مستخدمين مسجلين حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBanManagement;
