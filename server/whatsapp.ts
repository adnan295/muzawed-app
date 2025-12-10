const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_VERSION = 'v21.0';

interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

export async function sendWhatsAppOTP(phoneNumber: string, code: string): Promise<boolean> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp credentials not configured');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const messageBody = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: `🔐 رمز التحقق الخاص بك في مزود هو: *${code}*\n\nهذا الرمز صالح لمدة 5 دقائق فقط.\n\nإذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return false;
    }

    const data: WhatsAppMessageResponse = await response.json();
    console.log('WhatsApp message sent successfully:', data.messages[0].id);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '963' + cleaned.substring(1);
  }
  
  if (!cleaned.startsWith('963')) {
    cleaned = '963' + cleaned;
  }
  
  return cleaned;
}

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
