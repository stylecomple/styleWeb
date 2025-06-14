
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    console.log('Received webhook for new order:', record)

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not configured')
      return new Response('Bot token not configured', { status: 500 })
    }

    // Get bot info and chats
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()
    console.log('Bot info:', botInfo)

    // Get updates to find chats/groups where the bot was added
    const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`)
    const updates = await updatesResponse.json()
    console.log('Bot updates:', updates)

    // Extract unique chat IDs from updates
    const chatIds = new Set()
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

    console.log(`Found ${chatIds.size} unique chat IDs:`, Array.from(chatIds))

    if (chatIds.size === 0) {
      console.log('No chats found. Bot needs to be added to a group or receive a message first.')
      return new Response('No chats available', { status: 200 })
    }

    // Format order message
    const message = `🛍️ *طلب جديد وصل!*

📋 *رقم الطلب:* ${record.id}
💰 *المبلغ الإجمالي:* ${record.total_amount.toLocaleString()} د.ع
📱 *رقم الهاتف:* ${record.phone || 'غير محدد'}
🏛️ *المحافظة:* ${record.governorate || 'غير محددة'}
📍 *العنوان:* ${record.shipping_address || 'غير محدد'}
💳 *طريقة الدفع:* ${record.payment_method || 'غير محددة'}
📅 *تاريخ الطلب:* ${new Date(record.created_at).toLocaleString('ar-IQ')}

✅ يرجى مراجعة لوحة الإدارة لمعالجة الطلب`

    // Send message to all available chats
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
        console.log(`Message sent to chat ${chatId}:`, result)
        return { chatId, success: result.ok, result }
      } catch (error) {
        console.error(`Failed to send message to chat ${chatId}:`, error)
        return { chatId, success: false, error: error.message }
      }
    })

    const results = await Promise.allSettled(sendPromises)
    console.log('Send results:', results)

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Order notification sent to ${successCount}/${chatIds.size} chats`,
        chatIds: Array.from(chatIds),
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in telegram-bot function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
