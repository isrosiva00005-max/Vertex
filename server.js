const express = require('express');
const path = require('path');
const {
  addInquiry, addSubscriber, addAppointment,
  getInquiries, getSubscribers, getAppointments, getAppointmentsByDate,
  getInquiryCount, getSubscriberCount, getAppointmentCount
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Email validation helper ────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Sanitize input helper ──────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

// ── Valid time slots ───────────────────────────────────────
const VALID_SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

// ══════════════════════════════════════════════════════════
// CONTACT / INQUIRY API
// ══════════════════════════════════════════════════════════

// POST /api/inquiry — Submit contact inquiry
app.post('/api/inquiry', (req, res) => {
  try {
    const full_name = sanitize(req.body.full_name || req.body.name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone || '');
    const service_interest = sanitize(req.body.service_interest || req.body.service || '');
    const message = sanitize(req.body.message || '');

    if (!full_name || full_name.length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required (min 2 characters).' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const result = addInquiry.run({ full_name, email, phone, service_interest, message });

    res.json({
      success: true,
      message: 'Your inquiry has been submitted successfully. Our concierge team will respond within 2 hours.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Inquiry error:', err.message);
    res.status(500).json({ success: false, error: 'An internal error occurred. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
// NEWSLETTER API
// ══════════════════════════════════════════════════════════

// POST /api/newsletter — Subscribe to newsletter
app.post('/api/newsletter', (req, res) => {
  try {
    const email = sanitize(req.body.email);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    addSubscriber.run({ email });

    res.json({
      success: true,
      message: 'You have been subscribed to The Vertex Dispatch. Welcome aboard.'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ success: false, error: 'This email is already subscribed.' });
    }
    console.error('Newsletter error:', err.message);
    res.status(500).json({ success: false, error: 'An internal error occurred. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
// APPOINTMENTS / BOOK NOW API
// ══════════════════════════════════════════════════════════

// POST /api/appointments — Book a bespoke appointment
app.post('/api/appointments', (req, res) => {
  try {
    const full_name = sanitize(req.body.full_name || req.body.name);
    const email     = sanitize(req.body.email);
    const service   = sanitize(req.body.service   || 'Vertex Travel');
    const date      = sanitize(req.body.date);       // YYYY-MM-DD
    const time      = sanitize(req.body.time);       // e.g. "11:30 AM"
    const timezone  = sanitize(req.body.timezone || 'GMT+5:30');

    // Validation
    if (!full_name || full_name.length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required (min 2 characters).' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'A valid date is required.' });
    }
    // Must not be in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ success: false, error: 'Please select a future date.' });
    }
    if (!time || !VALID_SLOTS.includes(time)) {
      return res.status(400).json({ success: false, error: 'Please select a valid time slot.' });
    }

    const result = addAppointment.run({ full_name, email, service, date, time, timezone });

    res.json({
      success: true,
      message: `Your bespoke appointment is confirmed for ${date} at ${time}. Our advisor will be in touch shortly.`,
      booking_ref: result.booking_ref,
      id: result.lastInsertRowid
    });
  } catch (err) {
    if (err.message === 'SLOT_TAKEN') {
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked. Please select another session.'
      });
    }
    console.error('Appointment error:', err.message);
    res.status(500).json({ success: false, error: 'An internal error occurred. Please try again.' });
  }
});

// GET /api/appointments/availability?date=YYYY-MM-DD — Get booked slots for a date
app.get('/api/appointments/availability', (req, res) => {
  try {
    const date = sanitize(req.query.date || '');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'A valid date query parameter is required.' });
    }
    const booked = getAppointmentsByDate.all(date).map(a => a.time);
    const available = VALID_SLOTS.filter(s => !booked.includes(s));
    res.json({ success: true, date, allSlots: VALID_SLOTS, bookedSlots: booked, availableSlots: available });
  } catch (err) {
    console.error('Availability error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve availability.' });
  }
});

// GET /api/appointments — All appointments (admin)
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = getAppointments.all();
    const { count } = getAppointmentCount.get();
    res.json({ success: true, total: count, data: appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve appointments.' });
  }
});

// ══════════════════════════════════════════════════════════
// ABOUT PAGE API
// ══════════════════════════════════════════════════════════

// GET /api/about/stats — Company stats for About page
app.get('/api/about/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      countries: 40,
      annualClients: 50000,
      compliance: ['RBI', 'FEMA'],
      satisfactionScore: 98.7,
      pillars: [
        { name: 'Vertex Travel',      description: 'Bespoke luxury tour experiences and custom adventures across 5 continents.', continents: 5 },
        { name: 'Vertex Finance',     description: 'Fast, secure, and transparent currency exchange with automated cross-border transfers.', currencies: 80 },
        { name: 'Vertex Hospitality', description: 'Exclusive corporate and retail access to ultra-premium stays and private estates.', properties: 1200 }
      ],
      journey: ['Choose', 'Handle', 'Deliver', 'Experience']
    }
  });
});

// POST /api/about/consultation — Book a consultation from About page
app.post('/api/about/consultation', (req, res) => {
  try {
    const full_name = sanitize(req.body.full_name || req.body.name);
    const email = sanitize(req.body.email);
    const company = sanitize(req.body.company || '');
    const interest = sanitize(req.body.interest || 'General Inquiry');
    const phone = sanitize(req.body.phone || '');

    if (!full_name || full_name.length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const message = company ? `Company: ${company}` : '';
    const result = addInquiry.run({ full_name, email, phone, service_interest: `[About Page] ${interest}`, message });

    res.json({
      success: true,
      message: 'Your consultation request has been received. Our team will contact you within 24 hours.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Consultation error:', err.message);
    res.status(500).json({ success: false, error: 'An internal error occurred. Please try again.' });
  }
});

// GET /api/about/testimonials — Fetch About page testimonials
app.get('/api/about/testimonials', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Marcus Chen',    title: 'Managing Director, Aria Global',  initials: 'MC', rating: 5, quote: 'Vertex has redefined how our executive team manages cross-border travel. The integration of finance and hospitality is truly unique.' },
      { id: 2, name: 'Elena Rodriguez',title: 'CFO, TechBridge EU',              initials: 'ER', rating: 5, quote: 'The currency solutions provided by Vertex Finance saved us significant capital during our expansion into the European market.' },
      { id: 3, name: 'Julian Thorne',  title: 'Founder, Thorne Estate Group',    initials: 'JT', rating: 5, quote: 'Finding ultra-premium stays that accommodate corporate privacy is difficult. Vertex Hospitality delivers every single time.' }
    ]
  });
});

// ══════════════════════════════════════════════════════════
// ADMIN API
// ══════════════════════════════════════════════════════════

app.get('/api/inquiries', (req, res) => {
  try {
    const inquiries = getInquiries.all();
    const { count } = getInquiryCount.get();
    res.json({ success: true, total: count, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve inquiries.' });
  }
});

app.get('/api/subscribers', (req, res) => {
  try {
    const subscribers = getSubscribers.all();
    const { count } = getSubscriberCount.get();
    res.json({ success: true, total: count, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve subscribers.' });
  }
});

app.get('/api/dashboard', (req, res) => {
  try {
    const { count: totalInquiries }    = getInquiryCount.get();
    const { count: totalSubscribers }  = getSubscriberCount.get();
    const { count: totalAppointments } = getAppointmentCount.get();
    const recentInquiries     = getInquiries.all().slice(0, 5);
    const recentAppointments  = getAppointments.all().slice(0, 5);
    res.json({
      success: true,
      data: { totalInquiries, totalSubscribers, totalAppointments, recentInquiries, recentAppointments }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard data.' });
  }
});

// ── Fallback ────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !path.extname(req.path)) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'Not found.' });
  }
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   Vertex Global Excellence — Server Live          ║
  ║   http://localhost:${PORT}                           ║
  ╠═══════════════════════════════════════════════════╣
  ║   Pages:   / | /about | /contact | /portfolio     ║
  ║   API:     /api/inquiry   /api/newsletter          ║
  ║            /api/appointments  (POST book / GET)   ║
  ║            /api/appointments/availability?date=   ║
  ║            /api/about/stats  /api/about/consult   ║
  ║            /api/dashboard (admin)                  ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
