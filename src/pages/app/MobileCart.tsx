
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppLayout from '@/components/MobileAppLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const MobileCart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-remove Lovable badge
  useEffect(() => {
    const removeBadge = () => {
      const badge = document.getElementById("lovable-badge");
      if (badge) {
        badge.remove();
      }
    };

    // Try immediately
    removeBadge();

    // Also try after a short delay in case badge loads later
    const timer = setTimeout(removeBadge, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleQuantityChange = (id: string, quantity: number, selectedOption?: string | null) => {
    if (quantity <= 0) {
      removeFromCart(id, selectedOption);
    } else {
      updateQuantity(id, quantity, selectedOption);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/app/auth');
      return;
    }
    navigate('/app/payment');
  };

  if (items.length === 0) {
    return (
      <MobileAppLayout title={`السلة (${getTotalItems()})`} showBackButton={false}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">السلة فارغة</h2>
            <p className="text-gray-500 mb-6">ابدأ بإضافة منتجات إلى سلتك</p>
            <Button 
              onClick={() => navigate('/app/products')}
              className="bg-pink-600 hover:bg-pink-700"
            >
              تصفح المنتجات
            </Button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout title={`السلة (${getTotalItems()})`} showBackButton={false}>
      <div className="p-4 space-y-4 pb-24">
        {/* Cart Items */}
        {items.map((item) => (
          <Card key={`${item.id}-${item.selectedOption || item.selectedColor || 'default'}`}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  {item.selectedOption && (
                    <p className="text-xs text-gray-600 mb-1">{item.selectedOption}</p>
                  )}
                  <p className="text-sm font-bold text-pink-600">
                    {item.price.toLocaleString()} د.ع
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.selectedOption)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.selectedOption)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id, item.selectedOption)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Total */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>المجموع الكلي</span>
              <span className="text-pink-600">{getTotalPrice().toLocaleString()} د.ع</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Button */}
        <Button 
          onClick={handleCheckout}
          className="w-full bg-pink-600 hover:bg-pink-700 py-3 text-lg font-semibold"
        >
          متابعة للدفع
        </Button>
      </div>
    </MobileAppLayout>
  );
};

export default MobileCart;
