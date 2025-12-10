// SMS.to API for Syria (supports Syriatel and MTN)
const SMSTO_API_KEY = process.env.SMSTO_API_KEY;
const SMSTO_SENDER = process.env.SMSTO_SENDER || 'Mazoud';

const SMSTO_API_URL = 'https://api.sms.to/sms/send';

export async function sendSMSOTP(phoneNumber: string, code: string): Promise<boolean> {
  if (!SMSTO_API_KEY) {
    console.error('SMS.to API key not configured');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `رمز التحقق الخاص بك في مزود هو: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق فقط.`;

  try {
    console.log('Sending SMS OTP via SMS.to to:', formattedPhone);

    const response = await fetch(SMSTO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SMSTO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+' + formattedPhone,
        sender_id: SMSTO_SENDER,
        message: message,
      }),
    });

    const responseData = await response.json();
    console.log('SMS.to API Response:', response.status, JSON.stringify(responseData));

    if (response.ok && responseData.success) {
      console.log('SMS sent successfully via SMS.to');
      return true;
    }

    console.error('SMS.to error:', responseData.message || responseData.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Failed to send SMS via SMS.to:', error);
    return false;
  }
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  if (cleaned.startsWith('0')) {
    cleaned = '963' + cleaned.substring(1);
  }

  if (!cleaned.startsWith('963')) {
    cleaned = '963' + cleaned;
  }

  return cleaned;
}

export { generateOTPCode } from './whatsapp';
