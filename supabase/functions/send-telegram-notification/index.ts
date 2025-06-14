
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()
    console.log('Sending Telegram notification for order ID:', orderId)

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not configured')
      return new Response('Bot token not configured', { status: 500 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        phone,
        governorate,
        shipping_address,
        payment_method,
        created_at,
        order_items (
          quantity,
          price,
          selected_color,
          products (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order:', orderError)
      return new Response('Order not found', { status: 404 })
    }

    // Try multiple methods to get chat IDs
    const chatIds = new Set()

    // Method 1: Get updates to find chats
    try {
      const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`)
      const updates = await updatesResponse.json()
      
      if (updates.ok && updates.result) {
        updates.result.forEach((update: any) => {
          if (update.message?.chat?.id) {
            chatIds.add(update.message.chat.id)
          }
          if (update.my_chat_member?.chat?.id) {
            chatIds.add(update.my_chat_member.chat.id)
          }
        })
      }
    } catch (error) {
      console.error('Error getting updates:', error)
    }

    // Method 2: Try hardcoded chat IDs (add your group IDs here)
    const knownChatIds = [
      // Add your group chat IDs here - you can get them by messaging the bot in the group
      // Example: -1001234567890
    ]
    knownChatIds.forEach(id => chatIds.add(id))

    console.log(`Found ${chatIds.size} chat IDs for notification`)

    // If no chats found, try to get chat ID from bot info
    if (chatIds.size === 0) {
      try {
        const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
        const botInfo = await botInfoResponse.json()
        console.log('Bot info:', botInfo)
        
        // Log instructions for setup
        console.log('No chats found. To set up notifications:')
        console.log('1. Add the bot to your group/channel')
        console.log('2. Send a message to the bot or interact with it')
        console.log('3. Check the logs for chat IDs')
        
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'No chats available. Bot needs to be added to groups and receive messages first.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Error getting bot info:', error)
      }
    }

    // Format order items
    const itemsText = order.order_items.map((item: any) => 
      `• ${item.products.name} ${item.selected_color ? `(${item.selected_color})` : ''} - الكمية: ${item.quantity} - السعر: ${item.price.toLocaleString()} د.ع`
    ).join('\n')

    const message = `🛍️ *طلب جديد وصل!*

📋 *رقم الطلب:* \`${order.id}\`
💰 *المبلغ الإجمالي:* ${order.total_amount?.toLocaleString()} د.ع
📱 *رقم الهاتف:* ${order.phone || 'غير محدد'}
🏛️ *المحافظة:* ${order.governorate || 'غير محددة'}
📍 *العنوان:* ${order.shipping_address || 'غير محدد'}
💳 *طريقة الدفع:* ${order.payment_method || 'غير محددة'}
📅 *تاريخ الطلب:* ${new Date(order.created_at || Date.now()).toLocaleString('ar-IQ')}

🛒 *المنتجات:*
${itemsText}

✅ يرجى مراجعة لوحة الإدارة لمعالجة الطلب`

    // Send to all available chats
    const sendPromises = Array.from(chatIds).map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        })

        const result = await response.json()
        console.log(`Notification sent to chat ${chatId}:`, result.ok)
        
        if (!result.ok) {
          console.error(`Error sending to chat ${chatId}:`, result)
        }
        
        return result.ok
      } catch (error) {
        console.error(`Failed to send to chat ${chatId}:`, error)
        return false
      }
    })

    const results = await Promise.allSettled(sendPromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${successCount}/${chatIds.size} chats`,
        chatIds: Array.from(chatIds)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
