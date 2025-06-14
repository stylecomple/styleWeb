
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MobileDedicatedAdminPanel from './MobileDedicatedAdminPanel';

const MobileAdminPanel = () => {
  const { isAdmin, isOwner, isOrderManager, isProductsAdder } = useAuth();

  // Check if user has admin permissions
  const hasAdminAccess = isAdmin || isOwner || isOrderManager || isProductsAdder;

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">غير مصرح</h1>
          <p className="text-red-500">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  // Always show the dedicated mobile panel
  return <MobileDedicatedAdminPanel />;
};

export default MobileAdminPanel;
