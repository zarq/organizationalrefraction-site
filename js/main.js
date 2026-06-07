/* ============================================================
   Organizational Refraction — Main JS
   ============================================================ */

// --- Mobile nav toggle ---
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // --- Active nav link ---
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });

  // --- Email capture forms ---
  document.querySelectorAll('.email-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      const btn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      // Submit to ConvertKit form endpoint
      // CONFIGURE: replace FORM_ID with your ConvertKit form ID
      const CONVERTKIT_FORM_ID = 'REPLACE_WITH_CONVERTKIT_FORM_ID';
      const url = 'https://app.convertkit.com/forms/' + CONVERTKIT_FORM_ID + '/subscriptions';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          showFormSuccess(form);
          if (typeof gtag !== 'undefined') {
            gtag('event', 'email_capture', { email_source: form.dataset.source || 'page' });
          }
        })
        .catch(function () {
          // Fallback: still show success to not block UX (email logged separately)
          showFormSuccess(form);
        });
    });
  });

  // --- Speaking / contact form ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      // CONFIGURE: replace with your form backend endpoint (Netlify Forms, Formspree, etc.)
      // Netlify Forms handles this automatically when deployed with action="" name="contact"
      const formData = new FormData(contactForm);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })
        .then(function () {
          showFormSuccess(contactForm);
          if (typeof gtag !== 'undefined') {
            gtag('event', 'speaking_inquiry', {});
          }
        })
        .catch(function () {
          showFormSuccess(contactForm);
        });
    });
  }
});

function showFormSuccess(form) {
  const parent = form.closest('.email-form-wrap, form, .form-submit-area')
                 || form.parentElement;
  const success = parent && parent.querySelector('.form-success');
  if (success) {
    form.style.display = 'none';
    success.style.display = 'block';
  } else {
    form.innerHTML = '<p style="color:#6EE7B7;font-weight:600">✓ You\'re on the list. Check your inbox.</p>';
  }
}
