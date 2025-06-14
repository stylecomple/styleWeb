
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Sparkles, Grid3X3, Package, Settings, FolderPlus, Layers } from 'lucide-react';
import AddProductForm from './AddProductForm';
import CategoryManager from './CategoryManager';

const MobileDedicatedAdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner, isProductsAdder } = useAuth();
  const [activeView, setActiveView] = useState<'menu' | 'add-product' | 'categories'>('menu');

  const handleBackToApp = () => {
    navigate('/app/products');
  };

  const handleCloseView = () => {
    setActiveView('menu');
  };

  const isFullAdmin = isAdmin || isOwner;

  // Add Product View
  if (activeView === 'add-product') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-purple-100 p-4">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCloseView}
              className="flex items-center gap-2 text-purple-600"
            >
              <ArrowLeft className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              إضافة منتج
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
        
        <div className="p-4 max-w-sm mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
            <AddProductForm onClose={handleCloseView} />
          </div>
        </div>
      </div>
    );
  }

  // Categories Management View
  if (activeView === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-blue-100 p-4">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCloseView}
              className="flex items-center gap-2 text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة الفئات
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
        
        <div className="p-4 max-w-sm mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <CategoryManager />
          </div>
        </div>
      </div>
    );
  }

  // Main Menu View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-purple-100 p-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToApp}
            className="flex items-center gap-2 text-purple-600"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 max-w-sm mx-auto space-y-4">
        {/* Welcome Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 via-pink-600 to-indigo-600">
          <CardContent className="p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-1">مرحباً بك!</h2>
            <p className="text-purple-100 text-sm">
              {isFullAdmin ? 'إدارة سريعة ومبسطة' : 'إضافة منتجات جديدة'}
            </p>
          </CardContent>
        </Card>

        {/* Essential Actions - Main Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Add Product */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
            onClick={() => setActiveView('add-product')}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">إضافة منتج</h3>
                <p className="text-xs text-gray-600">منتج جديد</p>
              </div>
            </CardContent>
          </Card>

          {/* Categories Management */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
            onClick={() => setActiveView('categories')}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Grid3X3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">الفئات</h3>
                <p className="text-xs text-gray-600">إدارة الفئات</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quick Access to Products Management (only for admins) */}
          <Card 
            className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
            onClick={() => navigate('/admin?tab=products')}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">إدارة المنتجات</h3>
                <p className="text-xs text-gray-600">عرض وتعديل</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access to Orders (only for admins) */}
          {(isFullAdmin) && (
            <Card 
              className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
              onClick={() => navigate('/admin?tab=orders')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FolderPlus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">الطلبات</h3>
                  <p className="text-xs text-gray-600">إدارة الطلبات</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings (if space available and user is not full admin) */}
          {!isFullAdmin && (
            <Card 
              className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
              onClick={() => navigate('/admin?tab=settings')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">الإعدادات</h3>
                  <p className="text-xs text-gray-600">إعدادات عامة</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Admin Actions (only for full admins) */}
        {isFullAdmin && (
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
              onClick={() => navigate('/admin?tab=discounts')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">الخصومات</h3>
                  <p className="text-xs text-gray-600">إدارة العروض</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="overflow-hidden border-0 shadow-lg bg-white cursor-pointer transform transition-all duration-200 active:scale-95"
              onClick={() => navigate('/admin?tab=settings')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">الإعدادات</h3>
                  <p className="text-xs text-gray-600">إعدادات المتجر</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Tips */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400">
          <CardContent className="p-3">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
              <Sparkles className="w-3 h-3" />
              نصائح سريعة
            </h3>
            <ul className="text-xs text-amber-700 space-y-1">
              <li className="flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">•</span>
                استخدم صور واضحة وعالية الجودة
              </li>
              <li className="flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">•</span>
                اكتب أوصاف جذابة ومفيدة
              </li>
              <li className="flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">•</span>
                نظم المنتجات في فئات مناسبة
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDedicatedAdminPanel;
