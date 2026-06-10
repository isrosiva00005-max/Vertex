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
