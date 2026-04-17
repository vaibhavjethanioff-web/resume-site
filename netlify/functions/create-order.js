// create-order.js
// Creates a Razorpay order on the server.
// The order ID is passed to the Razorpay checkout on the frontend.
// Amount is always taken from the server env/config — never trusted from client.

const Razorpay = require('razorpay');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Fixed price in rupees — set this on the server, not the client.
const SESSION_PRICE_INR = 199;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Razorpay expects amount in smallest currency unit (paise for INR)
    // ₹199 = 19900 paise
    const order = await razorpay.orders.create({
      amount:   SESSION_PRICE_INR * 100,
      currency: 'INR',
      receipt:  'receipt_' + Date.now(),
      notes:    { service: 'Resume Strategy Session — 30 min' }
    });

    return json(200, {
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency
    });

  } catch (err) {
    console.error('[create-order]', err.message);
    return json(500, { error: err.message || 'Failed to create payment order.' });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}
