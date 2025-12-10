const EASYSENDSMS_API_KEY = process.env.EASYSENDSMS_API_KEY;
const EASYSENDSMS_SENDER = process.env.EASYSENDSMS_SENDER || 'Mazoud';

const REST_API_URL = 'https://restapi.easysendsms.app/v1/rest/sms/send';

export async function sendSMSOTP(phoneNumber: string, code: string): Promise<boolean> {
  if (!EASYSENDSMS_API_KEY) {
    console.error('EasySendSMS API key not configured');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `رمز التحقق الخاص بك في مزود هو: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق فقط.`;

  try {
    console.log('Sending SMS OTP to:', formattedPhone);

    const response = await fetch(REST_API_URL, {
      method: 'POST',
      headers: {
        'apikey': EASYSENDSMS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: EASYSENDSMS_SENDER,
        to: formattedPhone,
        text: message,
        type: '1', // Unicode for Arabic
      }),
    });

    const responseData = await response.json();
    console.log('EasySendSMS REST API Response:', response.status, JSON.stringify(responseData));

    if (response.ok && responseData.status === 'success') {
      console.log('SMS sent successfully');
      return true;
    }

    console.error('EasySendSMS error:', responseData.message || responseData.error || 'Unknown error');
    return false;
  } catch (error) {
    console.error('Failed to send SMS:', error);
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
