
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, User, Phone, MapPin, Save, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'دهوك', 
  'السليمانية', 'كركوك', 'ديالى', 'صلاح الدين', 'القادسية', 'بابل', 'واسط', 
  'ميسان', 'ذي قار', 'المثنى'
];

const MobileSettings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const { toast } = useToast();

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    governorate: ''
  });

  // Load saved user data on component mount only if user exists
  useEffect(() => {
    if (user) {
      setUserInfo({
        fullName: user.user_metadata?.full_name || localStorage.getItem('user-fullname') || '',
        phone: localStorage.getItem('user-phone') || '',
        governorate: localStorage.getItem('user-governorate') || ''
      });
    }
  }, [user]);

  const handleSaveSettings = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول لحفظ المعلومات الشخصية",
        variant: "destructive",
      });
      return;
    }

    // Save user info to localStorage
    localStorage.setItem('user-fullname', userInfo.fullName);
    localStorage.setItem('user-phone', userInfo.phone);
    localStorage.setItem('user-governorate', userInfo.governorate);

    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ معلوماتك بنجاح",
    });
  };

  const handleResetApp = () => {
    // Clear cache
    localStorage.removeItem('style_app_cache');
    
    // Show success message
    toast({
      title: "تم إصلاح التطبيق",
      description: "سيتم إعادة تحميل التطبيق...",
    });
    
    // Navigate to the correct splash screen route
    setTimeout(() => {
      navigate('/app');
    }, 1000);
  };

  return (
    <MobileAppLayout title="الإعدادات" showBackButton={true}>
      <div className="p-4 space-y-6">
        {/* Theme Settings - Always available */}
        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              مظهر التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>الوضع الليلي</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {theme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري'}
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-pink-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Information - Only show if logged in */}
        {user && (
          <Card className={`${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <User className="w-5 h-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName" className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User className={`absolute right-3 top-3 h-4 w-4 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <Input
                    id="fullName"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    className={`pr-10 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  رقم الهاتف
                </Label>
                <div className="relative">
                  <Phone className={`absolute right-3 top-3 h-4 w-4 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="07XXXXXXXXX"
                    className={`pr-10 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="governorate" className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  المحافظة
                </Label>
                <div className="relative">
                  <MapPin className={`absolute right-3 top-3 h-4 w-4 z-10 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <Select
                    value={userInfo.governorate}
                    onValueChange={(value) => setUserInfo(prev => ({ ...prev, governorate: value }))}
                  >
                    <SelectTrigger className={`pr-10 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent className={`${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-200'
                    }`}>
                      {GOVERNORATES.map((gov) => (
                        <SelectItem 
                          key={gov} 
                          value={gov}
                          className={`${
                            theme === 'dark'
                              ? 'text-white hover:bg-gray-700 focus:bg-gray-700'
                              : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
                          }`}
                        >
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Guest Message - Only show if not logged in */}
        {!user && !loading && (
          <Card className={`${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <User className="w-5 h-5" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                سجل دخولك لإدارة معلوماتك الشخصية
              </p>
              <Button
                onClick={() => navigate('/app/auth')}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Fix App Section - Always available */}
        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <SettingsIcon className="w-5 h-5" />
              إصلاح التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              سيتم مسح جميع البيانات المخزنة وإعادة تحميل التطبيق من البداية
            </p>
            <Button
              onClick={handleResetApp}
              variant="destructive"
              className="w-full"
            >
              إصلاح التطبيق
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileAppLayout>
  );
};

export default MobileSettings;
