/* ===========================
   KAMPAAMO TESTI – MAIN.JS
   =========================== */

'use strict';

// ---------- HAMBURGER MENU ----------
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}

// ---------- HEADER SCROLL-EFEKTI ----------
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  let lastScroll = 0;

  const onScroll = () => {
    const current = window.scrollY;
    siteHeader.style.boxShadow = current > 40
      ? '0 4px 24px rgba(0,0,0,0.35)'
      : 'none';
    lastScroll = current;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------- SMOOTH SCROLL ANKKURILINKEILLE ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = siteHeader ? siteHeader.offsetHeight : 68;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---------- FAQ ACCORDION ----------
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const trigger = item.querySelector('.faq-trigger');
  const panel = item.querySelector('.faq-panel');

  if (!trigger || !panel) return;

  // Asetetaan alkutila
  panel.setAttribute('hidden', '');
  panel.style.maxHeight = '0';

  trigger.addEventListener('click', () => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    // Suljetaan kaikki muut
    faqItems.forEach(other => {
      if (other === item) return;
      const otherTrigger = other.querySelector('.faq-trigger');
      const otherPanel = other.querySelector('.faq-panel');
      if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      if (otherPanel) {
        otherPanel.setAttribute('hidden', '');
        otherPanel.style.maxHeight = '0';
      }
    });

    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = '0';
      // Lisätään hidden vasta transition-ajan jälkeen
      const onEnd = () => {
        panel.setAttribute('hidden', '');
        panel.removeEventListener('transitionend', onEnd);
      };
      panel.addEventListener('transitionend', onEnd);
    } else {
      panel.removeAttribute('hidden');
      // Annetaan selaimelle hetki piirtää ennen max-height-muutosta
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        });
      });
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---------- STATS COUNTER ANIMAATIO ----------
const statsAnimated = new Set();

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const animateCounter = (el, target, duration = 1600) => {
  if (statsAnimated.has(el)) return;
  statsAnimated.add(el);

  const isDecimal = target < 10 && !Number.isInteger(target);
  const start = performance.now();

  const step = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = eased * target;

    el.textContent = isDecimal
      ? current.toFixed(1)
      : Math.floor(current).toString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = isDecimal ? target.toFixed(1) : String(target);
    }
  };

  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.dataset.target;
    if (raw === undefined) return;
    const target = parseFloat(raw);
    if (!isNaN(target)) animateCounter(el, target);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  statsObserver.observe(el);
});

// ---------- SCROLL REVEAL ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

const revealSelectors = [
  '.palvelu-card',
  '.takuu-card',
  '.masonry-item',
  '.contact-item',
  '.faq-item',
  '.meista-content',
  '.meista-visual',
  '.section-header',
];

revealSelectors.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    const mod = i % 3;
    if (mod === 1) el.classList.add('reveal-delay-1');
    if (mod === 2) el.classList.add('reveal-delay-2');
    revealObserver.observe(el);
  });
});

// ---------- YHTEYDENOTTOLOMAKE ----------
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const showStatus = (msg, type) => {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = 'form-status ' + type;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const nameInput  = contactForm.querySelector('#name');
    const emailInput = contactForm.querySelector('#email');
    const submitBtn  = contactForm.querySelector('[type="submit"]');
    const btnText    = contactForm.querySelector('.btn-text');
    const btnLoading = contactForm.querySelector('.btn-loading');

    const name  = nameInput  ? nameInput.value.trim()  : '';
    const email = emailInput ? emailInput.value.trim() : '';

    // Validointi
    if (!name) {
      showStatus('Kirjoita nimesi.', 'error');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showStatus('Tarkista sähköpostiosoite.', 'error');
      if (emailInput) emailInput.focus();
      return;
    }

    // Lähettäminen
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;
    formStatus.textContent = '';
    formStatus.className   = 'form-status';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        showStatus('Viesti lähetetty! Olemme yhteydessä pian.', 'success');
        contactForm.reset();
      } else {
        let msg = 'Viestin lähetys epäonnistui. Yritä uudelleen tai soita meille.';
        try {
          const json = await response.json();
          if (Array.isArray(json?.errors) && json.errors.length) {
            msg = json.errors.map(err => err.message).join('. ');
          }
        } catch {
          // Ei JSON-vastausta – käytetään oletusvirheviestiä
        }
        showStatus(msg, 'error');
      }
    } catch {
      showStatus('Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText)    btnText.hidden    = false;
      if (btnLoading) btnLoading.hidden = true;
    }
  });
}