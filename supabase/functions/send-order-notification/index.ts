
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: OrderNotificationRequest = await req.json();

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get admin settings to find email receiver
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('email_receiver')
      .single();

    if (!settings?.email_receiver) {
      throw new Error('No email receiver configured');
    }

    // Get order details with items and products
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          product_id,
          products (name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new Error('Order not found');
    }

    // Format order items for email
    const itemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.products.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price} ر.س</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.price).toFixed(2)} ر.س</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h1 style="color: #e91e63; text-align: center;">طلب جديد - ستايل العامرية</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">تفاصيل الطلب</h2>
          <p><strong>رقم الطلب:</strong> ${orderId.slice(0, 8)}...</p>
          <p><strong>التاريخ:</strong> ${new Date(order.created_at).toLocaleString('ar-SA')}</p>
          <p><strong>المبلغ الإجمالي:</strong> ${order.total_amount} ر.س</p>
          <p><strong>حالة الطلب:</strong> ${order.status}</p>
          ${order.phone ? `<p><strong>رقم الهاتف:</strong> ${order.phone}</p>` : ''}
          ${order.shipping_address ? `<p><strong>عنوان التوصيل:</strong> ${order.shipping_address}</p>` : ''}
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #333;">عناصر الطلب:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #e91e63; color: white;">
                <th style="padding: 12px; text-align: right;">المنتج</th>
                <th style="padding: 12px; text-align: center;">الكمية</th>
                <th style="padding: 12px; text-align: right;">السعر</th>
                <th style="padding: 12px; text-align: right;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; text-align: center; color: #1976d2;">
            <strong>المبلغ الإجمالي: ${order.total_amount} ر.س</strong>
          </p>
        </div>

        <p style="text-align: center; color: #666; margin-top: 30px; font-size: 14px;">
          تم إرسال هذا الإشعار تلقائياً من نظام ستايل العامرية
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ستايل العامرية <orders@resend.dev>",
      to: [settings.email_receiver],
      subject: `طلب جديد #${orderId.slice(0, 8)} - ستايل العامرية`,
      html: emailHtml,
    });

    console.log("Order notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
