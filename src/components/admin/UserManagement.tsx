
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useChangeLogger } from '@/hooks/useChangeLogger';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus, Mail, Shield, Users, ClipboardList } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserEmailSearch from './UserEmailSearch';

const UserManagement = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'order_manager'>('admin');
  const { logChange } = useChangeLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOwner, isAdmin } = useAuth();

  // Fetch all user roles with profile information
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) throw error;

      // Get profile information for each user
      const userRolesWithProfiles = await Promise.all(
        data.map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', role.user_id)
            .single();
          
          return {
            ...role,
            profile
          };
        })
      );

      return userRolesWithProfiles;
    }
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userEmail, role }: { userEmail: string; role: 'admin' | 'order_manager' }) => {
      console.log('Looking for user with email:', userEmail);
      
      // First get user by email from profiles - using ilike for case-insensitive search
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('email', userEmail.trim())
        .single();
      
      console.log('Profile query result:', { profile, profileError });
      
      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        
        // Let's also try to get all profiles to debug
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('email');
        
        console.log('All profiles emails:', allProfiles?.map(p => p.email));
        
        throw new Error(`المستخدم بالبريد الإلكتروني "${userEmail}" غير موجود في النظام. تأكد من أن المستخدم قد سجل دخوله مرة واحدة على الأقل.`);
      }

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', profile.id)
        .eq('role', role)
        .single();

      if (existingRole) {
        const roleLabels = {
          admin: 'مدير',
          order_manager: 'مدير طلبات'
        };
        throw new Error(`المستخدم ${roleLabels[role]} بالفعل`);
      }

      // Add role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: role
        });

      if (error) {
        console.error('Insert role error:', error);
        throw error;
      }

      // Log the change
      await logChange(`${role}_role_added`, 'user', profile.id, {
        user_email: userEmail,
        user_name: profile.full_name,
        role: role
      });

      return { profile, userEmail, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      const roleLabels = {
        admin: 'المدير',
        order_manager: 'مدير الطلبات'
      };
      toast({
        title: `تم إضافة ${roleLabels[data.role]}`,
        description: `تم منح ${data.userEmail} صلاحيات ${roleLabels[data.role]} بنجاح`,
      });
      setEmail('');
    },
    onError: (error: any) => {
      console.error('Add role mutation error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الدور',
        variant: 'destructive',
      });
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'order_manager' }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      // Log the change
      await logChange(`${role}_role_removed`, 'user', userId, { role });

      return { userId, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      const roleLabels = {
        admin: 'المدير',
        order_manager: 'مدير الطلبات'
      };
      toast({
        title: `تم إزالة ${roleLabels[data.role as keyof typeof roleLabels]}`,
        description: 'تم إزالة الصلاحيات بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة الصلاحيات',
        variant: 'destructive',
      });
    }
  });

  const handleAddRole = () => {
    if (!email.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }
    addRoleMutation.mutate({ userEmail: email.trim(), role: selectedRole });
  };

  const handleRemoveRole = (userId: string, role: string) => {
    // Check permissions for removing roles
    if (role === 'owner') {
      toast({
        title: 'خطأ',
        description: 'لا يمكن إزالة صلاحيات المالك',
        variant: 'destructive',
      });
      return;
    }

    if (role === 'admin' && !isOwner) {
      toast({
        title: 'خطأ',
        description: 'فقط المالك يمكنه إزالة صلاحيات المدير',
        variant: 'destructive',
      });
      return;
    }

    // Only allow removing admin and order_manager roles with proper permissions
    if (role === 'admin' || role === 'order_manager') {
      removeRoleMutation.mutate({ userId, role: role as 'admin' | 'order_manager' });
    }
  };

  const canRemoveRole = (role: string) => {
    if (role === 'owner') return false;
    if (role === 'admin' && !isOwner) return false;
    return true;
  };

  const getAvailableRoles = () => {
    if (isOwner) {
      return [
        { value: 'admin', label: 'مدير' },
        { value: 'order_manager', label: 'مدير طلبات' }
      ];
    } else if (isAdmin) {
      return [
        { value: 'order_manager', label: 'مدير طلبات' }
      ];
    }
    return [];
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const adminUsers = userRoles?.filter(role => role.role === 'admin') || [];
  const orderManagerUsers = userRoles?.filter(role => role.role === 'order_manager') || [];
  const ownerUsers = userRoles?.filter(role => role.role === 'owner') || [];
  const availableRoles = getAvailableRoles();

  return (
    <div className="space-y-6">
      {availableRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              إضافة دور جديد
            </CardTitle>
            <CardDescription>
              ابحث عن البريد الإلكتروني للمستخدم لمنحه الدور المحدد. تأكد من أن المستخدم قد سجل دخوله مرة واحدة على الأقل.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <UserEmailSearch
                  value={email}
                  onChange={setEmail}
                  placeholder="ابحث عن البريد الإلكتروني للمستخدم"
                />
              </div>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'order_manager') => setSelectedRole(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddRole}
                disabled={addRoleMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                إضافة الدور
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة المستخدمين
          </CardTitle>
          <CardDescription>
            قائمة بجميع المديرين ومديري الطلبات والمالكين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.profile?.full_name || 'غير محدد'}</TableCell>
                  <TableCell>{user.profile?.email}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-600">
                      <Shield className="w-3 h-3 mr-1" />
                      مالك
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">لا يمكن تعديل</span>
                  </TableCell>
                </TableRow>
              ))}
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.profile?.full_name || 'غير محدد'}</TableCell>
                  <TableCell>{user.profile?.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Shield className="w-3 h-3 mr-1" />
                      مدير
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canRemoveRole(user.role) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRole(user.user_id, user.role)}
                        disabled={removeRoleMutation.isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        إزالة صلاحيات
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {isAdmin && !isOwner ? 'فقط المالك يمكنه الإزالة' : 'لا يمكن تعديل'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orderManagerUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.profile?.full_name || 'غير محدد'}</TableCell>
                  <TableCell>{user.profile?.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <ClipboardList className="w-3 h-3 mr-1" />
                      مدير طلبات
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRole(user.user_id, user.role)}
                      disabled={removeRoleMutation.isPending}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      إزالة صلاحيات
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {adminUsers.length === 0 && ownerUsers.length === 0 && orderManagerUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أدوار مستخدمين حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
