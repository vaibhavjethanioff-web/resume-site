// verify-otp.js
// Verifies the OTP by recomputing the HMAC and comparing it
// with the token that was issued in send-otp.js.
//
// No database needed — security relies on the HMAC secret (OTP_SECRET).
// Uses timingSafeEqual to prevent timing-based attacks.

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
    const { phone, otp, token, expiry } = JSON.parse(event.body || '{}');

    if (!phone || !otp || !token || !expiry) {
      return json(400, { error: 'Missing required fields.' });
    }

    // Check expiry first (fast path)
    if (Date.now() > parseInt(expiry, 10)) {
      return json(400, { error: 'OTP has expired. Please request a new one.' });
    }

    // Recompute HMAC and compare using constant-time comparison
    const payload       = `${phone}:${otp}:${expiry}`;
    const expectedToken = crypto
      .createHmac('sha256', process.env.OTP_SECRET)
      .update(payload)
      .digest('hex');

    // Ensure both buffers are same length before timingSafeEqual
    let valid = false;
    try {
      const a = Buffer.from(token,         'hex');
      const b = Buffer.from(expectedToken, 'hex');
      valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      valid = false;
    }

    if (!valid) {
      return json(400, { error: 'Incorrect OTP. Please try again.' });
    }

    return json(200, { verified: true });

  } catch (err) {
    console.error('[verify-otp]', err.message);
    return json(500, { error: 'Verification error. Please try again.' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
