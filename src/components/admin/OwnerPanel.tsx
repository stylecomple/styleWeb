
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, ArrowLeft, Clock, UserCog, Trash2, Ban, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import ChangesLogPanel from './ChangesLogPanel';
import UserManagement from './UserManagement';
import OwnerOrdersManagement from './OwnerOrdersManagement';
import UserBanManagement from './UserBanManagement';
import SimpleDiscountManagement from './SimpleDiscountManagement';

const OwnerPanel = () => {
  const { user, isOwner, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isOwner) {
    navigate('/admin');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              لوحة المالك
            </h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المالك</h1>
                    <p className="text-muted-foreground">إدارة متقدمة للنظام والمستخدمين</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للوحة التحكم
              </Button>
            </div>

            <Tabs defaultValue="discounts" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
                <TabsTrigger value="discounts" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Percent className="w-4 h-4" />
                  <span className="hidden sm:inline">الخصومات</span>
                </TabsTrigger>
                <TabsTrigger value="changes-log" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">سجل التغييرات</span>
                </TabsTrigger>
                <TabsTrigger value="user-management" className="flex items-center gap-2 text-xs lg:text-sm">
                  <UserCog className="w-4 h-4" />
                  <span className="hidden sm:inline">المستخدمين</span>
                </TabsTrigger>
                <TabsTrigger value="orders-management" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">الطلبات</span>
                </TabsTrigger>
                <TabsTrigger value="user-ban" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Ban className="w-4 h-4" />
                  <span className="hidden sm:inline">حظر المستخدمين</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discounts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="w-6 h-6" />
                      إدارة الخصومات العامة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleDiscountManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="changes-log" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      سجل التغييرات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChangesLogPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="user-management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="w-6 h-6" />
                      إدارة المستخدمين والأدوار
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders-management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="w-6 h-6" />
                      إدارة وحذف الطلبات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OwnerOrdersManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="user-ban" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ban className="w-6 h-6" />
                      حظر وإلغاء حظر المستخدمين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserBanManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default OwnerPanel;
