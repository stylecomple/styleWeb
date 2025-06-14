
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { paymentMethod, paymentData, orderData } = await req.json();

    console.log('Processing payment:', { paymentMethod, orderId: orderData.orderId, amount: orderData.totalAmount });

    // Get admin payment configurations
    const { data: adminSettings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('visa_card_config, zain_cash_config')
      .single();

    if (settingsError) {
      console.error('Error fetching admin settings:', settingsError);
      return new Response(
        JSON.stringify({ success: false, message: 'Configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment method is enabled
    if (paymentMethod === 'visa_card' && !adminSettings.visa_card_config?.enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Visa Card payment is not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (paymentMethod === 'zain_cash' && !adminSettings.zain_cash_config?.enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Zain Cash payment is not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security validations
    const currentTime = new Date();
    const paymentTime = new Date(paymentData.timestamp);
    const timeDiff = Math.abs(currentTime.getTime() - paymentTime.getTime());
    
    // Reject requests older than 5 minutes (replay attack protection)
    if (timeDiff > 5 * 60 * 1000) {
      console.log('Payment request expired');
      return new Response(
        JSON.stringify({ success: false, message: 'Payment request expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate order exists and is pending
    const { data: existingOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total_amount')
      .eq('id', orderData.orderId)
      .single();

    if (orderError || !existingOrder) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingOrder.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, message: 'Order already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount matches
    if (Math.abs(existingOrder.total_amount - orderData.totalAmount) > 0.01) {
      console.error('Amount mismatch:', { expected: existingOrder.total_amount, received: orderData.totalAmount });
      return new Response(
        JSON.stringify({ success: false, message: 'Amount mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paymentResult = { success: false, transactionId: null };

    // Process payment based on method
    if (paymentMethod === 'visa_card') {
      paymentResult = await processVisaCardPayment(paymentData, orderData, adminSettings.visa_card_config);
    } else if (paymentMethod === 'zain_cash') {
      paymentResult = await processZainCashPayment(paymentData, orderData, adminSettings.zain_cash_config);
    }

    if (paymentResult.success) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          JSON.stringify({ success: false, message: 'Payment successful but order update failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment processed successfully:', { orderId: orderData.orderId, transactionId: paymentResult.transactionId });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          transactionId: paymentResult.transactionId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Payment failed:', paymentResult);
      return new Response(
        JSON.stringify({ success: false, message: 'Payment failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processVisaCardPayment(paymentData: any, orderData: any, config: any) {
  console.log('Processing Visa Card payment...');
  
  // Enhanced validation for Visa Card
  if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
    console.log('Missing required Visa card data');
    return { success: false, transactionId: null };
  }

  // Validate card number format
  const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
  if (cardNumber.length < 16 || !/^\d+$/.test(cardNumber)) {
    console.log('Invalid card number format');
    return { success: false, transactionId: null };
  }

  // Validate expiry date format (MM/YY)
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(paymentData.expiryDate)) {
    console.log('Invalid expiry date format');
    return { success: false, transactionId: null };
  }

  // Check if card is not expired
  const [month, year] = paymentData.expiryDate.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const currentDate = new Date();
  if (expiryDate < currentDate) {
    console.log('Card is expired');
    return { success: false, transactionId: null };
  }

  // Validate CVV (3 or 4 digits)
  if (!/^\d{3,4}$/.test(paymentData.cvv)) {
    console.log('Invalid CVV format');
    return { success: false, transactionId: null };
  }

  // Simulate payment gateway integration
  // In a real implementation, you would:
  // 1. Call the actual Visa/Mastercard payment gateway API
  // 2. Use the merchant_id, api_key, and secret_key from config
  // 3. Handle real payment processing, balance checking, and money transfer
  
  try {
    // Simulate API call to payment gateway
    console.log('Calling Visa payment gateway with config:', {
      merchant_id: config.merchant_id,
      amount: orderData.totalAmount,
      currency: 'IQD'
    });

    // Simulate successful payment processing
    // Replace this with actual payment gateway integration
    const simulatedResponse = {
      status: 'approved',
      transaction_id: `visa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorization_code: `AUTH${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount_charged: orderData.totalAmount
    };

    if (simulatedResponse.status === 'approved') {
      console.log('Visa payment approved:', simulatedResponse.transaction_id);
      return { 
        success: true, 
        transactionId: simulatedResponse.transaction_id,
        authCode: simulatedResponse.authorization_code
      };
    } else {
      console.log('Visa payment declined');
      return { success: false, transactionId: null };
    }

  } catch (error) {
    console.error('Visa payment processing error:', error);
    return { success: false, transactionId: null };
  }
}

async function processZainCashPayment(paymentData: any, orderData: any, config: any) {
  console.log('Processing Zain Cash payment...');
  
  // Enhanced validation for Zain Cash
  if (!paymentData.phoneNumber || !paymentData.pin) {
    console.log('Missing required Zain Cash data');
    return { success: false, transactionId: null };
  }

  // Validate Iraqi phone number format
  const phoneNumber = paymentData.phoneNumber;
  if (!/^07\d{9}$/.test(phoneNumber)) {
    console.log('Invalid Iraqi phone number format');
    return { success: false, transactionId: null };
  }

  // Validate PIN format (4-6 digits)
  if (!/^\d{4,6}$/.test(paymentData.pin)) {
    console.log('Invalid PIN format');
    return { success: false, transactionId: null };
  }

  // Simulate Zain Cash API integration
  // In a real implementation, you would:
  // 1. Call the actual Zain Cash payment API
  // 2. Use the merchant_number, api_key, and secret_key from config
  // 3. Check user balance, validate PIN, and process money transfer
  
  try {
    // Simulate API call to Zain Cash
    console.log('Calling Zain Cash API with config:', {
      merchant_number: config.merchant_number,
      amount: orderData.totalAmount,
      currency: 'IQD',
      customer_phone: phoneNumber
    });

    // Simulate balance and PIN verification
    // Replace this with actual Zain Cash API integration
    const simulatedResponse = {
      status: 'success',
      transaction_id: `zain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      balance_sufficient: true,
      pin_verified: true,
      amount_transferred: orderData.totalAmount,
      merchant_balance: orderData.totalAmount // Amount received by merchant
    };

    if (simulatedResponse.status === 'success' && 
        simulatedResponse.balance_sufficient && 
        simulatedResponse.pin_verified) {
      console.log('Zain Cash payment successful:', simulatedResponse.transaction_id);
      return { 
        success: true, 
        transactionId: simulatedResponse.transaction_id,
        merchantBalance: simulatedResponse.merchant_balance
      };
    } else {
      if (!simulatedResponse.balance_sufficient) {
        console.log('Insufficient balance in Zain Cash account');
      }
      if (!simulatedResponse.pin_verified) {
        console.log('Invalid Zain Cash PIN');
      }
      return { success: false, transactionId: null };
    }

  } catch (error) {
    console.error('Zain Cash processing error:', error);
    return { success: false, transactionId: null };
  }
}
