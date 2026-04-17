// book-session.js
// Called after payment is verified. Does three things:
//   1. Creates a Google Calendar event on your personal calendar
//   2. Sends a confirmation email to the client
//   3. Sends a booking notification email to you

const { google }    = require('googleapis');
const nodemailer    = require('nodemailer');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Map slot labels (from CONFIG.availableSlots) to IST hour ranges.
// Add or edit entries here if you change your available slots in config.js.
const SLOT_HOURS = {
  'Mon–Fri, 9–10 AM':  { start: 9,  end: 10 },
  'Mon–Fri, 12–1 PM':  { start: 12, end: 13 },
  'Mon–Fri, 6–7 PM':   { start: 18, end: 19 },
  'Sat, 10 AM–12 PM':  { start: 10, end: 12 },
  'Sat, 3–5 PM':       { start: 15, end: 17 }
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, phone, date, slot, paymentId, orderId } =
      JSON.parse(event.body || '{}');

    if (!name || !email || !phone || !date || !slot || !paymentId) {
      return json(400, { error: 'Missing required booking fields.' });
    }

    // ── Build start/end Date objects in IST ──────────────────────
    const hours = SLOT_HOURS[slot] || { start: 9, end: 10 };

    // date is "YYYY-MM-DD"; we append the IST offset so it's not treated as UTC
    const startISO = `${date}T${pad(hours.start)}:00:00+05:30`;
    const endISO   = `${date}T${pad(hours.end)}:00:00+05:30`;

    const niceDate = new Date(startISO).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    // ── 1. Google Calendar ───────────────────────────────────────
    let calendarLink = '';
    try {
      // Authenticate with a service account (JSON key stored in env vars)
      const auth = new google.auth.JWT({
        email:  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // In .env the newlines are stored as \n literals — convert them back
        key:    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const calEvent = await calendar.events.insert({
        calendarId:  process.env.MY_CALENDAR_ID,
        sendUpdates: 'all', // Google sends invite email to attendees
        requestBody: {
          summary: `Resume Session — ${name}`,
          description: [
            `Client  : ${name}`,
            `Phone   : +91${phone}`,
            `Email   : ${email}`,
            `Slot    : ${slot}`,
            `Payment : ${paymentId}`,
            `Order   : ${orderId}`
          ].join('\n'),
          start: { dateTime: startISO, timeZone: 'Asia/Kolkata' },
          end:   { dateTime: endISO,   timeZone: 'Asia/Kolkata' },
          attendees: [{ email }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email',  minutes: 60 },
              { method: 'popup',  minutes: 30 }
            ]
          }
        }
      });

      calendarLink = calEvent.data.htmlLink || '';

    } catch (calErr) {
      // Calendar failure should not block the booking confirmation
      console.error('[book-session] Google Calendar error:', calErr.message);
    }

    // ── 2. Email setup ───────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD  // Gmail App Password (not your login password)
      }
    });

    // ── 3. Confirmation email → client ───────────────────────────
    await transporter.sendMail({
      from:    `"Resume Writing Service" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: `Your Resume Session is Confirmed! 🎉`,
      html: clientEmailHTML({ name, niceDate, slot, paymentId, calendarLink,
                              myEmail: process.env.GMAIL_USER })
    });

    // ── 4. Notification email → you ─────────────────────────────
    await transporter.sendMail({
      from:    `"Booking System" <${process.env.GMAIL_USER}>`,
      to:      process.env.MY_EMAIL,
      subject: `New Booking: ${name} — ${niceDate}`,
      html: ownerEmailHTML({ name, phone, email, niceDate, slot, paymentId, orderId })
    });

    return json(200, { success: true, calendarLink });

  } catch (err) {
    console.error('[book-session]', err.message);
    return json(500, { error: err.message || 'Booking failed. Please contact support.' });
  }
};

// ── Helpers ──────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function json(status, body) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function clientEmailHTML({ name, niceDate, slot, paymentId, calendarLink, myEmail }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1714;">
    <h2 style="font-family:'Trebuchet MS',sans-serif;color:#bf4e18;margin-bottom:8px;">
      Booking Confirmed!
    </h2>
    <p style="color:#5a524a;margin-bottom:28px;">
      Hi ${name}, your resume strategy session has been booked. Here are your details:
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#f2ebe0;font-weight:700;width:35%;">Date</td>
        <td style="padding:12px 16px;background:#faf7f0;">${niceDate}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Time Slot</td>
        <td style="padding:12px 16px;background:#faf7f0;">${slot} IST</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Payment ID</td>
        <td style="padding:12px 16px;background:#faf7f0;font-size:0.85em;">${paymentId}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Amount Paid</td>
        <td style="padding:12px 16px;background:#faf7f0;">₹199</td>
      </tr>
    </table>

    <p style="font-weight:700;margin-bottom:10px;">Before the session:</p>
    <ol style="color:#5a524a;line-height:1.9;margin-bottom:24px;padding-left:20px;">
      <li>Send your current resume (or job history) to <strong>${myEmail}</strong></li>
      <li>Include the job description or role you're targeting</li>
      <li>You'll receive a Google Meet / Zoom link separately</li>
    </ol>

    ${calendarLink
      ? `<p><a href="${calendarLink}" style="color:#bf4e18;font-weight:700;">→ Add to Google Calendar</a></p>`
      : ''}

    <p style="margin-top:28px;color:#9a8f85;font-size:0.88em;">
      Questions? Reply to this email or WhatsApp us directly.
    </p>
  </div>`;
}

function ownerEmailHTML({ name, phone, email, niceDate, slot, paymentId, orderId }) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1714;">
    <h2 style="font-family:'Trebuchet MS',sans-serif;color:#bf4e18;margin-bottom:20px;">
      New Session Booked
    </h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;width:35%;">Client</td>   <td style="padding:12px 16px;background:#faf7f0;">${name}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Phone</td>    <td style="padding:12px 16px;background:#faf7f0;">+91${phone}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Email</td>    <td style="padding:12px 16px;background:#faf7f0;">${email}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Date</td>     <td style="padding:12px 16px;background:#faf7f0;">${niceDate}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Slot</td>     <td style="padding:12px 16px;background:#faf7f0;">${slot}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Payment ID</td><td style="padding:12px 16px;background:#faf7f0;font-size:0.85em;">${paymentId}</td></tr>
      <tr><td style="padding:12px 16px;background:#f2ebe0;font-weight:700;">Order ID</td>  <td style="padding:12px 16px;background:#faf7f0;font-size:0.85em;">${orderId}</td></tr>
    </table>
  </div>`;
}
