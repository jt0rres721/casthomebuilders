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

/* ── Gallery: filter + adaptive lightbox ──────────────────
   Each project below can be:
     - a single photo:      images: ['images/gallery-1.jpg']
     - a multi-photo set:   images: ['images/gallery-1.jpg', 'images/gallery-1b.jpg', ...]
     - a before/after pair: type: 'beforeafter', before: '...', after: '...'
   Add real projects by editing this array — no HTML changes needed.
   Not every project needs the same treatment: mix and match freely as
   you get more photos for a given project. ─────────────────────────── */
const PROJECTS = [
  { id: 1, category: 'bathroom', title: 'Shower Remodel', location: 'American Fork, UT',
    type: 'single', images: ['images/gallery-2.jpg'] },
  { id: 2, category: 'kitchen', title: 'Kitchen Remodel', location: 'Saratoga Springs, UT',
    type: 'single', images: ['images/gallery-3.jpg'] },
  { id: 3, category: 'basement', title: 'Basement Entrance', location: 'Eagle Mountain, UT',
    type: 'single', images: ['images/gallery-1.jpg'] },
  { id: 4, category: 'flooring', title: 'LVP Flooring', location: 'Draper, UT',
    type: 'single', images: ['images/gallery-4.jpg'] },
  { id: 5, category: 'bathroom', title: 'Bathroom Remodel', location: 'Provo, UT',
    type: 'single', images: ['images/gallery-5.jpg'] },
  { id: 6, category: 'accessibility', title: 'Accessibility Bathroom Remodel', location: 'Pleasant Grove, UT',
    type: 'single', images: ['images/gallery-6.jpg'] },

  // EXAMPLE — how to add a before/after project once you have both photos:
  // { id: 7, category: 'concrete', title: 'Driveway Replacement', location: 'Lehi, UT',
  //   type: 'beforeafter', before: 'images/gallery-driveway-before.jpg', after: 'images/gallery-driveway-after.jpg' },

  // EXAMPLE — how to add a multi-photo project once you have extra shots:
  // { id: 8, category: 'kitchen', title: 'Kitchen Remodel', location: 'Vineyard, UT',
  //   type: 'single', images: ['images/gallery-8a.jpg', 'images/gallery-8b.jpg', 'images/gallery-8c.jpg'] },
];

const CAT_LABEL = {
  kitchen: 'Kitchen Remodel', bathroom: 'Bathroom Remodel', basement: 'Basement Finish',
  flooring: 'Flooring', concrete: 'Concrete', accessibility: 'Accessibility Remodel'
};

const galleryGrid = document.getElementById('gallery-grid');
const galleryEmpty = document.getElementById('gallery-empty');
const galleryFilters = document.getElementById('gallery-filters');

function badgeFor(p) {
  if (p.type === 'beforeafter') {
    return '<span class="gcard-badge">&#8596; Before/After</span>';
  }
  if (p.images && p.images.length > 1) {
    return `<span class="gcard-badge">${p.images.length} Photos</span>`;
  }
  return '';
}

function renderGallery(filter) {
  if (!galleryGrid) return;
  const filtered = PROJECTS.filter(p => filter === 'all' || p.category === filter);
  galleryGrid.innerHTML = '';

  if (filtered.length === 0) {
    if (galleryEmpty) galleryEmpty.hidden = false;
    return;
  }
  if (galleryEmpty) galleryEmpty.hidden = true;

  filtered.forEach(p => {
    const thumbUrl = p.type === 'beforeafter' ? p.after : p.images[0];
    const card = document.createElement('div');
    card.className = 'gcard';
    card.innerHTML = `
      <div class="gcard-thumb" style="background-image:url('${thumbUrl}')">${badgeFor(p)}</div>
      <div class="gcard-body">
        <p class="gcard-cat">${CAT_LABEL[p.category] || p.category}</p>
        <h3 class="gcard-title">${p.title}</h3>
        <p class="gcard-loc">${p.location}</p>
      </div>`;
    card.addEventListener('click', () => openLightbox(p.id));
    galleryGrid.appendChild(card);
  });
}

if (galleryFilters) {
  galleryFilters.addEventListener('click', e => {
    if (!e.target.classList.contains('filter-pill')) return;
    galleryFilters.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderGallery(e.target.dataset.filter);
  });
  renderGallery('all');
}

/* ── Lightbox ─────────────────────────────────────────── */
const lightbox = document.getElementById('lightbox');
const lightboxMedia = document.getElementById('lightbox-media');
let currentSlide = 0;
let currentProject = null;

function openLightbox(id) {
  currentProject = PROJECTS.find(p => p.id === id);
  if (!currentProject || !lightbox) return;
  currentSlide = 0;
  document.getElementById('lightbox-cat').textContent = CAT_LABEL[currentProject.category] || currentProject.category;
  document.getElementById('lightbox-title').textContent = currentProject.title;
  document.getElementById('lightbox-loc').textContent = currentProject.location;
  renderLightboxMedia();
  lightbox.classList.add('active');
}

function renderLightboxMedia() {
  lightboxMedia.innerHTML = '<div class="lightbox-close" id="lightbox-close">&times;</div>';
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

  if (currentProject.type === 'beforeafter') {
    const wrap = document.createElement('div');
    wrap.className = 'ba-slider';
    wrap.innerHTML = `
      <div class="ba-image ba-after" style="background-image:url('${currentProject.after}')"></div>
      <span class="ba-label ba-label-after">After</span>
      <div class="ba-clip" id="ba-clip">
        <div class="ba-image ba-before" id="ba-before" style="background-image:url('${currentProject.before}')"></div>
      </div>
      <span class="ba-label ba-label-before">Before</span>
      <div class="ba-handle" id="ba-handle"></div>
      <input type="range" class="ba-range" id="ba-range" min="0" max="100" value="50" aria-label="Drag to compare before and after">
    `;
    lightboxMedia.appendChild(wrap);

    const clip = document.getElementById('ba-clip');
    const before = document.getElementById('ba-before');
    const handle = document.getElementById('ba-handle');
    const range = document.getElementById('ba-range');

    const sizeBefore = () => { before.style.width = wrap.offsetWidth + 'px'; };
    sizeBefore();
    window.addEventListener('resize', sizeBefore);
    range.addEventListener('input', () => {
      clip.style.width = range.value + '%';
      handle.style.left = range.value + '%';
    });

  } else if (currentProject.images.length > 1) {
    currentProject.images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'lightbox-slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url('${src}')`;
      lightboxMedia.appendChild(slide);
    });
    const prev = document.createElement('div');
    prev.className = 'lightbox-nav-btn lightbox-prev';
    prev.innerHTML = '&#8249;';
    prev.addEventListener('click', () => changeSlide(-1));
    const next = document.createElement('div');
    next.className = 'lightbox-nav-btn lightbox-next';
    next.innerHTML = '&#8250;';
    next.addEventListener('click', () => changeSlide(1));
    const counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    counter.id = 'lightbox-counter';
    counter.textContent = `1 / ${currentProject.images.length}`;
    lightboxMedia.append(prev, next, counter);

  } else {
    const slide = document.createElement('div');
    slide.className = 'lightbox-slide active';
    slide.style.backgroundImage = `url('${currentProject.images[0]}')`;
    lightboxMedia.appendChild(slide);
  }
}

function changeSlide(dir) {
  const slides = lightboxMedia.querySelectorAll('.lightbox-slide');
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + dir + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  const counter = document.getElementById('lightbox-counter');
  if (counter) counter.textContent = `${currentSlide + 1} / ${slides.length}`;
}

function closeLightbox() {
  if (lightbox) lightbox.classList.remove('active');
}
if (lightbox) {
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

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
  '.service-card, .why-list li, .process-step, .review-card, .gcard'
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
        submitBtn.textContent = 'Send My Request →';
        submitBtn.disabled = false;
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