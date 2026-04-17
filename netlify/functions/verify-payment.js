// verify-payment.js
// Verifies that a Razorpay payment is genuine by checking the
// HMAC-SHA256 signature using your Razorpay Key Secret.
//
// Razorpay signature algorithm:
//   signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
//
// If the signature does not match, the payment must be rejected —
// it means someone tampered with the response.

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = JSON.parse(event.body || '{}');

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json(400, { error: 'Missing payment details.' });
    }

    // Recompute the expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const provided = Buffer.from(razorpay_signature, 'hex');
    const expected = Buffer.from(expectedSig,         'hex');

    let valid = false;
    try {
      valid = provided.length === expected.length &&
              crypto.timingSafeEqual(provided, expected);
    } catch {
      valid = false;
    }

    if (!valid) {
      console.error('[verify-payment] Signature mismatch', {
        order: razorpay_order_id,
        payment: razorpay_payment_id
      });
      return json(400, { error: 'Payment verification failed. Signature mismatch.' });
    }

    return json(200, { verified: true, paymentId: razorpay_payment_id });

  } catch (err) {
    console.error('[verify-payment]', err.message);
    return json(500, { error: 'Payment verification error.' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
