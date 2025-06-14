
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import FeedbackForm from '@/components/FeedbackForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  Settings,
  Package,
  ChevronLeft,
  MessageSquare,
  LogOut,
  ExternalLink,
  Star,
  Wrench
} from 'lucide-react';

const MobileAccount = () => {
  const { user, isAdmin, isOwner, isOrderManager, isProductsAdder, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/app/auth');
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل خروجك بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'فشل تسجيل الخروج',
        description: error.message || 'حدث خطأ أثناء تسجيل الخروج',
        variant: 'destructive',
      });
    }
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const hasAdminAccess = isAdmin || isOwner || isOrderManager || isProductsAdder;

  // Show loading state briefly
  if (loading) {
    return (
      <MobileAppLayout title="حسابي" showBackButton={false}>
        <div className="p-4 flex items-center justify-center min-h-32">
          <div className="text-gray-500">جاري التحميل...</div>
        </div>
      </MobileAppLayout>
    );
  }

  // If user is not logged in, show limited options
  if (!user) {
    return (
      <MobileAppLayout title="حسابي" showBackButton={false}>
        <div className="p-4 space-y-6">
          {/* Guest User Section */}
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">مرحباً بك</h2>
            <p className="text-gray-100 text-sm mb-4">
              سجل دخولك للوصول إلى جميع الميزات
            </p>
            <Button 
              onClick={() => navigate('/app/auth')}
              className="bg-white text-gray-700 hover:bg-gray-100"
            >
              تسجيل الدخول
            </Button>
          </div>

          {/* Quick Actions for Guests */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">الإعدادات والمساعدة</h3>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/settings')}
            >
              <Settings className="w-5 h-5 mr-3 text-gray-600" />
              <span>الإعدادات</span>
              <ChevronLeft className="w-4 h-4 mr-auto" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-12 border-orange-200 hover:bg-orange-50"
              onClick={() => {
                // Refresh the page to fix any app issues
                window.location.reload();
              }}
            >
              <Wrench className="w-5 h-5 mr-3 text-orange-600" />
              <span>إصلاح التطبيق</span>
              <ChevronLeft className="w-4 h-4 mr-auto" />
            </Button>
          </div>

          {/* Feedback Section for Guests */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">رأيك يهمنا</h3>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">شاركنا رأيك</h4>
                  <p className="text-sm text-gray-600">ساعدنا في تحسين التطبيق</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                نحن نقدر آراءكم واقتراحاتكم لتطوير التطبيق وتحسين تجربة الاستخدام
              </p>
              <FeedbackForm />
            </div>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  // Logged in user view
  return (
    <MobileAppLayout title="حسابي" showBackButton={false}>
      <div className="p-4 space-y-6">
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم'}
              </h2>
              <p className="text-purple-100 text-sm">
                {user.email}
              </p>
              <div className="flex gap-2 mt-2">
                {isOwner && (
                  <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    مالك
                  </span>
                )}
                {isAdmin && !isOwner && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    مدير
                  </span>
                )}
                {isOrderManager && !isAdmin && !isOwner && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    مدير طلبات
                  </span>
                )}
                {isProductsAdder && !isAdmin && !isOwner && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    مضيف منتجات
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Panel Access */}
        {hasAdminAccess && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">لوحة التحكم</h3>
                  <p className="text-sm text-indigo-100">
                    {isProductsAdder && !isAdmin && !isOwner ? 'إضافة وإدارة المنتجات' :
                     isOrderManager && !isAdmin && !isOwner ? 'إدارة الطلبات' : 'إدارة شاملة للمتجر'}
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleAdminPanel}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                فتح
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">الإجراءات السريعة</h3>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-12"
            onClick={() => navigate('/app/orders')}
          >
            <Package className="w-5 h-5 mr-3 text-blue-600" />
            <span>طلباتي</span>
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-12"
            onClick={() => navigate('/app/settings')}
          >
            <Settings className="w-5 h-5 mr-3 text-gray-600" />
            <span>الإعدادات</span>
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start h-12 border-orange-200 hover:bg-orange-50"
            onClick={() => {
              // Refresh the page to fix any app issues
              window.location.reload();
            }}
          >
            <Wrench className="w-5 h-5 mr-3 text-orange-600" />
            <span>إصلاح التطبيق</span>
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </Button>
        </div>

        {/* Feedback Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">رأيك يهمنا</h3>
          
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">شاركنا رأيك</h4>
                <p className="text-sm text-gray-600">ساعدنا في تحسين التطبيق</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              نحن نقدر آراءكم واقتراحاتكم لتطوير التطبيق وتحسين تجربة الاستخدام
            </p>
            <FeedbackForm />
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-4">
          <Button 
            variant="destructive" 
            className="w-full h-12"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </MobileAppLayout>
  );
};

export default MobileAccount;
