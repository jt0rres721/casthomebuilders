/* ════════════════════════════════════════════════════════
   CAST HOME BUILDERS — main.js
   ════════════════════════════════════════════════════════ */

/* ── Dynamic copyright year ─────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Header scroll shadow ────────────────────────────── */
const header = document.getElementById('site-header');
const onScroll = () => {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Mobile nav toggle ───────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navMobile.hidden = isOpen;
});

// Close mobile nav when a link is clicked
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMobile.hidden = true;
  });
});

/* ── Sticky CTA bar (mobile) ─────────────────────────── */
const stickyCta = document.getElementById('sticky-cta');
const hero = document.querySelector('.hero');

if (stickyCta && hero) {
  stickyCta.removeAttribute('aria-hidden');

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);
}

/* ── Smooth scroll for anchor links ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Scroll-reveal animations ────────────────────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .why-list li, .process-step, .review-card, .gallery-item, .trust-item'
);

if ('IntersectionObserver' in window) {
  // Add initial hidden state via JS (so no-JS users still see content)
  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity 500ms ease ${i % 4 * 80}ms, transform 500ms ease ${i % 4 * 80}ms`;
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));
}

/* ── Contact form handling ───────────────────────────── */
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async e => {
    // If using Formspree, let the default action handle it
    // unless you want AJAX submission (no page reload) — handled below:
    const action = form.getAttribute('action');
    if (!action || action.includes('[YOUR-FORMSPREE-ID]')) {
      // Formspree not yet configured — show a friendly notice
      e.preventDefault();
      alert('Form not yet configured. Please add your Formspree endpoint to the form action attribute in index.html.');
      return;
    }

    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      const res = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.reset();
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        throw new Error('Server error');
      }
    } catch {
      alert('Something went wrong. Please try calling us directly or emailing us.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
