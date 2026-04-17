// ============================================================
// main.js — All frontend logic
// Reads from CONFIG (config.js) to populate the entire site.
// ============================================================

// Razorpay key fetched from server — never hardcoded here.
let razorpayKeyId = '';

// Stores booking state across the 4-step widget.
const booking = {
  phone:      '',
  otpToken:   '',
  otpExpiry:  '',
  name:       '',
  email:      '',
  date:       '',
  slot:       '',
  orderId:    '',
  paymentId:  ''
};

// ============================================================
// BOOT — runs when DOM is ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  applyCSSVariables();
  populateSite();
  initNav();
  initBooking();
  initFAQ();
  fetchRazorpayKey(); // async — done in background
});

// ============================================================
// 1. APPLY CONFIG COLORS AS CSS VARIABLES
// This lets changing CONFIG.colors instantly restyle the site.
// ============================================================
function applyCSSVariables() {
  const r = document.documentElement;
  const c = CONFIG.colors;
  r.style.setProperty('--primary',       c.primary);
  r.style.setProperty('--primary-hover', c.primaryHover);
  r.style.setProperty('--gold',          c.gold);
  r.style.setProperty('--dark',          c.dark);
  r.style.setProperty('--cream',         c.cream);
  r.style.setProperty('--warm',          c.warm);
}

// ============================================================
// 2. POPULATE ALL SECTIONS FROM CONFIG
// ============================================================
function populateSite() {

  // — Page title —
  document.getElementById('page-title').textContent =
    CONFIG.name + ' — Resume Writing Services';

  // — Nav —
  document.getElementById('nav-logo').textContent = CONFIG.name;

  // — Hero —
  document.getElementById('hero-tagline').textContent = CONFIG.tagline;
  document.getElementById('hero-sub').textContent     = CONFIG.subTagline;

  document.getElementById('hero-stats').innerHTML = CONFIG.stats.map(s => `
    <div class="stat-item">
      <span class="stat-number">${s.number}</span>
      <span class="stat-label">${s.label}</span>
    </div>
  `).join('');

  // — Ticker (items duplicated for seamless infinite loop) —
  const tickerWords = [
    ...CONFIG.services.map(s => s.title),
    'ATS-Optimised',
    '24-Hour Delivery',
    'Interview-Ready',
    ...CONFIG.stats.map(s => s.number + ' ' + s.label)
  ];
  const tickerHTML = tickerWords
    .map(t => `<span class="ticker-item">${t}<span class="ticker-dot"></span></span>`)
    .join('');
  // Duplicate so the animation loops seamlessly
  document.getElementById('ticker-inner').innerHTML = tickerHTML + tickerHTML;

  // — Services —
  document.getElementById('services-grid').innerHTML = CONFIG.services.map(s => `
    <div class="service-card">
      <div class="service-number">${s.number}</div>
      <div class="service-title">${s.title}</div>
      <p class="service-desc">${s.description}</p>
    </div>
  `).join('');

  // — About —
  const photoEl = document.getElementById('about-photo');
  photoEl.src = CONFIG.photo;
  photoEl.alt = CONFIG.name + ' — resume writer';
  // Show initials as fallback if photo missing
  const initials = CONFIG.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  photoEl.closest('.about-photo-frame').dataset.initials = initials;

  document.getElementById('about-heading').textContent = CONFIG.aboutHeading;
  document.getElementById('about-text').innerHTML =
    CONFIG.aboutText.map(p => `<p class="about-para">${p}</p>`).join('');
  document.getElementById('skills-grid').innerHTML =
    CONFIG.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

  document.getElementById('about-linkedin').href  = CONFIG.linkedin;
  document.getElementById('about-whatsapp').href  = 'https://wa.me/91' + CONFIG.whatsapp;
  document.getElementById('about-email').href     = 'mailto:' + CONFIG.email;

  // — How it works —
  document.getElementById('steps-grid').innerHTML = CONFIG.steps.map(s => `
    <div class="step-item">
      <div class="step-number">${s.number}</div>
      <div class="step-title">${s.title}</div>
      <p class="step-desc">${s.description}</p>
    </div>
  `).join('');

  // — Testimonials —
  document.getElementById('testimonials-grid').innerHTML = CONFIG.testimonials.map(t => `
    <div class="testimonial-card">
      <p class="testimonial-quote">${t.quote}</p>
      <div class="testimonial-name">${t.name}</div>
      <div class="testimonial-role">${t.role}</div>
    </div>
  `).join('');

  // — Booking section —
  document.getElementById('booking-price').textContent    = CONFIG.sessionPrice;
  document.getElementById('booking-duration').textContent = CONFIG.sessionDuration;
  document.getElementById('pay-amount').textContent       = CONFIG.sessionPrice;
  document.getElementById('summary-total').textContent    = '₹' + CONFIG.sessionPrice;
  document.getElementById('success-email').textContent    = CONFIG.email;

  document.getElementById('perks-list').innerHTML =
    CONFIG.sessionIncludes.map(p => `<li>${p}</li>`).join('');

  document.getElementById('slots-list').innerHTML =
    CONFIG.availableSlots.map(s => `<li>${s}</li>`).join('');

  const slotSelect = document.getElementById('slot-select');
  CONFIG.availableSlots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    slotSelect.appendChild(opt);
  });

  // Set min selectable date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('date-input').min = tomorrow.toISOString().split('T')[0];

  // — FAQ —
  document.getElementById('faq-list').innerHTML = CONFIG.faqs.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-question" data-index="${i}" aria-expanded="false">
        ${f.q}
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-answer" role="region">
        <p>${f.a}</p>
      </div>
    </div>
  `).join('');

  // — Footer —
  document.getElementById('footer-logo').textContent     = CONFIG.name;
  document.getElementById('footer-tagline').textContent  = CONFIG.tagline;
  document.getElementById('footer-email').href           = 'mailto:' + CONFIG.email;
  document.getElementById('footer-linkedin').href        = CONFIG.linkedin;
  document.getElementById('footer-whatsapp').href        = 'https://wa.me/91' + CONFIG.whatsapp;
  document.getElementById('footer-year').textContent     = new Date().getFullYear();
}

// ============================================================
// 3. NAV — scroll shadow + hamburger menu
// ============================================================
function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu when any link is tapped
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ============================================================
// 4. FAQ ACCORDION
// ============================================================
function initFAQ() {
  document.getElementById('faq-list').addEventListener('click', e => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all open items
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked item if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

// ============================================================
// 5. FETCH RAZORPAY KEY FROM SERVER
// Key is never hardcoded in client code.
// ============================================================
async function fetchRazorpayKey() {
  try {
    const res  = await fetch('/.netlify/functions/get-config');
    const data = await res.json();
    razorpayKeyId = data.razorpayKeyId || '';
    // Also stamp on meta tag for reference
    document.getElementById('rzp-key-meta').content = razorpayKeyId;
  } catch {
    console.warn('Could not fetch Razorpay config — payment may fail.');
  }
}

// ============================================================
// 6. BOOKING WIDGET
// ============================================================
function initBooking() {
  document.getElementById('send-otp-btn').addEventListener('click',  handleSendOTP);
  document.getElementById('verify-otp-btn').addEventListener('click', handleVerifyOTP);
  document.getElementById('resend-otp-btn').addEventListener('click', handleSendOTP);
  document.getElementById('continue-btn').addEventListener('click',   handleContinue);
  document.getElementById('pay-btn').addEventListener('click',        handlePay);

  // Allow pressing Enter in inputs
  document.getElementById('phone-input').addEventListener('keydown', e => { if (e.key === 'Enter') handleSendOTP(); });
  document.getElementById('otp-input').addEventListener('keydown',   e => { if (e.key === 'Enter') handleVerifyOTP(); });

  // Only allow digits in phone/OTP fields
  document.getElementById('phone-input').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });
  document.getElementById('otp-input').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  });
}

// ── Utility: move widget to a step ──────────────────────────
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));

  // Show the target step
  const stepId = step === 'success' ? 'step-success' : 'step-' + step;
  const el = document.getElementById(stepId);
  if (el) {
    el.classList.add('active');
    // Scroll widget into view on mobile
    el.closest('.booking-widget').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update progress indicator (only for numeric steps 1–4)
  if (typeof step === 'number') {
    document.querySelectorAll('.progress-step').forEach(dot => {
      const n = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'done');
      if (n < step)  dot.classList.add('done');
      if (n === step) dot.classList.add('active');
    });
    ['pline-1','pline-2','pline-3'].forEach((id, i) => {
      document.getElementById(id)?.classList.toggle('done', i + 1 < step);
    });
  }
}

// ── Utility: show / hide form messages ──────────────────────
function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = 'form-msg ' + type;
}
function hideMsg(id) {
  const el = document.getElementById(id);
  el.className = 'form-msg';
  el.textContent = '';
}

// ── Utility: toggle loading state on a button ───────────────
function setLoading(btnId, loading, resetText) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  if (loading) {
    btn._original = btn.textContent;
    btn.textContent = 'Please wait…';
  } else {
    btn.textContent = resetText || btn._original || btn.textContent;
  }
}

// ============================================================
// STEP 1 — Send OTP
// ============================================================
async function handleSendOTP() {
  const phone = document.getElementById('phone-input').value.trim();
  hideMsg('otp-send-msg');

  if (!/^[6-9]\d{9}$/.test(phone)) {
    showMsg('otp-send-msg', 'Enter a valid 10-digit Indian mobile number (starts with 6–9).', 'error');
    return;
  }

  setLoading('send-otp-btn', true);

  try {
    const res  = await fetch('/.netlify/functions/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

    // Store token for stateless verification in Step 2
    booking.phone      = phone;
    booking.otpToken   = data.token;
    booking.otpExpiry  = data.expiry;

    document.getElementById('phone-display').textContent = phone;
    showMsg('otp-send-msg', 'OTP sent! Check your messages.', 'success');
    setTimeout(() => { hideMsg('otp-send-msg'); goToStep(2); }, 900);

  } catch (err) {
    showMsg('otp-send-msg', err.message || 'Could not send OTP. Try again.', 'error');
  } finally {
    setLoading('send-otp-btn', false, 'Send OTP');
  }
}

// ============================================================
// STEP 2 — Verify OTP
// ============================================================
async function handleVerifyOTP() {
  const otp = document.getElementById('otp-input').value.trim();
  hideMsg('otp-verify-msg');

  if (!/^\d{6}$/.test(otp)) {
    showMsg('otp-verify-msg', 'Enter the 6-digit OTP.', 'error');
    return;
  }

  setLoading('verify-otp-btn', true);

  try {
    const res  = await fetch('/.netlify/functions/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone:  booking.phone,
        otp,
        token:  booking.otpToken,
        expiry: booking.otpExpiry
      })
    });
    const data = await res.json();
    if (!res.ok || !data.verified) throw new Error(data.error || 'OTP verification failed.');

    showMsg('otp-verify-msg', 'Phone verified!', 'success');
    setTimeout(() => { hideMsg('otp-verify-msg'); goToStep(3); }, 900);

  } catch (err) {
    showMsg('otp-verify-msg', err.message || 'Invalid OTP. Try again.', 'error');
  } finally {
    setLoading('verify-otp-btn', false, 'Verify OTP');
  }
}

// ============================================================
// STEP 3 — Collect details, show summary
// ============================================================
function handleContinue() {
  const name  = document.getElementById('name-input').value.trim();
  const email = document.getElementById('email-input').value.trim();
  const date  = document.getElementById('date-input').value;
  const slot  = document.getElementById('slot-select').value;
  hideMsg('details-msg');

  if (!name)                                 { showMsg('details-msg', 'Please enter your full name.', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('details-msg', 'Enter a valid email address.', 'error'); return; }
  if (!date)                                 { showMsg('details-msg', 'Please select a preferred date.', 'error'); return; }
  if (!slot)                                 { showMsg('details-msg', 'Please select a time slot.', 'error'); return; }

  booking.name  = name;
  booking.email = email;
  booking.date  = date;
  booking.slot  = slot;

  // Populate summary in Step 4
  const niceDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('summary-name').textContent  = name;
  document.getElementById('summary-phone').textContent = '+91 ' + booking.phone;
  document.getElementById('summary-email').textContent = email;
  document.getElementById('summary-date').textContent  = niceDate;
  document.getElementById('summary-slot').textContent  = slot;

  goToStep(4);
}

// ============================================================
// STEP 4 — Create Razorpay order → open checkout → verify → book
// ============================================================
async function handlePay() {
  hideMsg('payment-msg');

  if (!razorpayKeyId) {
    showMsg('payment-msg', 'Payment config not loaded yet. Please wait a moment and try again.', 'error');
    return;
  }

  setLoading('pay-btn', true);

  try {
    // 4a. Create a Razorpay order on the server
    const orderRes  = await fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: CONFIG.sessionPrice })
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.error || 'Could not create payment order.');

    booking.orderId = orderData.orderId;
    setLoading('pay-btn', false); // re-enable before opening Razorpay modal

    // 4b. Open Razorpay checkout
    const rzpOptions = {
      key:         razorpayKeyId,
      amount:      orderData.amount,       // in paise
      currency:    orderData.currency,
      name:        CONFIG.name,
      description: 'Resume Strategy Session — ' + CONFIG.sessionDuration,
      order_id:    orderData.orderId,
      prefill: {
        name:    booking.name,
        email:   booking.email,
        contact: '+91' + booking.phone
      },
      theme:  { color: CONFIG.colors.primary },
      handler: handlePaymentSuccess,        // called on successful payment
      modal: {
        ondismiss: () => {
          showMsg('payment-msg', 'Payment cancelled. Click "Pay" to try again.', 'info');
        }
      }
    };

    const rzp = new Razorpay(rzpOptions); // eslint-disable-line no-undef
    rzp.open();

  } catch (err) {
    showMsg('payment-msg', err.message || 'Payment failed. Please try again.', 'error');
    setLoading('pay-btn', false, 'Pay ₹' + CONFIG.sessionPrice + ' Now');
  }
}

// Called by Razorpay on successful payment
async function handlePaymentSuccess(response) {
  showMsg('payment-msg', 'Payment received! Confirming your booking…', 'info');

  try {
    // 4c. Verify payment signature on server
    const verifyRes  = await fetch('/.netlify/functions/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.verified) throw new Error('Payment signature mismatch. Please contact us.');

    booking.paymentId = response.razorpay_payment_id;

    // 4d. Book session — creates calendar event + sends emails
    const bookRes  = await fetch('/.netlify/functions/book-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:      booking.name,
        email:     booking.email,
        phone:     booking.phone,
        date:      booking.date,
        slot:      booking.slot,
        paymentId: booking.paymentId,
        orderId:   booking.orderId
      })
    });
    const bookData = await bookRes.json();
    if (!bookRes.ok) throw new Error(bookData.error || 'Booking confirmation failed. Please contact us.');

    // Update calendar link if returned
    const calLink = document.getElementById('calendar-link');
    if (bookData.calendarLink) {
      calLink.href = bookData.calendarLink;
    } else {
      calLink.style.display = 'none';
    }

    // Show success screen
    goToStep('success');

  } catch (err) {
    showMsg('payment-msg',
      err.message + ' — Your payment went through. Please contact ' + CONFIG.email + ' with your payment ID: ' + (booking.paymentId || 'unknown'),
      'error'
    );
  }
}
