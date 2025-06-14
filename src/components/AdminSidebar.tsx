
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Percent, 
  FolderPlus,
  Crown,
  LogOut,
  Home,
  Plus
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isOwner, isOrderManager, isProductsAdder, signOut } = useAuth();

  const isFullAdmin = isAdmin || isOwner;

  const mainItems = [
    ...(isFullAdmin ? [
      { title: 'المنتجات', url: '/admin', icon: Package, id: 'products' },
    ] : []),
    ...(isProductsAdder && !isFullAdmin ? [
      { title: 'إضافة منتجات', url: '/admin', icon: Plus, id: 'products' },
    ] : []),
    { title: 'الطلبات', url: '/admin', icon: BarChart3, id: 'orders' },
    ...(isFullAdmin ? [
      { title: 'المستخدمين', url: '/admin', icon: Users, id: 'users' },
      { title: 'الإحصائيات', url: '/admin', icon: BarChart3, id: 'statistics' },
      { title: 'الخصومات', url: '/admin', icon: Percent, id: 'discounts' },
      { title: 'التقييمات', url: '/admin', icon: MessageSquare, id: 'feedback' },
      { title: 'الإعدادات', url: '/admin', icon: Settings, id: 'settings' },
    ] : []),
  ];

  const handleItemClick = (itemId: string) => {
    navigate(`/admin?tab=${itemId}`);
  };

  const isActive = (itemId: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'products';
    return currentTab === itemId;
  };

  return (
    <Sidebar className="border-r bg-card">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-sm">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">
              {isProductsAdder && !isFullAdmin ? 'إضافة المنتجات' : 
               isOrderManager && !isFullAdmin ? 'إدارة الطلبات' : 'إدارة شاملة'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.id)}
                    isActive={isActive(item.id)}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isOwner && (
          <SidebarGroup>
            <SidebarGroupLabel>صلاحيات المالك</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/owner')}
                    className="w-full justify-start"
                  >
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span>لوحة المالك</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('/app/products')}
              className="w-full justify-start"
            >
              <Home className="w-4 h-4" />
              <span>العودة للتطبيق</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
