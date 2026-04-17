// send-otp.js
// Generates a 6-digit OTP, signs it with HMAC (stateless — no DB needed),
// and sends it to the user's phone via Fast2SMS.
//
// The HMAC token is returned to the client and verified in verify-otp.js.
// This avoids any server-side storage while still being secure.

const crypto = require('crypto');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    const { phone } = JSON.parse(event.body || '{}');

    // Validate Indian mobile number (starts with 6–9, 10 digits)
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return json(400, { error: 'Invalid phone number. Must be a 10-digit Indian mobile number.' });
    }

    // Generate 6-digit OTP
    const otp    = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 5 * 60 * 1000; // expires in 5 minutes

    // Sign: HMAC-SHA256(phone:otp:expiry, OTP_SECRET)
    // The client stores this token and sends it back during verification.
    const payload = `${phone}:${otp}:${expiry}`;
    const token   = crypto
      .createHmac('sha256', process.env.OTP_SECRET)
      .update(payload)
      .digest('hex');

    // Send OTP via Fast2SMS DLT SMS API (after website verification)
    const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization:  process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route:           'dlt',           // DLT route (required for compliance)
        sender_id:       process.env.DLT_SENDER_ID || 'your_sender_id', // Get from DLT registration
        message:         `Your OTP for resume booking is: ${otp}. Valid for 5 minutes.`, // Exact message from DLT template
        variables_values: otp,
        numbers:          phone
      })
    });

    const smsData = await smsRes.json();

    // Fast2SMS returns { return: true, ... } on success
    if (!smsData.return) {
      const errMsg = Array.isArray(smsData.message)
        ? smsData.message.join(', ')
        : (smsData.message || 'SMS delivery failed');
      throw new Error(errMsg);
    }

    return json(200, { success: true, token, expiry });

  } catch (err) {
    console.error('[send-otp]', err.message);
    return json(500, { error: err.message || 'Failed to send OTP. Please try again.' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
