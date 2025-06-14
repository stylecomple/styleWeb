
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()
    
    if (!orderId) {
      throw new Error('Order ID is required')
    }

    // Get order details with enhanced information
    const orderResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/orders?id=eq.${orderId}&select=*`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    })

    const orders = await orderResponse.json()
    if (!orders || orders.length === 0) {
      throw new Error('Order not found')
    }

    const order = orders[0]

    // Get order items with product details
    const orderItemsResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/order_items?order_id=eq.${orderId}&select=*`, 
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        }
      }
    )

    const orderItems = await orderItemsResponse.json()

    // Get products details
    const productIds = orderItems.map((item: any) => item.product_id)
    const productsResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/products?id=in.(${productIds.join(',')})&select=*`, 
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        }
      }
    )

    const products = await productsResponse.json()

    // Get categories
    const categoriesResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/categories?select=*`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    })

    const categories = await categoriesResponse.json()

    // Get subcategories
    const subcategoriesResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/subcategories?select=*`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }
    })

    const subcategories = await subcategoriesResponse.json()

    // Get user profile
    const userResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?id=eq.${order.user_id}&select=*`, 
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        }
      }
    )

    const userProfiles = await userResponse.json()
    const userProfile = userProfiles?.[0]

    // Helper functions
    const getCategoryName = (categoryId: string) => {
      const category = categories.find((c: any) => c.id === categoryId)
      return category ? `${category.icon} ${category.name}` : categoryId
    }

    const getSubcategoryName = (subcategoryId: string) => {
      const subcategory = subcategories.find((s: any) => s.id === subcategoryId)
      return subcategory ? `${subcategory.icon} ${subcategory.name}` : subcategoryId
    }

    const formatPrice = (price: number) => {
      return `${price.toLocaleString('ar-IQ')} د.ع`
    }

    // Build enhanced message
    let message = `🛍️ *طلب جديد - متجر ستايل العامرية*\n\n`
    message += `📋 *رقم الطلب:* #${order.id.slice(-8)}\n`
    message += `👤 *العميل:* ${userProfile?.full_name || 'غير محدد'}\n`
    message += `📧 *البريد:* ${userProfile?.email || 'غير محدد'}\n`
    message += `📱 *الهاتف:* ${order.phone}\n`
    message += `🏙️ *المحافظة:* ${order.governorate}\n`
    message += `📍 *العنوان:* ${order.shipping_address}\n`
    message += `💳 *طريقة الدفع:* ${order.payment_method}\n`
    message += `⏰ *التاريخ:* ${new Date(order.created_at).toLocaleDateString('ar')}\n\n`

    message += `📦 *المنتجات المطلوبة:*\n`

    for (const item of orderItems) {
      const product = products.find((p: any) => p.id === item.product_id)
      if (product) {
        message += `\n• *${product.name}*\n`
        
        // Categories
        if (product.categories && product.categories.length > 0) {
          message += `  📂 الفئات: ${product.categories.map(getCategoryName).join(', ')}\n`
        }
        
        // Subcategories
        if (product.subcategories && product.subcategories.length > 0) {
          message += `  📁 الفئات الفرعية: ${product.subcategories.map(getSubcategoryName).join(', ')}\n`
        }
        
        // Selected option
        if (item.selected_color) {
          message += `  🎨 الخيار: ${item.selected_color}\n`
        }
        
        message += `  📊 الكمية: ${item.quantity}\n`
        message += `  💰 السعر: ${formatPrice(item.price)}\n`
        message += `  🧮 المجموع: ${formatPrice(item.price * item.quantity)}\n`
      }
    }

    message += `\n💵 *الإجمالي الكلي:* ${formatPrice(order.total_amount)}\n`
    message += `\n🔗 *رابط لوحة التحكم:* ${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/admin`

    // Send to Telegram
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = '@style_alamariya_orders'

    if (telegramToken) {
      // Send text message first
      const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      })

      // Send product images
      for (const item of orderItems) {
        const product = products.find((p: any) => p.id === item.product_id)
        if (product && product.cover_image) {
          try {
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendPhoto`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                photo: product.cover_image,
                caption: `📸 صورة المنتج: ${product.name}`,
              }),
            })
          } catch (imageError) {
            console.error('Error sending product image:', imageError)
          }
        }
      }

      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramResponse.statusText}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Enhanced order notification sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
