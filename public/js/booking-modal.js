/**
 * Vertex Advisory Desk — Booking Modal
 * Injected into all pages. Opens when any .btn-book-now is clicked.
 */
(function () {
  'use strict';

  // ── Constants ───────────────────────────────────────────
  const SERVICES = [
    { id: 'travel',      label: 'Vertex Travel',      sub: 'Bespoke itineraries & charters' },
    { id: 'finance',     label: 'Vertex Finance',      sub: 'Global currency exchange & rate locks' },
    { id: 'hospitality', label: 'Vertex Hospitality',  sub: 'Exclusive villa & stay management' }
  ];

  const ALL_SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['MO','TU','WE','TH','FR','SA','SU'];

  // ── State ───────────────────────────────────────────────
  let state = {
    selectedService: 'travel',
    currentYear:  new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    selectedDate: null,     // 'YYYY-MM-DD'
    selectedTime: null,
    bookedSlots:  [],
    loading: false
  };

  // ── Inject Modal HTML ────────────────────────────────────
  function injectModal() {
    const overlay = document.createElement('div');
    overlay.id = 'booking-overlay';
    overlay.innerHTML = `
      <div id="booking-modal" role="dialog" aria-modal="true" aria-label="Vertex Advisory Desk Booking">
        <!-- LEFT PANEL -->
        <div class="bm-left">
          <div class="bm-left-header">
            <div class="bm-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="bm-brand">VERTEX ADVISORY DESK</span>
          </div>

          <div class="bm-services" role="listbox" aria-label="Select service">
            ${SERVICES.map(s => `
              <div class="bm-service-item ${s.id === state.selectedService ? 'bm-service-active' : ''}"
                   role="option" aria-selected="${s.id === state.selectedService}"
                   data-service="${s.id}" tabindex="0">
                <div class="bm-service-label">${s.label}</div>
                <div class="bm-service-sub">${s.sub}</div>
              </div>`).join('')}
          </div>

          <div class="bm-advisor">
            <div class="bm-advisor-avatar" aria-hidden="true">MS</div>
            <div class="bm-advisor-info">
              <div class="bm-advisor-name">Marcus Sterling</div>
              <div class="bm-advisor-title">SENIOR GLOBAL MOBILITY DIRECTOR</div>
            </div>
            <span class="bm-advisor-dot" aria-label="Online"></span>
          </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="bm-right">
          <!-- Close button -->
          <button class="bm-close" id="bm-close-btn" aria-label="Close booking modal">&times;</button>

          <!-- Timezone -->
          <div class="bm-timezone-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>GMT+5:30 · Chennai, Mumbai</span>
          </div>

          <!-- Calendar header -->
          <div class="bm-cal-header">
            <button class="bm-cal-nav" id="bm-prev-month" aria-label="Previous month">&#8249;</button>
            <div class="bm-cal-title" id="bm-cal-title">JUNE 2026</div>
            <button class="bm-cal-nav" id="bm-next-month" aria-label="Next month">&#8250;</button>
          </div>

          <!-- Day labels -->
          <div class="bm-cal-days">
            ${DAYS.map(d => `<div class="bm-day-label">${d}</div>`).join('')}
          </div>

          <!-- Calendar grid -->
          <div class="bm-cal-grid" id="bm-cal-grid"></div>

          <!-- Time slots -->
          <div class="bm-slots-label">SELECT AVAILABLE SESSION</div>
          <div class="bm-slots" id="bm-slots">
            ${ALL_SLOTS.map(s => `
              <button class="bm-slot" data-time="${s}" aria-pressed="false">${s}</button>`).join('')}
          </div>

          <!-- Form -->
          <div class="bm-form-row">
            <div class="bm-form-group">
              <label for="bm-name">FULL NAME</label>
              <input type="text" id="bm-name" placeholder="Johnathan W. Sterling" autocomplete="name">
            </div>
            <div class="bm-form-group">
              <label for="bm-email">EMAIL ADDRESS</label>
              <input type="email" id="bm-email" placeholder="j.sterling@global.com" autocomplete="email">
            </div>
          </div>

          <!-- Error message -->
          <div class="bm-error" id="bm-error" role="alert" aria-live="polite"></div>

          <!-- Submit -->
          <button class="bm-confirm-btn" id="bm-confirm-btn">
            <span id="bm-btn-text">CONFIRM BESPOKE APPOINTMENT</span>
            <svg id="bm-btn-spinner" class="bm-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" style="display:none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </button>

          <div class="bm-secure-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Encrypted connection. All data aligns with RBI financial frameworks and global privacy guidelines.
          </div>
        </div>
      </div>

      <!-- Success screen -->
      <div id="bm-success" style="display:none">
        <div class="bm-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 class="bm-success-title">Appointment Confirmed</h2>
        <p class="bm-success-msg" id="bm-success-msg"></p>
        <p class="bm-success-ref">Booking Reference: <strong id="bm-booking-ref"></strong></p>
        <button class="bm-confirm-btn" id="bm-success-close" style="max-width:260px;margin:0 auto">Close</button>
      </div>
    `;

    document.body.appendChild(overlay);
    injectStyles();
    bindEvents();
    renderCalendar();
  }

  // ── Inject Styles ────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Overlay */
      #booking-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(5,8,18,0.88);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: bmFadeIn 0.25s ease;
      }
      #booking-overlay.bm-open { display: flex; }
      @keyframes bmFadeIn { from { opacity:0 } to { opacity:1 } }

      /* Modal container */
      #booking-modal {
        display: flex;
        background: #0d1526;
        border-radius: 18px;
        overflow: hidden;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15);
        animation: bmSlideUp 0.3s cubic-bezier(.16,1,.3,1);
        position: relative;
      }
      @keyframes bmSlideUp { from { transform: translateY(28px); opacity:0 } to { transform: none; opacity:1 } }

      /* LEFT PANEL */
      .bm-left {
        width: 260px; min-width: 260px;
        background: #0b1020;
        border-right: 1px solid rgba(255,255,255,0.06);
        display: flex; flex-direction: column;
        padding: 28px 0;
      }
      .bm-left-header {
        display: flex; align-items: center; gap: 10px;
        padding: 0 22px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        margin-bottom: 20px;
      }
      .bm-logo-icon {
        width: 30px; height: 30px;
        background: rgba(201,168,76,0.15);
        border-radius: 7px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .bm-logo-icon svg { width: 15px; height: 15px; color: #C9A84C; }
      .bm-brand {
        font-size: 0.65rem; font-weight: 800; letter-spacing: 0.12em;
        color: #C9A84C; text-transform: uppercase; line-height: 1.2;
      }

      .bm-services { padding: 0 16px; flex: 1; }
      .bm-service-item {
        padding: 14px 12px;
        border-radius: 10px;
        border-left: 3px solid transparent;
        cursor: pointer; margin-bottom: 4px;
        transition: all 0.18s;
        outline: none;
      }
      .bm-service-item:hover { background: rgba(255,255,255,0.04); }
      .bm-service-item:focus-visible { box-shadow: 0 0 0 2px #C9A84C; }
      .bm-service-active {
        border-left-color: #C9A84C;
        background: rgba(201,168,76,0.06);
      }
      .bm-service-label {
        font-size: 0.88rem; font-weight: 700; color: #fff;
        margin-bottom: 3px;
      }
      .bm-service-active .bm-service-label { color: #e5c97b; }
      .bm-service-sub { font-size: 0.75rem; color: rgba(255,255,255,0.4); line-height: 1.3; }

      .bm-advisor {
        margin-top: auto; padding: 20px 18px 0;
        border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; align-items: center; gap: 10px;
        position: relative;
      }
      .bm-advisor-avatar {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg, #C9A84C, #8b6914);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.78rem; font-weight: 800; color: #0b1020;
        flex-shrink: 0;
      }
      .bm-advisor-name { font-size: 0.85rem; font-weight: 700; color: #fff; }
      .bm-advisor-title { font-size: 0.65rem; letter-spacing: 0.07em; color: rgba(255,255,255,0.4); text-transform: uppercase; }
      .bm-advisor-dot {
        position: absolute; top: 22px; left: 50px;
        width: 10px; height: 10px; border-radius: 50%;
        background: #22c55e;
        border: 2px solid #0b1020;
      }

      /* RIGHT PANEL */
      .bm-right {
        flex: 1; padding: 28px 28px 22px;
        position: relative;
        overflow-y: auto;
      }
      .bm-close {
        position: absolute; top: 16px; right: 16px;
        background: rgba(255,255,255,0.07);
        border: none; color: rgba(255,255,255,0.6);
        width: 32px; height: 32px; border-radius: 50%;
        font-size: 1.1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.18s; line-height: 1;
      }
      .bm-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

      .bm-timezone-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 0.82rem; color: rgba(255,255,255,0.55);
        margin-bottom: 18px; padding-top: 4px;
      }
      .bm-timezone-row svg { width: 14px; height: 14px; flex-shrink: 0; }

      /* Calendar */
      .bm-cal-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px;
      }
      .bm-cal-nav {
        background: rgba(255,255,255,0.07);
        border: none; color: rgba(255,255,255,0.7);
        width: 28px; height: 28px; border-radius: 50%;
        font-size: 1.1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.18s;
      }
      .bm-cal-nav:hover { background: rgba(201,168,76,0.2); color: #C9A84C; }
      .bm-cal-title { font-size: 0.85rem; font-weight: 800; color: #fff; letter-spacing: 0.1em; }

      .bm-cal-days {
        display: grid; grid-template-columns: repeat(7,1fr);
        margin-bottom: 6px;
      }
      .bm-day-label {
        text-align: center; font-size: 0.68rem; font-weight: 700;
        color: rgba(255,255,255,0.35); padding: 4px 0; letter-spacing: 0.04em;
      }
      .bm-cal-grid {
        display: grid; grid-template-columns: repeat(7,1fr);
        gap: 4px; margin-bottom: 18px;
      }
      .bm-cal-cell {
        aspect-ratio: 1; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.75);
        cursor: pointer; border: 1.5px solid rgba(255,255,255,0.08);
        transition: all 0.15s; background: transparent; user-select: none;
      }
      .bm-cal-cell:hover:not(.bm-cell-empty):not(.bm-cell-past) {
        border-color: rgba(201,168,76,0.5); color: #C9A84C;
        background: rgba(201,168,76,0.06);
      }
      .bm-cal-cell.bm-cell-today {
        border-color: rgba(201,168,76,0.4); color: #fff;
      }
      .bm-cal-cell.bm-cell-selected {
        background: #C9A84C; border-color: #C9A84C; color: #0b1020; font-weight: 800;
      }
      .bm-cal-cell.bm-cell-past {
        color: rgba(255,255,255,0.18); cursor: default; border-color: transparent;
      }
      .bm-cal-cell.bm-cell-empty { border: none; cursor: default; }

      /* Time slots */
      .bm-slots-label {
        font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;
        color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 10px;
      }
      .bm-slots {
        display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
        overflow-x: auto; padding-bottom: 4px;
      }
      .bm-slot {
        padding: 7px 14px; border-radius: 20px;
        border: 1.5px solid rgba(255,255,255,0.14);
        background: transparent; color: rgba(255,255,255,0.7);
        font-size: 0.8rem; font-weight: 600; font-family: inherit;
        cursor: pointer; white-space: nowrap;
        transition: all 0.18s;
      }
      .bm-slot:hover:not(.bm-slot-booked) { border-color: rgba(201,168,76,0.5); color: #C9A84C; }
      .bm-slot.bm-slot-selected { background: #C9A84C; border-color: #C9A84C; color: #0b1020; font-weight: 800; }
      .bm-slot.bm-slot-booked { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }

      /* Form */
      .bm-form-row {
        display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;
      }
      .bm-form-group { display: flex; flex-direction: column; gap: 5px; }
      .bm-form-group label {
        font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
        color: rgba(255,255,255,0.45); text-transform: uppercase;
      }
      .bm-form-group input {
        background: rgba(255,255,255,0.05);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 8px; padding: 10px 12px;
        font-size: 0.85rem; color: #fff; font-family: inherit;
        outline: none; transition: border-color 0.18s;
      }
      .bm-form-group input::placeholder { color: rgba(255,255,255,0.3); }
      .bm-form-group input:focus { border-color: rgba(201,168,76,0.6); }

      /* Error */
      .bm-error {
        font-size: 0.8rem; color: #f87171;
        margin-bottom: 10px; min-height: 18px;
        display: flex; align-items: center; gap: 6px;
      }

      /* Confirm button */
      .bm-confirm-btn {
        width: 100%; background: #C9A84C; color: #0b1020;
        border: none; border-radius: 10px; padding: 14px;
        font-size: 0.88rem; font-weight: 800; letter-spacing: 0.06em;
        font-family: inherit; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 10px;
        transition: background 0.18s, transform 0.15s;
        margin-bottom: 14px;
      }
      .bm-confirm-btn:hover { background: #e5c97b; transform: translateY(-1px); }
      .bm-confirm-btn:active { transform: none; }
      .bm-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      /* Spinner */
      .bm-spinner { width: 18px; height: 18px; animation: bmSpin 0.8s linear infinite; }
      @keyframes bmSpin { to { transform: rotate(360deg); } }

      /* Secure note */
      .bm-secure-note {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        font-size: 0.72rem; color: rgba(255,255,255,0.3); text-align: center;
        line-height: 1.4;
      }
      .bm-secure-note svg { width: 12px; height: 12px; flex-shrink: 0; }

      /* Success screen */
      #bm-success {
        flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 60px 40px;
        background: #0d1526;
        border-radius: 18px;
        width: 100%; max-width: 460px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15);
        animation: bmSlideUp 0.3s cubic-bezier(.16,1,.3,1);
      }
      #bm-success.bm-show { display: flex !important; }
      .bm-success-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(201,168,76,0.12);
        border: 2px solid #C9A84C;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px;
      }
      .bm-success-icon svg { width: 28px; height: 28px; color: #C9A84C; }
      .bm-success-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 10px; }
      .bm-success-msg { font-size: 0.88rem; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 16px; }
      .bm-success-ref { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 28px; }
      .bm-success-ref strong { color: #C9A84C; }

      /* Responsive */
      @media (max-width: 680px) {
        #booking-modal { flex-direction: column; }
        .bm-left { width: 100%; min-width: unset; padding-bottom: 0; }
        .bm-services { display: flex; gap: 8px; padding-bottom: 16px; }
        .bm-service-item { flex: 1; text-align: center; border-left: none; border-bottom: 3px solid transparent; border-radius: 8px; }
        .bm-service-active { border-bottom-color: #C9A84C; border-left: none; }
        .bm-form-row { grid-template-columns: 1fr; }
        .bm-advisor { padding-bottom: 16px; }
        .bm-right { padding: 20px 16px 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Calendar Rendering ───────────────────────────────────
  function renderCalendar() {
    const titleEl = document.getElementById('bm-cal-title');
    const grid    = document.getElementById('bm-cal-grid');
    if (!titleEl || !grid) return;

    const year  = state.currentYear;
    const month = state.currentMonth;

    titleEl.textContent = `${MONTHS[month].toUpperCase()} ${year}`;

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    // Convert Sunday=0 to Mon-based: Mon=0...Sun=6
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    grid.innerHTML = '';

    // Empty leading cells
    for (let i = 0; i < startOffset; i++) {
      const cell = document.createElement('div');
      cell.className = 'bm-cal-cell bm-cell-empty';
      grid.appendChild(cell);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const cell = document.createElement('div');
      cell.className = 'bm-cal-cell';
      cell.textContent = d;

      const iso = toISO(year, month, d);

      if (cellDate < today) {
        cell.classList.add('bm-cell-past');
      } else {
        if (cellDate.getTime() === today.getTime()) cell.classList.add('bm-cell-today');
        if (iso === state.selectedDate) cell.classList.add('bm-cell-selected');
        cell.addEventListener('click', () => selectDate(iso));
      }
      grid.appendChild(cell);
    }
  }

  function toISO(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // ── Select Date → fetch availability ────────────────────
  async function selectDate(iso) {
    state.selectedDate = iso;
    state.selectedTime = null;
    renderCalendar();
    renderSlots([], false); // reset to loading
    clearError();

    try {
      const res = await fetch(`/api/appointments/availability?date=${iso}`);
      const data = await res.json();
      if (data.success) {
        state.bookedSlots = data.bookedSlots || [];
      } else {
        state.bookedSlots = [];
      }
    } catch (_) {
      state.bookedSlots = [];
    }
    renderSlots(state.bookedSlots, true);
  }

  // ── Render Time Slots ────────────────────────────────────
  function renderSlots(booked, ready) {
    const container = document.getElementById('bm-slots');
    if (!container) return;
    container.innerHTML = ALL_SLOTS.map(s => {
      const isBooked   = booked.includes(s);
      const isSelected = s === state.selectedTime;
      let cls = 'bm-slot';
      if (isBooked)   cls += ' bm-slot-booked';
      if (isSelected) cls += ' bm-slot-selected';
      return `<button class="${cls}" data-time="${s}"
        aria-pressed="${isSelected}"
        ${isBooked ? 'disabled aria-disabled="true"' : ''}>${s}</button>`;
    }).join('');

    // Bind slot clicks
    container.querySelectorAll('.bm-slot:not(.bm-slot-booked)').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedTime = btn.dataset.time;
        renderSlots(state.bookedSlots, true);
        clearError();
      });
    });
  }

  // ── Bind Events ──────────────────────────────────────────
  function bindEvents() {
    // Close button
    document.getElementById('bm-close-btn').addEventListener('click', closeModal);
    // Click outside to close
    document.getElementById('booking-overlay').addEventListener('click', e => {
      if (e.target.id === 'booking-overlay') closeModal();
    });
    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });

    // Month navigation
    document.getElementById('bm-prev-month').addEventListener('click', () => {
      state.currentMonth--;
      if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
      state.selectedDate = null; state.selectedTime = null;
      renderCalendar(); renderSlots([], false);
    });
    document.getElementById('bm-next-month').addEventListener('click', () => {
      state.currentMonth++;
      if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
      state.selectedDate = null; state.selectedTime = null;
      renderCalendar(); renderSlots([], false);
    });

    // Service selection
    document.querySelectorAll('.bm-service-item').forEach(el => {
      el.addEventListener('click', () => {
        state.selectedService = el.dataset.service;
        document.querySelectorAll('.bm-service-item').forEach(i => {
          i.classList.remove('bm-service-active');
          i.setAttribute('aria-selected', 'false');
        });
        el.classList.add('bm-service-active');
        el.setAttribute('aria-selected', 'true');
        clearError();
      });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') el.click(); });
    });

    // Confirm button
    document.getElementById('bm-confirm-btn').addEventListener('click', handleSubmit);

    // Success close
    document.getElementById('bm-success-close').addEventListener('click', closeModal);

    // Open modal on all .btn-book-now clicks
    document.querySelectorAll('.btn-book-now').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openModal();
      });
    });
  }

  // ── Open / Close ─────────────────────────────────────────
  function openModal() {
    // Reset state
    state.selectedDate = null;
    state.selectedTime = null;
    state.selectedService = 'travel';
    state.currentYear  = new Date().getFullYear();
    state.currentMonth = new Date().getMonth();

    // Reset UI
    document.querySelectorAll('.bm-service-item').forEach(i => {
      i.classList.toggle('bm-service-active', i.dataset.service === 'travel');
      i.setAttribute('aria-selected', i.dataset.service === 'travel');
    });
    document.getElementById('bm-name').value  = '';
    document.getElementById('bm-email').value = '';
    clearError();
    renderCalendar();
    renderSlots([], false);

    // Show modal, hide success
    document.getElementById('booking-overlay').classList.add('bm-open');
    document.getElementById('booking-modal').style.display = 'flex';
    document.getElementById('bm-success').style.display = 'none';
    document.getElementById('bm-success').classList.remove('bm-show');
    document.body.style.overflow = 'hidden';

    // Focus trap
    setTimeout(() => document.getElementById('bm-name').focus(), 320);
  }

  function closeModal() {
    document.getElementById('booking-overlay').classList.remove('bm-open');
    document.body.style.overflow = '';
  }

  // ── Submit Handler ───────────────────────────────────────
  async function handleSubmit() {
    clearError();

    const name  = document.getElementById('bm-name').value.trim();
    const email = document.getElementById('bm-email').value.trim();

    if (name.length < 2)       return showError('Please enter your full name.');
    if (!isValidEmail(email))  return showError('Please enter a valid email address.');
    if (!state.selectedDate)   return showError('Please select a date from the calendar.');
    if (!state.selectedTime)   return showError('Please select an available time slot.');

    const serviceLabel = SERVICES.find(s => s.id === state.selectedService)?.label || 'Vertex Travel';

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email,
          service:  serviceLabel,
          date:     state.selectedDate,
          time:     state.selectedTime,
          timezone: 'GMT+5:30'
        })
      });

      const data = await res.json();

      if (data.success) {
        // Show success
        document.getElementById('booking-modal').style.display = 'none';
        document.getElementById('bm-success-msg').textContent = data.message;
        document.getElementById('bm-booking-ref').textContent = data.booking_ref;
        const successEl = document.getElementById('bm-success');
        successEl.style.display = 'flex';
        successEl.classList.add('bm-show');
      } else {
        showError(data.error || 'Something went wrong. Please try again.');
        // If slot was taken, refresh availability
        if (res.status === 409) selectDate(state.selectedDate);
      }
    } catch (_) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  function showError(msg) {
    const el = document.getElementById('bm-error');
    if (el) el.textContent = msg;
  }
  function clearError() {
    const el = document.getElementById('bm-error');
    if (el) el.textContent = '';
  }
  function setLoading(on) {
    state.loading = on;
    const btn     = document.getElementById('bm-confirm-btn');
    const text    = document.getElementById('bm-btn-text');
    const spinner = document.getElementById('bm-btn-spinner');
    if (!btn) return;
    btn.disabled         = on;
    text.style.display   = on ? 'none'   : 'inline';
    spinner.style.display = on ? 'inline' : 'none';
  }
  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  // ── Init ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModal);
  } else {
    injectModal();
  }

})();
