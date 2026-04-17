// =====================================================
// OTP RE-ENABLE SCRIPT
// Run this to re-enable OTP functionality
//
// Usage: node enable-otp.js
// =====================================================

const fs = require('fs');
const path = require('path');

console.log('🔄 Re-enabling OTP functionality...\n');

// Read main.js
const mainJsPath = path.join(__dirname, 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Replace the disabled OTP section with the original code
const disabledOtpBlock = `  // === OTP DISABLED FOR TESTING ===
  // To re-enable OTP: Uncomment the try-catch block below and remove the direct goToStep(3)
  /*
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
  */

  // === SKIP OTP - GO DIRECTLY TO DETAILS ===
  booking.phone = phone;
  document.getElementById('phone-display').textContent = phone;
  showMsg('otp-send-msg', 'Phone verified! Continue with your details.', 'success');
  setTimeout(() => { hideMsg('otp-send-msg'); goToStep(3); }, 900);
  setLoading('send-otp-btn', false, 'Continue');`;

const enabledOtpBlock = `  try {
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
  }`;

// Replace in main.js
mainJs = mainJs.replace(disabledOtpBlock, enabledOtpBlock);
fs.writeFileSync(mainJsPath, mainJs);

console.log('✅ main.js updated - OTP re-enabled');

// Update HTML button text back to "Send OTP"
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace('Continue', 'Send OTP');
html = html.replace('We\'ll use this to contact you about your session.', 'We\'ll send a one-time OTP to verify your number.');
fs.writeFileSync(htmlPath, html);

console.log('✅ index.html updated - button text restored');

// Restore progress bar to include step 2
const progressBarOld = `        <!-- Step progress indicator -->
        <div class="progress-bar" id="progress-bar">
          <div class="progress-step active" data-step="1">1</div>
          <div class="progress-line" id="pline-1"></div>
          <div class="progress-step" data-step="3">3</div>
          <div class="progress-line" id="pline-2"></div>
          <div class="progress-step" data-step="4">4</div>
        </div>`;

const progressBarNew = `        <!-- Step progress indicator -->
        <div class="progress-bar" id="progress-bar">
          <div class="progress-step active" data-step="1">1</div>
          <div class="progress-line" id="pline-1"></div>
          <div class="progress-step" data-step="2">2</div>
          <div class="progress-line" id="pline-2"></div>
          <div class="progress-step" data-step="3">3</div>
          <div class="progress-line" id="pline-3"></div>
          <div class="progress-step" data-step="4">4</div>
        </div>`;

html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(progressBarOld, progressBarNew);
fs.writeFileSync(htmlPath, html);

console.log('✅ index.html updated - progress bar restored');

// Restore original goToStep function
const goToStepOld = `  // Update progress indicator (only for numeric steps 1–4)
  // NOTE: OTP is disabled, so progress shows: 1 → 3 → 4
  if (typeof step === 'number') {
    document.querySelectorAll('.progress-step').forEach(dot => {
      const n = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'done');
      // Progress logic: step 1 done when going to 3, step 3 done when going to 4
      if (n === 1 && step > 1) dot.classList.add('done');
      if (n === 3 && step > 3) dot.classList.add('done');
      if (n === step) dot.classList.add('active');
    });
    // Update progress lines: only 2 lines now (pline-1 between 1-3, pline-2 between 3-4)
    document.getElementById('pline-1')?.classList.toggle('done', step > 1);
    document.getElementById('pline-2')?.classList.toggle('done', step > 3);
  }`;

const goToStepNew = `  // Update progress indicator (only for numeric steps 1–4)
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
  }`;

mainJs = fs.readFileSync(mainJsPath, 'utf8');
mainJs = mainJs.replace(goToStepOld, goToStepNew);
fs.writeFileSync(mainJsPath, mainJs);

console.log('✅ main.js updated - progress logic restored');

console.log('\n🎉 OTP functionality re-enabled with Twilio!');
console.log('📝 Remember to:');
console.log('   1. Sign up for Twilio account at https://twilio.com/try-twilio');
console.log('   2. Get your Account SID, Auth Token, and phone number');
console.log('   3. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to Netlify env vars');
console.log('   4. Deploy to Netlify (functions won\'t work locally)');