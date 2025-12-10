const EASYSENDSMS_USERNAME = process.env.EASYSENDSMS_USERNAME;
const EASYSENDSMS_PASSWORD = process.env.EASYSENDSMS_PASSWORD;
const EASYSENDSMS_SENDER = process.env.EASYSENDSMS_SENDER || 'Mazoud';

const API_URL = 'https://api.easysendsms.app/bulksms';

export async function sendSMSOTP(phoneNumber: string, code: string): Promise<boolean> {
  if (!EASYSENDSMS_USERNAME || !EASYSENDSMS_PASSWORD) {
    console.error('EasySendSMS credentials not configured');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `رمز التحقق الخاص بك في مزود هو: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق فقط.`;

  try {
    console.log('Sending SMS OTP to:', formattedPhone);

    const params = new URLSearchParams({
      username: EASYSENDSMS_USERNAME,
      password: EASYSENDSMS_PASSWORD,
      to: formattedPhone,
      from: EASYSENDSMS_SENDER,
      text: message,
      type: '1',
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    console.log('EasySendSMS API Response:', response.status, responseText);

    if (responseText.startsWith('OK')) {
      console.log('SMS sent successfully');
      return true;
    }

    const errorCodes: Record<string, string> = {
      '1001': 'معلمات ناقصة',
      '1002': 'اسم مستخدم أو كلمة مرور غير صحيحة',
      '1003': 'نوع الرسالة غير صحيح',
      '1004': 'الرسالة غير صالحة',
      '1005': 'رقم الهاتف غير صحيح',
      '1006': 'اسم المرسل غير صالح',
      '1007': 'رصيد غير كافٍ',
      '1008': 'خطأ داخلي',
      '1009': 'الخدمة غير متوفرة',
    };

    const errorMessage = errorCodes[responseText] || responseText;
    console.error('EasySendSMS error:', errorMessage);
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
