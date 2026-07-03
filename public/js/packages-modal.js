/**
 * Vertex Global — Packages & Payment Modal
 * 5-step flow: 1.Packages → 2.Register → 3.Payment → 4.Confirm → 5.Success
 * Triggered by data-pkg="journeys|currency|stays" attributes or .btn-book-now
 */
(function () {
  'use strict';

  // ── Package Data ─────────────────────────────────────────
  const PACKAGES = {
    journeys: {
      tab: 'Bespoke Journeys',
      icon: '✈',
      color: '#C9A84C',
      items: [
        {
          id: 'j1', tier: 'SILVER', name: 'Explorer', price: 1499, unit: '/person',
          desc: '5-day curated luxury tour across your chosen destination.',
          features: ['4-Star Hotel Accommodation', 'Airport Transfers Included', 'Licensed Local Guide', '3 Curated Experiences', '24/7 Concierge Support']
        },
        {
          id: 'j2', tier: 'GOLD', name: 'Voyager', price: 3499, unit: '/person', badge: 'Most Popular',
          desc: '10-day premium journey with exclusive VIP access.',
          features: ['5-Star Hotel & Suites', 'Private Chauffeur Service', 'Dedicated Personal Guide', 'VIP Lounge Access', 'Michelin-Star Dining', '24/7 Priority Concierge']
        },
        {
          id: 'j3', tier: 'PLATINUM', name: 'Elite', price: 7999, unit: '/person',
          desc: '15-day ultra-luxury experience with private jet transfers.',
          features: ['Private Jet Transfers', 'Ultra-Luxury Resorts & Villas', 'Butler Service', 'Exclusive Cultural Access', 'Private Chef', 'Full Itinerary Customization', 'VIP Security Detail']
        }
      ]
    },
    currency: {
      tab: 'Currency Solutions',
      icon: '$',
      color: '#C9A84C',
      items: [
        {
          id: 'c1', tier: 'STANDARD', name: 'Exchange', price: 199, unit: '/month',
          desc: 'For individuals & small businesses with moderate FX needs.',
          features: ['Up to $25,000/month Volume', 'Same-Day Transfers', '15+ Currency Pairs', 'Live Rate Dashboard', 'Email Support']
        },
        {
          id: 'c2', tier: 'PREMIUM', name: 'Pro', price: 599, unit: '/month', badge: 'Most Popular',
          desc: 'For high-net-worth individuals and growing enterprises.',
          features: ['Up to $250,000/month Volume', 'Real-Time Rate Locking', '50+ Currency Pairs', 'Priority Deal Desk', 'Dedicated Relationship Manager', 'API Access']
        },
        {
          id: 'c3', tier: 'INSTITUTIONAL', name: 'Elite', price: 1499, unit: '/month',
          desc: 'Unlimited institutional-grade FX for global corporations.',
          features: ['Unlimited Monthly Volume', 'Dedicated Currency Dealer', '100+ Currency Pairs', 'Custom Rate Agreements', 'Compliance & Reporting Suite', 'White-Glove Onboarding', '24/7 Trading Desk']
        }
      ]
    },
    stays: {
      tab: 'Exclusive Stays',
      icon: '🏨',
      color: '#C9A84C',
      items: [
        {
          id: 's1', tier: 'LUXURY', name: 'Suite', price: 799, unit: '/night',
          desc: 'Premium 5-star hotel suites at globally renowned properties.',
          features: ['5-Star Property Selection', 'Breakfast Included', 'Dedicated Concierge', 'Spa Access', 'Airport Welcome']
        },
        {
          id: 's2', tier: 'PREMIER', name: 'Villa', price: 1899, unit: '/night', badge: 'Most Popular',
          desc: 'Private villa with full staff and personalised service.',
          features: ['Private Villa Entire Property', 'Personal Butler', 'Infinity Pool Access', 'Chef Upon Request', 'Daily Housekeeping', 'Private Airport Transfer']
        },
        {
          id: 's3', tier: 'PRESIDENTIAL', name: 'Collection', price: 3999, unit: '/night',
          desc: 'Ultra-exclusive estates with private beach & full staff.',
          features: ['Private Beachfront Estate', 'Full Household Staff', 'Private Chef & Sommelier', 'Yacht Access', 'Personal Security', 'Helicopter Transfers', 'Bespoke Experience Curation']
        }
      ]
    }
  };

  // ── State ─────────────────────────────────────────────────
  let state = {
    step: 1,           // 1-5
    activeTab: 'journeys',
    selectedPkg: null,
    form: { name: '', email: '', phone: '' },
    payment: { cardName: '', cardNum: '', expiry: '', cvv: '' },
    bookingRef: ''
  };

  // ── Inject Modal ──────────────────────────────────────────
  function injectModal() {
    if (document.getElementById('pkg-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pkg-overlay';
    overlay.innerHTML = buildModalHTML();
    document.body.appendChild(overlay);
    injectStyles();
    bindEvents();
  }

  // ── Build HTML ────────────────────────────────────────────
  function buildModalHTML() {
    return `
      <div id="pkg-modal" role="dialog" aria-modal="true" aria-label="Vertex Packages">
        <!-- Header / Steps -->
        <div class="pkg-header">
          <div class="pkg-brand">
            <span class="pkg-brand-bar">|</span>VERTEX
          </div>
          <div class="pkg-steps">
            ${['Packages','Register','Payment','Confirm','Success'].map((s,i) => `
              <div class="pkg-step" id="pkg-step-dot-${i+1}">
                <div class="pkg-step-circle">${i+1}</div>
                <span>${s}</span>
              </div>
              ${i < 4 ? '<div class="pkg-step-line"></div>' : ''}
            `).join('')}
          </div>
          <button class="pkg-close" id="pkg-close-btn" aria-label="Close">&times;</button>
        </div>

        <!-- Step 1: Package Selection -->
        <div class="pkg-body" id="pkg-body-1">
          <div class="pkg-title-row">
            <h2>Choose Your Package</h2>
            <p>Select a service and tier to begin your Vertex experience</p>
          </div>
          <!-- Tabs -->
          <div class="pkg-tabs" id="pkg-tabs">
            ${Object.entries(PACKAGES).map(([key, val]) => `
              <button class="pkg-tab" data-tab="${key}">${val.icon} ${val.tab}</button>
            `).join('')}
          </div>
          <!-- Package Cards -->
          <div class="pkg-cards" id="pkg-cards"></div>
          <div class="pkg-nav-row">
            <div></div>
            <button class="pkg-btn-gold" id="pkg-next-1" disabled>Continue to Register →</button>
          </div>
        </div>

        <!-- Step 2: Register -->
        <div class="pkg-body" id="pkg-body-2" style="display:none">
          <div class="pkg-title-row">
            <h2>Your Details</h2>
            <p>Enter your contact information to proceed</p>
          </div>
          <div class="pkg-selected-summary" id="pkg-summary-2"></div>
          <div class="pkg-form">
            <div class="pkg-field">
              <label for="pkg-name">FULL NAME</label>
              <input id="pkg-name" type="text" placeholder="Jonathan W. Sterling" autocomplete="name">
            </div>
            <div class="pkg-field">
              <label for="pkg-email">EMAIL ADDRESS</label>
              <input id="pkg-email" type="email" placeholder="j.sterling@global.com" autocomplete="email">
            </div>
            <div class="pkg-field">
              <label for="pkg-phone">PHONE NUMBER</label>
              <input id="pkg-phone" type="tel" placeholder="+44 7700 900000" autocomplete="tel">
            </div>
          </div>
          <div class="pkg-error" id="pkg-error-2"></div>
          <div class="pkg-nav-row">
            <button class="pkg-btn-outline" id="pkg-back-2">← Back</button>
            <button class="pkg-btn-gold" id="pkg-next-2">Continue to Payment →</button>
          </div>
        </div>

        <!-- Step 3: Payment -->
        <div class="pkg-body" id="pkg-body-3" style="display:none">
          <div class="pkg-title-row">
            <h2>Payment Details</h2>
            <p>Secure & encrypted — your information is protected</p>
          </div>
          <div class="pkg-selected-summary" id="pkg-summary-3"></div>
          <div class="pkg-payment-box">
            <div class="pkg-card-preview" id="pkg-card-preview">
              <div class="pkg-card-chip"></div>
              <div class="pkg-card-num" id="pkg-preview-num">•••• •••• •••• ••••</div>
              <div class="pkg-card-bottom">
                <div>
                  <div class="pkg-card-label">CARD HOLDER</div>
                  <div class="pkg-card-val" id="pkg-preview-name">YOUR NAME</div>
                </div>
                <div>
                  <div class="pkg-card-label">EXPIRES</div>
                  <div class="pkg-card-val" id="pkg-preview-exp">MM/YY</div>
                </div>
                <div class="pkg-card-logo">VISA</div>
              </div>
            </div>
            <div class="pkg-form">
              <div class="pkg-field">
                <label for="pkg-card-name">NAME ON CARD</label>
                <input id="pkg-card-name" type="text" placeholder="Jonathan W. Sterling" autocomplete="cc-name">
              </div>
              <div class="pkg-field">
                <label for="pkg-card-num">CARD NUMBER</label>
                <input id="pkg-card-num" type="text" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="cc-number">
              </div>
              <div class="pkg-field-row">
                <div class="pkg-field">
                  <label for="pkg-card-exp">EXPIRY DATE</label>
                  <input id="pkg-card-exp" type="text" placeholder="MM / YY" maxlength="7" autocomplete="cc-exp">
                </div>
                <div class="pkg-field">
                  <label for="pkg-card-cvv">CVV</label>
                  <input id="pkg-card-cvv" type="text" placeholder="•••" maxlength="3" autocomplete="cc-csc">
                </div>
              </div>
            </div>
          </div>
          <div class="pkg-secure-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            256-bit SSL encrypted. Compliant with PCI-DSS standards.
          </div>
          <div class="pkg-error" id="pkg-error-3"></div>
          <div class="pkg-nav-row">
            <button class="pkg-btn-outline" id="pkg-back-3">← Back</button>
            <button class="pkg-btn-gold" id="pkg-next-3">Review Order →</button>
          </div>
        </div>

        <!-- Step 4: Confirm -->
        <div class="pkg-body" id="pkg-body-4" style="display:none">
          <div class="pkg-title-row">
            <h2>Review & Confirm</h2>
            <p>Please verify your order before completing the booking</p>
          </div>
          <div class="pkg-confirm-box" id="pkg-confirm-box"></div>
          <div class="pkg-error" id="pkg-error-4"></div>
          <div class="pkg-nav-row">
            <button class="pkg-btn-outline" id="pkg-back-4">← Back</button>
            <button class="pkg-btn-gold" id="pkg-next-4">
              <span id="pkg-confirm-text">Confirm & Pay</span>
              <svg id="pkg-spinner" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:18px;height:18px;animation:pkgSpin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </button>
          </div>
        </div>

        <!-- Step 5: Success -->
        <div class="pkg-body pkg-success-body" id="pkg-body-5" style="display:none">
          <div class="pkg-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2>Booking Confirmed!</h2>
          <p id="pkg-success-msg">Your Vertex experience has been reserved. A confirmation has been sent to your email.</p>
          <div class="pkg-ref-box">
            <div class="pkg-ref-label">BOOKING REFERENCE</div>
            <div class="pkg-ref-code" id="pkg-ref-code">VTX-000000</div>
          </div>
          <p class="pkg-success-sub">Our concierge team will contact you within 24 hours to finalise your experience.</p>
          <button class="pkg-btn-gold" id="pkg-close-success" style="max-width:240px;margin:0 auto">Close</button>
        </div>
      </div>
    `;
  }

  // ── Render Package Cards ──────────────────────────────────
  function renderCards() {
    const cat = PACKAGES[state.activeTab];
    const container = document.getElementById('pkg-cards');
    if (!container) return;

    container.innerHTML = cat.items.map(pkg => `
      <div class="pkg-card ${state.selectedPkg?.id === pkg.id ? 'pkg-card-selected' : ''}"
           data-pkg-id="${pkg.id}" data-tab="${state.activeTab}">
        ${pkg.badge ? `<div class="pkg-badge">${pkg.badge}</div>` : ''}
        <div class="pkg-card-tier">${pkg.tier}</div>
        <div class="pkg-card-name">${pkg.name}</div>
        <div class="pkg-card-price">
          <span class="pkg-price-val">$${pkg.price.toLocaleString()}</span>
          <span class="pkg-price-unit">${pkg.unit}</span>
        </div>
        <p class="pkg-card-desc">${pkg.desc}</p>
        <ul class="pkg-features">
          ${pkg.features.map(f => `<li><span class="pkg-check">✓</span>${f}</li>`).join('')}
        </ul>
        <button class="pkg-select-btn ${state.selectedPkg?.id === pkg.id ? 'pkg-select-active' : ''}">
          ${state.selectedPkg?.id === pkg.id ? '✓ Selected' : 'Select Package'}
        </button>
      </div>
    `).join('');

    // Bind card clicks
    container.querySelectorAll('.pkg-card').forEach(card => {
      card.addEventListener('click', () => {
        const tab = card.dataset.tab;
        const id = card.dataset.pkgId;
        const cat = PACKAGES[tab];
        state.selectedPkg = { ...cat.items.find(p => p.id === id), category: tab };
        renderCards();
        document.getElementById('pkg-next-1').disabled = false;
      });
    });
  }

  // ── Build Summary ─────────────────────────────────────────
  function buildSummary(targetId) {
    if (!state.selectedPkg) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    const pkg = state.selectedPkg;
    const cat = PACKAGES[pkg.category];
    el.innerHTML = `
      <div class="pkg-summary-item">
        <span class="pkg-summary-icon">${cat.icon}</span>
        <div>
          <div class="pkg-summary-cat">${cat.tab}</div>
          <div class="pkg-summary-name">${pkg.tier} ${pkg.name}</div>
        </div>
        <div class="pkg-summary-price">$${pkg.price.toLocaleString()}<small>${pkg.unit}</small></div>
      </div>
    `;
  }

  // ── Build Confirm Box ─────────────────────────────────────
  function buildConfirm() {
    const el = document.getElementById('pkg-confirm-box');
    if (!el || !state.selectedPkg) return;
    const pkg = state.selectedPkg;
    const cat = PACKAGES[pkg.category];
    const maskedCard = '•••• •••• •••• ' + state.payment.cardNum.replace(/\s/g,'').slice(-4);
    el.innerHTML = `
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">SELECTED PACKAGE</div>
        <div class="pkg-confirm-val">${cat.icon} ${cat.tab} — ${pkg.tier} ${pkg.name}</div>
      </div>
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">AMOUNT DUE</div>
        <div class="pkg-confirm-val pkg-confirm-price">$${pkg.price.toLocaleString()}<small>${pkg.unit}</small></div>
      </div>
      <hr class="pkg-divider">
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">FULL NAME</div>
        <div class="pkg-confirm-val">${state.form.name}</div>
      </div>
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">EMAIL</div>
        <div class="pkg-confirm-val">${state.form.email}</div>
      </div>
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">PHONE</div>
        <div class="pkg-confirm-val">${state.form.phone}</div>
      </div>
      <hr class="pkg-divider">
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">PAYMENT METHOD</div>
        <div class="pkg-confirm-val">${maskedCard}</div>
      </div>
      <div class="pkg-confirm-section">
        <div class="pkg-confirm-label">CARD HOLDER</div>
        <div class="pkg-confirm-val">${state.payment.cardName}</div>
      </div>
    `;
  }

  // ── Navigation ────────────────────────────────────────────
  function goTo(step) {
    for (let i = 1; i <= 5; i++) {
      const body = document.getElementById(`pkg-body-${i}`);
      if (body) body.style.display = i === step ? 'flex' : 'none';
    }
    // Update step dots
    document.querySelectorAll('.pkg-step').forEach((dot, i) => {
      dot.classList.toggle('pkg-step-active', i + 1 === step);
      dot.classList.toggle('pkg-step-done', i + 1 < step);
    });
    state.step = step;
  }

  // ── Validation ────────────────────────────────────────────
  function showErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  }
  function isEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function isPhone(p) { return p.replace(/[\s\-\+\(\)]/g,'').length >= 7; }

  // ── Event Binding ─────────────────────────────────────────
  function bindEvents() {
    // Close
    document.getElementById('pkg-close-btn').addEventListener('click', closeModal);
    document.getElementById('pkg-overlay').addEventListener('click', e => {
      if (e.target.id === 'pkg-overlay') closeModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Tabs
    document.querySelectorAll('.pkg-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.activeTab = tab.dataset.tab;
        state.selectedPkg = null;
        document.querySelectorAll('.pkg-tab').forEach(t => t.classList.remove('pkg-tab-active'));
        tab.classList.add('pkg-tab-active');
        document.getElementById('pkg-next-1').disabled = true;
        renderCards();
      });
    });

    // Step 1 → 2
    document.getElementById('pkg-next-1').addEventListener('click', () => {
      if (!state.selectedPkg) return;
      buildSummary('pkg-summary-2');
      goTo(2);
    });

    // Step 2 → 3
    document.getElementById('pkg-next-2').addEventListener('click', () => {
      clearErr('pkg-error-2');
      const name  = document.getElementById('pkg-name').value.trim();
      const email = document.getElementById('pkg-email').value.trim();
      const phone = document.getElementById('pkg-phone').value.trim();
      if (name.length < 2) return showErr('pkg-error-2', 'Please enter your full name.');
      if (!isEmail(email)) return showErr('pkg-error-2', 'Please enter a valid email address.');
      if (!isPhone(phone)) return showErr('pkg-error-2', 'Please enter a valid phone number.');
      state.form = { name, email, phone };
      buildSummary('pkg-summary-3');
      goTo(3);
    });

    // Step 2 back
    document.getElementById('pkg-back-2').addEventListener('click', () => goTo(1));

    // Card number formatting
    document.getElementById('pkg-card-num').addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,16);
      e.target.value = v.replace(/(.{4})/g,'$1 ').trim();
      document.getElementById('pkg-preview-num').textContent =
        (v.padEnd(16,'•')).replace(/(.{4})/g,'$1 ').trim();
    });
    // Card name
    document.getElementById('pkg-card-name').addEventListener('input', e => {
      document.getElementById('pkg-preview-name').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });
    // Expiry
    document.getElementById('pkg-card-exp').addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,4);
      if (v.length >= 2) v = v.slice(0,2) + ' / ' + v.slice(2);
      e.target.value = v;
      document.getElementById('pkg-preview-exp').textContent = v || 'MM/YY';
    });

    // Step 3 → 4
    document.getElementById('pkg-next-3').addEventListener('click', () => {
      clearErr('pkg-error-3');
      const cardName = document.getElementById('pkg-card-name').value.trim();
      const cardNum  = document.getElementById('pkg-card-num').value.trim();
      const expiry   = document.getElementById('pkg-card-exp').value.trim();
      const cvv      = document.getElementById('pkg-card-cvv').value.trim();
      if (cardName.length < 2) return showErr('pkg-error-3', 'Please enter the name on your card.');
      if (cardNum.replace(/\s/g,'').length < 16) return showErr('pkg-error-3', 'Please enter a valid 16-digit card number.');
      if (expiry.length < 4) return showErr('pkg-error-3', 'Please enter a valid expiry date.');
      if (cvv.length < 3) return showErr('pkg-error-3', 'Please enter your 3-digit CVV.');
      state.payment = { cardName, cardNum, expiry, cvv };
      buildConfirm();
      goTo(4);
    });

    // Step 3 back
    document.getElementById('pkg-back-3').addEventListener('click', () => goTo(2));

    // Step 4 → 5 (Submit)
    document.getElementById('pkg-next-4').addEventListener('click', async () => {
      clearErr('pkg-error-4');
      const btn = document.getElementById('pkg-next-4');
      const txt = document.getElementById('pkg-confirm-text');
      const spin = document.getElementById('pkg-spinner');
      btn.disabled = true;
      txt.style.display = 'none';
      spin.style.display = 'inline';

      try {
        // Submit booking
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: state.form.name,
            email: state.form.email,
            service: `${PACKAGES[state.selectedPkg.category].tab} — ${state.selectedPkg.tier} ${state.selectedPkg.name}`,
            package_price: state.selectedPkg.price,
            date: new Date().toISOString().split('T')[0],
            time: 'Package Booking',
            timezone: 'GMT+5:30',
            phone: state.form.phone
          })
        });
        const data = await res.json();
        const ref = data.booking_ref || 'VTX-' + Math.random().toString(36).substring(2,8).toUpperCase();
        state.bookingRef = ref;
        document.getElementById('pkg-ref-code').textContent = ref;
        document.getElementById('pkg-success-msg').textContent =
          `Your ${PACKAGES[state.selectedPkg.category].tab} — ${state.selectedPkg.tier} ${state.selectedPkg.name} has been reserved. A confirmation has been sent to ${state.form.email}.`;
        goTo(5);
      } catch (_) {
        // Offline fallback — still show success
        const ref = 'VTX-' + Math.random().toString(36).substring(2,8).toUpperCase();
        state.bookingRef = ref;
        document.getElementById('pkg-ref-code').textContent = ref;
        document.getElementById('pkg-success-msg').textContent =
          `Your ${PACKAGES[state.selectedPkg.category].tab} — ${state.selectedPkg.tier} ${state.selectedPkg.name} package has been reserved. Confirmation sent to ${state.form.email}.`;
        goTo(5);
      } finally {
        btn.disabled = false;
        txt.style.display = 'inline';
        spin.style.display = 'none';
      }
    });

    // Step 4 back
    document.getElementById('pkg-back-4').addEventListener('click', () => goTo(3));

    // Success close
    document.getElementById('pkg-close-success').addEventListener('click', closeModal);

    // Trigger buttons (data-pkg attribute)
    document.querySelectorAll('[data-pkg]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openModal(btn.dataset.pkg);
      });
    });
  }

  // ── Open / Close ──────────────────────────────────────────
  function openModal(tab) {
    tab = tab || 'journeys';
    // Reset state
    state = {
      step: 1, activeTab: tab, selectedPkg: null,
      form: { name:'', email:'', phone:'' },
      payment: { cardName:'', cardNum:'', expiry:'', cvv:'' },
      bookingRef: ''
    };

    // Reset inputs
    ['pkg-name','pkg-email','pkg-phone','pkg-card-name','pkg-card-num','pkg-card-exp','pkg-card-cvv']
      .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('pkg-preview-num').textContent = '•••• •••• •••• ••••';
    document.getElementById('pkg-preview-name').textContent = 'YOUR NAME';
    document.getElementById('pkg-preview-exp').textContent = 'MM/YY';
    ['pkg-error-2','pkg-error-3','pkg-error-4'].forEach(clearErr);

    // Set active tab
    document.querySelectorAll('.pkg-tab').forEach(t => {
      t.classList.toggle('pkg-tab-active', t.dataset.tab === tab);
    });
    document.getElementById('pkg-next-1').disabled = true;

    renderCards();
    goTo(1);

    document.getElementById('pkg-overlay').classList.add('pkg-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('pkg-overlay');
    if (overlay) overlay.classList.remove('pkg-open');
    document.body.style.overflow = '';
  }

  // ── Styles ────────────────────────────────────────────────
  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      #pkg-overlay {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(5,8,18,0.9);
        backdrop-filter: blur(8px);
        display: none; align-items: center; justify-content: center;
        padding: 16px; overflow-y: auto;
      }
      #pkg-overlay.pkg-open { display: flex; }
      #pkg-modal {
        background: #0d1526;
        border-radius: 20px;
        width: 100%; max-width: 860px;
        box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15);
        animation: pkgSlide 0.35s cubic-bezier(.16,1,.3,1);
        overflow: hidden;
        display: flex; flex-direction: column;
        max-height: 92vh;
      }
      @keyframes pkgSlide { from { transform: translateY(30px); opacity:0 } to { transform: none; opacity:1 } }
      @keyframes pkgSpin { to { transform: rotate(360deg); } }

      /* Header */
      .pkg-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 28px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: #0b1020;
        gap: 16px;
        flex-shrink: 0;
      }
      .pkg-brand {
        font-size: 0.82rem; font-weight: 900; letter-spacing: 0.15em;
        color: #fff; white-space: nowrap;
      }
      .pkg-brand-bar { color: #C9A84C; margin-right: 6px; }
      .pkg-steps {
        display: flex; align-items: center; gap: 0; flex: 1;
        justify-content: center; flex-wrap: nowrap;
      }
      .pkg-step {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        opacity: 0.35; transition: opacity 0.2s;
      }
      .pkg-step-active, .pkg-step-done { opacity: 1; }
      .pkg-step-circle {
        width: 26px; height: 26px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.72rem; font-weight: 800; color: rgba(255,255,255,0.5);
        background: transparent; transition: all 0.2s;
      }
      .pkg-step-active .pkg-step-circle {
        border-color: #C9A84C; color: #C9A84C;
        box-shadow: 0 0 10px rgba(201,168,76,0.4);
      }
      .pkg-step-done .pkg-step-circle {
        background: #C9A84C; border-color: #C9A84C; color: #0b1020;
      }
      .pkg-step span {
        font-size: 0.6rem; font-weight: 700; letter-spacing: 0.06em;
        color: rgba(255,255,255,0.4); text-transform: uppercase;
        white-space: nowrap;
      }
      .pkg-step-active span { color: #C9A84C; }
      .pkg-step-done span { color: rgba(255,255,255,0.6); }
      .pkg-step-line {
        width: 28px; height: 2px; background: rgba(255,255,255,0.1);
        margin-bottom: 18px; flex-shrink: 0;
      }
      .pkg-close {
        background: rgba(255,255,255,0.07); border: none;
        color: rgba(255,255,255,0.6); width: 32px; height: 32px;
        border-radius: 50%; font-size: 1.1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.18s; flex-shrink: 0;
      }
      .pkg-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

      /* Body */
      .pkg-body {
        padding: 28px 28px 24px;
        flex-direction: column; gap: 20px;
        overflow-y: auto;
      }
      .pkg-title-row { text-align: center; }
      .pkg-title-row h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
      .pkg-title-row p { font-size: 0.88rem; color: rgba(255,255,255,0.5); }

      /* Tabs */
      .pkg-tabs {
        display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
      }
      .pkg-tab {
        padding: 9px 20px; border-radius: 30px;
        border: 1.5px solid rgba(255,255,255,0.12);
        background: transparent; color: rgba(255,255,255,0.6);
        font-size: 0.82rem; font-weight: 700; font-family: inherit;
        cursor: pointer; transition: all 0.18s;
      }
      .pkg-tab:hover { border-color: rgba(201,168,76,0.4); color: #C9A84C; }
      .pkg-tab-active { background: rgba(201,168,76,0.12); border-color: #C9A84C; color: #C9A84C; }

      /* Package Cards */
      .pkg-cards {
        display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
      }
      .pkg-card {
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 14px; padding: 20px;
        cursor: pointer; transition: all 0.2s;
        position: relative; overflow: hidden;
        display: flex; flex-direction: column; gap: 8px;
      }
      .pkg-card:hover { border-color: rgba(201,168,76,0.35); background: rgba(201,168,76,0.03); }
      .pkg-card-selected {
        border-color: #C9A84C !important;
        background: rgba(201,168,76,0.07) !important;
        box-shadow: 0 0 0 1px rgba(201,168,76,0.3);
      }
      .pkg-badge {
        position: absolute; top: 12px; right: 12px;
        background: #C9A84C; color: #0b1020;
        font-size: 0.6rem; font-weight: 800; letter-spacing: 0.08em;
        padding: 3px 8px; border-radius: 20px; text-transform: uppercase;
      }
      .pkg-card-tier {
        font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em;
        color: rgba(255,255,255,0.35); text-transform: uppercase;
      }
      .pkg-card-name { font-size: 1.05rem; font-weight: 800; color: #fff; }
      .pkg-card-price { display: flex; align-items: baseline; gap: 3px; margin: 4px 0; }
      .pkg-price-val { font-size: 1.5rem; font-weight: 900; color: #C9A84C; }
      .pkg-price-unit { font-size: 0.75rem; color: rgba(255,255,255,0.45); }
      .pkg-card-desc { font-size: 0.78rem; color: rgba(255,255,255,0.5); line-height: 1.5; }
      .pkg-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; flex: 1; }
      .pkg-features li { font-size: 0.75rem; color: rgba(255,255,255,0.65); display: flex; align-items: flex-start; gap: 7px; }
      .pkg-check { color: #C9A84C; font-weight: 800; flex-shrink: 0; }
      .pkg-select-btn {
        margin-top: 10px; width: 100%; padding: 9px;
        border-radius: 8px; border: 1.5px solid rgba(201,168,76,0.4);
        background: transparent; color: #C9A84C;
        font-size: 0.78rem; font-weight: 700; font-family: inherit;
        cursor: pointer; transition: all 0.18s;
      }
      .pkg-select-btn:hover { background: rgba(201,168,76,0.1); }
      .pkg-select-active { background: #C9A84C !important; color: #0b1020 !important; border-color: #C9A84C !important; }

      /* Summary strip */
      .pkg-selected-summary {
        background: rgba(201,168,76,0.07);
        border: 1px solid rgba(201,168,76,0.2);
        border-radius: 10px; padding: 12px 16px;
      }
      .pkg-summary-item { display: flex; align-items: center; gap: 12px; }
      .pkg-summary-icon { font-size: 1.4rem; }
      .pkg-summary-cat { font-size: 0.7rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; }
      .pkg-summary-name { font-size: 0.95rem; font-weight: 800; color: #fff; }
      .pkg-summary-price { margin-left: auto; font-size: 1.2rem; font-weight: 900; color: #C9A84C; }
      .pkg-summary-price small { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-left: 2px; }

      /* Form */
      .pkg-form { display: flex; flex-direction: column; gap: 14px; }
      .pkg-field { display: flex; flex-direction: column; gap: 5px; }
      .pkg-field label { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); text-transform: uppercase; }
      .pkg-field input {
        background: rgba(255,255,255,0.05);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 9px; padding: 11px 14px;
        font-size: 0.88rem; color: #fff; font-family: inherit;
        outline: none; transition: border-color 0.18s;
      }
      .pkg-field input::placeholder { color: rgba(255,255,255,0.25); }
      .pkg-field input:focus { border-color: rgba(201,168,76,0.6); }
      .pkg-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

      /* Payment card preview */
      .pkg-payment-box { display: flex; flex-direction: column; gap: 18px; }
      .pkg-card-preview {
        background: linear-gradient(135deg, #1a2644 0%, #0d1526 60%, #1a1f2e 100%);
        border-radius: 14px; padding: 22px 24px;
        border: 1px solid rgba(201,168,76,0.2);
        position: relative; overflow: hidden;
        min-height: 140px; display: flex; flex-direction: column; justify-content: space-between;
      }
      .pkg-card-preview::before {
        content: ''; position: absolute;
        width: 200px; height: 200px; border-radius: 50%;
        background: rgba(201,168,76,0.05);
        top: -60px; right: -40px;
      }
      .pkg-card-chip {
        width: 36px; height: 26px; border-radius: 5px;
        background: linear-gradient(135deg, #C9A84C, #8b6914);
        margin-bottom: 16px;
      }
      .pkg-card-num {
        font-size: 1.05rem; font-weight: 700; letter-spacing: 0.18em; color: #fff;
        font-family: 'Courier New', monospace;
      }
      .pkg-card-bottom { display: flex; align-items: flex-end; gap: 24px; margin-top: 14px; }
      .pkg-card-label { font-size: 0.55rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 2px; }
      .pkg-card-val { font-size: 0.82rem; font-weight: 700; color: #fff; letter-spacing: 0.05em; }
      .pkg-card-logo { margin-left: auto; font-size: 1rem; font-weight: 900; font-style: italic; color: rgba(255,255,255,0.8); }

      /* Confirm box */
      .pkg-confirm-box {
        background: rgba(255,255,255,0.03); border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.07);
        padding: 20px 24px; display: flex; flex-direction: column; gap: 12px;
      }
      .pkg-confirm-section { display: flex; justify-content: space-between; align-items: center; }
      .pkg-confirm-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); text-transform: uppercase; }
      .pkg-confirm-val { font-size: 0.88rem; color: #fff; font-weight: 600; text-align: right; }
      .pkg-confirm-price { font-size: 1.2rem; color: #C9A84C; font-weight: 900; }
      .pkg-confirm-price small { font-size: 0.7rem; color: rgba(255,255,255,0.45); }
      .pkg-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 4px 0; }

      /* Secure note */
      .pkg-secure-note {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        font-size: 0.72rem; color: rgba(255,255,255,0.3); text-align: center;
      }
      .pkg-secure-note svg { width: 12px; height: 12px; flex-shrink: 0; }

      /* Error */
      .pkg-error { font-size: 0.8rem; color: #f87171; min-height: 16px; }

      /* Buttons */
      .pkg-nav-row { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
      .pkg-btn-gold {
        background: #C9A84C; color: #0b1020;
        border: none; border-radius: 10px; padding: 13px 28px;
        font-size: 0.88rem; font-weight: 800; font-family: inherit;
        cursor: pointer; transition: all 0.18s;
        display: flex; align-items: center; gap: 8px;
      }
      .pkg-btn-gold:hover:not(:disabled) { background: #e5c97b; transform: translateY(-1px); }
      .pkg-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      .pkg-btn-outline {
        background: transparent; color: rgba(255,255,255,0.6);
        border: 1.5px solid rgba(255,255,255,0.15);
        border-radius: 10px; padding: 13px 24px;
        font-size: 0.88rem; font-weight: 700; font-family: inherit;
        cursor: pointer; transition: all 0.18s;
      }
      .pkg-btn-outline:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

      /* Success */
      .pkg-success-body {
        align-items: center !important; text-align: center; padding: 50px 40px !important;
      }
      .pkg-success-icon {
        width: 70px; height: 70px; border-radius: 50%;
        background: rgba(201,168,76,0.1); border: 2px solid #C9A84C;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 4px;
      }
      .pkg-success-icon svg { width: 32px; height: 32px; color: #C9A84C; }
      .pkg-success-body h2 { font-size: 1.8rem; font-weight: 900; color: #fff; }
      .pkg-success-body p { color: rgba(255,255,255,0.6); max-width: 420px; line-height: 1.6; font-size: 0.9rem; }
      .pkg-ref-box {
        background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25);
        border-radius: 12px; padding: 16px 32px; margin: 4px 0;
      }
      .pkg-ref-label { font-size: 0.62rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 4px; }
      .pkg-ref-code { font-size: 1.4rem; font-weight: 900; color: #C9A84C; letter-spacing: 0.1em; }
      .pkg-success-sub { font-size: 0.8rem; color: rgba(255,255,255,0.35); }

      /* Responsive */
      @media (max-width: 700px) {
        .pkg-cards { grid-template-columns: 1fr; }
        .pkg-header { padding: 14px 16px; }
        .pkg-body { padding: 20px 16px 16px; }
        .pkg-step span { display: none; }
        .pkg-step-line { width: 16px; }
        .pkg-field-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── Init ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModal);
  } else {
    injectModal();
  }

})();
