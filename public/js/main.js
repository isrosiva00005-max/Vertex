/* ═══════════════════════════════════════════════════════════
   VERTEX GLOBAL — Client-Side JavaScript
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initInquiryForm();
  initNewsletterForm();
  setActiveNavLink();
  initIconCursorEffect();
});

/* ── Navbar Scroll Effect ─────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ── Mobile Navigation Toggle ─────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    toggle.classList.toggle('active');

    // Animate hamburger → X
    const spans = toggle.querySelectorAll('span');
    if (toggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      toggle.classList.remove('active');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

/* ── Active Navigation Link ───────────────────────────────── */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a:not(.btn-book-now)');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Scroll Reveal Animations ─────────────────────────────── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* ── Toast Notifications ──────────────────────────────────── */
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ── Inquiry Form Handler ─────────────────────────────────── */
function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.disabled = true;

    const formData = {
      full_name: form.querySelector('#full-name')?.value?.trim() || '',
      email: form.querySelector('#email')?.value?.trim() || '',
      phone: form.querySelector('#phone')?.value?.trim() || '',
      service_interest: form.querySelector('#service-interest')?.value || '',
      message: form.querySelector('#message')?.value?.trim() || ''
    };

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        form.reset();
      } else {
        showToast(data.error || 'Something went wrong.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* ── Newsletter Form Handler ──────────────────────────────── */
function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const input = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input.value.trim() })
        });

        const data = await response.json();

        if (data.success) {
          showToast(data.message, 'success');
          input.value = '';
        } else {
          showToast(data.error || 'Something went wrong.', 'error');
        }
      } catch (err) {
        showToast('Network error. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  });
}

/* ── Counter Animation (Stats) ────────────────────────────── */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = 2000;
          const startTime = Date.now();

          function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            el.textContent = prefix + current.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = prefix + target.toLocaleString() + suffix;
            }
          }

          updateCounter();
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

// Run counter animation
document.addEventListener('DOMContentLoaded', animateCounters);

/* ── Icon Cursor Glow Effect ──────────────────────────────── */
function initIconCursorEffect() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  // ── Create the custom cursor orb ──
  const orb = document.createElement('div');
  orb.id = 'cursor-orb';
  orb.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.3) 60%, transparent 100%);
    box-shadow: 0 0 12px 4px rgba(201,168,76,0.5);
    transform: translate(-50%, -50%) scale(1);
    transition: transform 0.18s cubic-bezier(.16,1,.3,1),
                box-shadow 0.18s ease,
                opacity 0.18s ease;
    opacity: 0;
    will-change: transform, left, top;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(orb);

  // ── Create the trailing ring ──
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999997;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid rgba(201,168,76,0.45);
    transform: translate(-50%, -50%) scale(1);
    transition: transform 0.35s cubic-bezier(.16,1,.3,1),
                border-color 0.25s ease,
                opacity 0.25s ease;
    opacity: 0;
    will-change: transform, left, top;
  `;
  document.body.appendChild(ring);

  // Icon selectors — all icon containers across all pages
  const ICON_SELECTOR = [
    '.step-icon',
    '.stat-icon-circle',
    '.pillar-icon',
    '.cf-icon',
    '.card-icon',
    '.bm-logo-icon',
    '.service-icon',
    '.footer-social a',
    '.nav-toggle',
    '.btn-book-now',
    '.btn',
    'button:not(#bm-confirm-btn):not(.bm-close):not(.bm-cal-nav):not(.bm-slot)',
  ].join(', ');

  let mouseX = 0, mouseY = 0;
  let orbX = 0,   orbY = 0;
  let ringX = 0,  ringY = 0;
  let isVisible = false;
  let isOverIcon = false;
  let raf;

  // Smooth follow with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    orbX  = lerp(orbX,  mouseX, 0.18);
    orbY  = lerp(orbY,  mouseY, 0.18);
    ringX = lerp(ringX, mouseX, 0.09);
    ringY = lerp(ringY, mouseY, 0.09);

    orb.style.left = orbX + 'px';
    orb.style.top  = orbY + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    raf = requestAnimationFrame(tick);
  }

  // Track mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      // Snap on first move
      orbX = ringX = mouseX;
      orbY = ringY = mouseY;
      orb.style.opacity  = '1';
      ring.style.opacity = '1';
      isVisible = true;
      if (!raf) tick();
    }
  });

  document.addEventListener('mouseleave', () => {
    orb.style.opacity  = '0';
    ring.style.opacity = '0';
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    orb.style.opacity  = '1';
    ring.style.opacity = '1';
    isVisible = true;
  });

  // Hover state on icons — grow + glow
  function onIconEnter() {
    isOverIcon = true;
    orb.style.transform  = 'translate(-50%, -50%) scale(2.8)';
    orb.style.boxShadow  = '0 0 22px 10px rgba(201,168,76,0.75), 0 0 50px 20px rgba(201,168,76,0.25)';
    ring.style.transform = 'translate(-50%, -50%) scale(1.8)';
    ring.style.borderColor = 'rgba(201,168,76,0.9)';
    document.body.style.cursor = 'none';
  }
  function onIconLeave() {
    isOverIcon = false;
    orb.style.transform  = 'translate(-50%, -50%) scale(1)';
    orb.style.boxShadow  = '0 0 12px 4px rgba(201,168,76,0.5)';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    ring.style.borderColor = 'rgba(201,168,76,0.45)';
    document.body.style.cursor = '';
  }

  // Attach to all existing + future icons via delegation
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(ICON_SELECTOR)) onIconEnter();
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(ICON_SELECTOR)) onIconLeave();
  });

  // Click ripple burst from icon centre
  document.addEventListener('click', (e) => {
    const iconEl = e.target.closest(ICON_SELECTOR);
    if (!iconEl) return;

    const rect = iconEl.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    spawnRipple(cx, cy);
  });

  function spawnRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999996;
      left: ${x}px;
      top:  ${y}px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid rgba(201,168,76,0.9);
      transform: translate(-50%, -50%) scale(0);
      animation: iconRipple 0.65s cubic-bezier(.2,.8,.5,1) forwards;
    `;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // Inject ripple keyframes once
  if (!document.getElementById('cursor-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'cursor-ripple-style';
    style.textContent = `
      @keyframes iconRipple {
        0%   { transform: translate(-50%,-50%) scale(0);   opacity: 1; }
        60%  { transform: translate(-50%,-50%) scale(4.5); opacity: 0.5; }
        100% { transform: translate(-50%,-50%) scale(7);   opacity: 0; }
      }
      /* Hide native cursor when custom is active */
      body.cursor-active * { cursor: none !important; }
    `;
    document.head.appendChild(style);
  }

  // Add pulse animation to the icons on scroll-in
  const iconObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const icon = entry.target;
        icon.style.transition = 'transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s ease';
        icon.addEventListener('mouseenter', () => {
          icon.style.transform = 'scale(1.15) rotate(6deg)';
          icon.style.boxShadow = '0 0 0 6px rgba(201,168,76,0.12), 0 8px 24px rgba(201,168,76,0.2)';
        });
        icon.addEventListener('mouseleave', () => {
          icon.style.transform = '';
          icon.style.boxShadow = '';
        });
        iconObserver.unobserve(icon);
      }
    });
  }, { threshold: 0.2 });

  // Observe all icon circles
  document.querySelectorAll('.step-icon, .stat-icon-circle, .pillar-icon, .cf-icon, .card-icon').forEach(el => {
    iconObserver.observe(el);
  });
}

