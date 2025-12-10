const WAVERIFY_API_URL = 'https://verify-connect--adnanalhomsi789.replit.app';
const WAVERIFY_API_KEY = process.env.WAVERIFY_API_KEY;

export async function sendWaVerifyOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  if (!WAVERIFY_API_KEY) {
    console.error('WaVerify API key not configured');
    return { success: false, message: 'مفتاح API غير مُعد' };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);

  try {
    console.log('Sending OTP via WaVerify to:', formattedPhone);

    const response = await fetch(`${WAVERIFY_API_URL}/api/v1/request_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVERIFY_API_KEY}`,
        'X-API-Key': WAVERIFY_API_KEY,
      },
      body: JSON.stringify({
        phone: formattedPhone,
      }),
    });

    const responseData = await response.json();
    console.log('WaVerify API Response:', response.status, JSON.stringify(responseData));

    if (response.ok && (responseData.success || responseData.status === 'success')) {
      console.log('OTP sent successfully via WaVerify');
      return { success: true, message: 'تم إرسال رمز التحقق عبر واتساب' };
    }

    const errorMessage = responseData.message || responseData.error || 'فشل في إرسال رمز التحقق';
    console.error('WaVerify error:', errorMessage);
    return { success: false, message: errorMessage };
  } catch (error) {
    console.error('Failed to send OTP via WaVerify:', error);
    return { success: false, message: 'فشل في الاتصال بخدمة التحقق' };
  }
}

export async function verifyWaVerifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
  if (!WAVERIFY_API_KEY) {
    console.error('WaVerify API key not configured');
    return { success: false, message: 'مفتاح API غير مُعد' };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);

  try {
    console.log('Verifying OTP via WaVerify for:', formattedPhone);

    const response = await fetch(`${WAVERIFY_API_URL}/api/v1/verify_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAVERIFY_API_KEY}`,
        'X-API-Key': WAVERIFY_API_KEY,
      },
      body: JSON.stringify({
        phone: formattedPhone,
        otp: otp,
      }),
    });

    const responseData = await response.json();
    console.log('WaVerify Verify Response:', response.status, JSON.stringify(responseData));

    if (response.ok && (responseData.success || responseData.status === 'success' || responseData.verified)) {
      console.log('OTP verified successfully via WaVerify');
      return { success: true, message: 'تم التحقق بنجاح' };
    }

    const errorMessage = responseData.message || responseData.error || 'رمز التحقق غير صحيح';
    console.error('WaVerify verify error:', errorMessage);
    return { success: false, message: errorMessage };
  } catch (error) {
    console.error('Failed to verify OTP via WaVerify:', error);
    return { success: false, message: 'فشل في الاتصال بخدمة التحقق' };
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

  return '+' + cleaned;
}
