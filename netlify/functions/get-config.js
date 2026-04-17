// get-config.js
// Returns public config values to the frontend.
// The Razorpay KEY ID is public (not secret) but we keep it
// out of client source code by serving it from here.

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
    })
  };
};
