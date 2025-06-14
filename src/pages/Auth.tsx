
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAppLogo } from '@/hooks/useAppLogo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { logoUrl } = useAppLogo();
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في متجر ستايل"
          });
          // Navigation will happen automatically via useEffect when user state updates
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "تحقق من بريدك الإلكتروني لتأكيد الحساب"
          });
          // Reset form after successful signup
          setEmail('');
          setPassword('');
          setFullName('');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message || "حاول مرة أخرى لاحقاً",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* App Logo */}
          <div className="relative mx-auto mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30"></div>
            <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <img 
                src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                alt="Style" 
                className="w-14 h-14 object-contain rounded-full"
              />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-pink-600">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'ادخل بياناتك للوصول إلى حسابك' : 'أنشئ حساباً جديداً للتسوق'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="ادخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="ادخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="ادخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={loading}
            >
              {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-pink-600"
            >
              {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل الدخول'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
