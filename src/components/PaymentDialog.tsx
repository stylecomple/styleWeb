
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/types';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
  orderData: { orderId: string; totalAmount: number; items: any[] } | null;
  onPaymentSuccess: () => void;
}

const PaymentDialog = ({ isOpen, onClose, paymentMethod, orderData, onPaymentSuccess }: PaymentDialogProps) => {
  // This component is now only used for cash on delivery orders
  // All electronic payment processing has been removed
  return null;
};

export default PaymentDialog;
