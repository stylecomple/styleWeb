
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, BarChart3, Settings, MessageSquare, Percent, Plus, FolderPlus, FileSpreadsheet } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import UserManagement from '@/components/admin/UserManagement';
import StatisticsPanel from '@/components/admin/StatisticsPanel';
import DiscountManagement from '@/components/admin/DiscountManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import AddProductForm from '@/components/admin/AddProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import ExcelProductImport from '@/components/admin/ExcelProductImport';

const AdminPanel = () => {
  const { user, isAdmin, isOwner, isOrderManager, isProductsAdder, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'products';
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);

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

  if (!(isAdmin || isOwner || isOrderManager || isProductsAdder)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">غير مصرح</h1>
          <p className="text-red-500">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    window.history.pushState({}, '', newUrl);
  };

  const isFullAdmin = isAdmin || isOwner;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold">لوحة التحكم</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
                  <p className="text-muted-foreground">إدارة المتجر والطلبات</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/app/products')} 
                className="flex items-center gap-2"
              >
                العودة للمتجر
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
                {isFullAdmin && (
                  <TabsTrigger value="products" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Package className="w-4 h-4" />
                    <span className="hidden sm:inline">المنتجات</span>
                  </TabsTrigger>
                )}
                {isProductsAdder && !isFullAdmin && (
                  <TabsTrigger value="products" className="flex items-center gap-2 text-xs lg:text-sm">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">إضافة منتجات</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="orders" className="flex items-center gap-2 text-xs lg:text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">الطلبات</span>
                </TabsTrigger>
                {isFullAdmin && (
                  <>
                    <TabsTrigger value="users" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">المستخدمين</span>
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center gap-2 text-xs lg:text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">الإحصائيات</span>
                    </TabsTrigger>
                    <TabsTrigger value="discounts" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Percent className="w-4 h-4" />
                      <span className="hidden sm:inline">الخصومات</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2 text-xs lg:text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">التقييمات</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 text-xs lg:text-sm">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">الإعدادات</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="products" className="space-y-6">
                {showExcelImport ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">استيراد المنتجات من Excel</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExcelImport(false)}
                      >
                        العودة للمنتجات
                      </Button>
                    </div>
                    <ExcelProductImport />
                  </div>
                ) : showAddProduct ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">إضافة منتج جديد</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddProduct(false)}
                      >
                        العودة للمنتجات
                      </Button>
                    </div>
                    <AddProductForm onClose={() => setShowAddProduct(false)} />
                  </div>
                ) : showCategoryManager ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">إدارة الفئات</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCategoryManager(false)}
                      >
                        العودة للمنتجات
                      </Button>
                    </div>
                    <CategoryManager />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setShowExcelImport(true)}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          استيراد من Excel
                        </Button>
                        <Button 
                          onClick={() => setShowAddProduct(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة منتج جديد
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowCategoryManager(true)}
                          className="flex items-center gap-2"
                        >
                          <FolderPlus className="w-4 h-4" />
                          إدارة الفئات
                        </Button>
                      </div>
                    </div>
                    <ProductsManagement />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
                <OrdersManagement />
              </TabsContent>

              {isFullAdmin && (
                <>
                  <TabsContent value="users" className="space-y-6">
                    <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
                    <UserManagement />
                  </TabsContent>

                  <TabsContent value="statistics" className="space-y-6">
                    <h2 className="text-2xl font-bold">الإحصائيات</h2>
                    <StatisticsPanel />
                  </TabsContent>

                  <TabsContent value="discounts" className="space-y-6">
                    <h2 className="text-2xl font-bold">إدارة الخصومات</h2>
                    <DiscountManagement />
                  </TabsContent>

                  <TabsContent value="feedback" className="space-y-6">
                    <h2 className="text-2xl font-bold">إدارة التقييمات</h2>
                    <FeedbackManagement />
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <h2 className="text-2xl font-bold">إعدادات النظام</h2>
                    <AdminSettings />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;
