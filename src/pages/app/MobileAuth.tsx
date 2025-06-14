
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Eye, EyeOff, Sparkles, Heart } from 'lucide-react';
import { useAppLogo } from '@/hooks/useAppLogo';

const MobileAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logoUrl } = useAppLogo();
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app/products');
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

  const handleSkip = () => {
    navigate('/app/products');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header with app logo */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-gray-600 flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          تخطي
        </Button>
        
        {/* App Logo in Header */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30"></div>
            <div className="relative w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <img 
                src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                alt="Style" 
                className="w-7 h-7 object-contain rounded-full"
              />
            </div>
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Style
          </span>
        </div>
        
        <div className="w-16"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            {/* Animated main logo */}
            <div className="relative mx-auto mb-4">
              <div className="absolute -inset-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce-gentle">
                <img 
                  src={logoUrl || "/lovable-uploads/44d2a604-8d2c-498a-9c37-e89e541a86cb.png"} 
                  alt="Style" 
                  className="w-16 h-16 object-contain rounded-full"
                />
              </div>
              {/* Floating icons */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce delay-100" />
              <Heart className="absolute -bottom-2 -left-2 w-5 h-5 text-pink-500 animate-bounce delay-300" />
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Style
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isLogin ? 'ادخل بياناتك للوصول إلى حسابك' : 'أنشئ حساباً جديداً للتسوق'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="ادخل اسمك الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    dir="rtl"
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ادخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ادخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    className="h-12 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-10 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري التحميل...
                  </div>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-600 font-medium hover:text-purple-600 transition-colors"
              >
                {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل الدخول'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileAuth;
