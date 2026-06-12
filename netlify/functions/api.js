const express    = require('express');
const serverless = require('serverless-http');
const path       = require('path');
const fs         = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── JSON storage (Netlify /tmp is writable per invocation; use env blob or tmp) ──
// For persistent storage we write to /tmp and seed from bundled snapshot.
// NOTE: /tmp resets between cold starts — suitable for demos.
// For production persistence, swap to Netlify Blobs or Supabase.

const DB_PATH = '/tmp/vertex-data.json';

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (_) {}
  return {
    inquiries: [], subscribers: [], appointments: [],
    nextInquiryId: 1, nextSubscriberId: 1, nextAppointmentId: 1
  };
}
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function sanitize(s) { return typeof s === 'string' ? s.trim().replace(/[<>]/g, '') : ''; }
const VALID_SLOTS = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

// ══════════════════════════════════════════════════════════════════════════════
// INQUIRY
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/inquiry', (req, res) => {
  try {
    const full_name        = sanitize(req.body.full_name || req.body.name);
    const email            = sanitize(req.body.email);
    const phone            = sanitize(req.body.phone || '');
    const service_interest = sanitize(req.body.service_interest || '');
    const message          = sanitize(req.body.message || '');

    if (!full_name || full_name.length < 2)
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, error: 'A valid email is required.' });

    const db = loadDB();
    const id = db.nextInquiryId++;
    db.inquiries.push({ id, full_name, email, phone, service_interest, message, created_at: new Date().toISOString() });
    saveDB(db);
    res.json({ success: true, message: 'Inquiry submitted. Our concierge will respond within 2 hours.', id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal error.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/newsletter', (req, res) => {
  try {
    const email = sanitize(req.body.email);
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, error: 'A valid email is required.' });

    const db = loadDB();
    if (db.subscribers.some(s => s.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ success: false, error: 'This email is already subscribed.' });

    const id = db.nextSubscriberId++;
    db.subscribers.push({ id, email, subscribed_at: new Date().toISOString() });
    saveDB(db);
    res.json({ success: true, message: 'Welcome to The Vertex Dispatch!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal error.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/appointments', (req, res) => {
  try {
    const full_name = sanitize(req.body.full_name || req.body.name);
    const email     = sanitize(req.body.email);
    const service   = sanitize(req.body.service || 'Vertex Travel');
    const date      = sanitize(req.body.date);
    const time      = sanitize(req.body.time);
    const timezone  = sanitize(req.body.timezone || 'GMT+5:30');

    if (!full_name || full_name.length < 2)
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, error: 'A valid email is required.' });
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res.status(400).json({ success: false, error: 'A valid date is required.' });
    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0,0,0,0);
    if (selectedDate < today)
      return res.status(400).json({ success: false, error: 'Please select a future date.' });
    if (!VALID_SLOTS.includes(time))
      return res.status(400).json({ success: false, error: 'Please select a valid time slot.' });

    const db = loadDB();
    if (db.appointments.find(a => a.date === date && a.time === time && a.status === 'confirmed'))
      return res.status(409).json({ success: false, error: 'This slot is already booked. Please choose another.' });

    const id  = db.nextAppointmentId++;
    const ref = 'VTX-' + String(id).padStart(5, '0');
    db.appointments.push({ id, full_name, email, service, date, time, timezone, status: 'confirmed', booking_ref: ref, created_at: new Date().toISOString() });
    saveDB(db);
    res.json({ success: true, message: `Appointment confirmed for ${date} at ${time}.`, booking_ref: ref, id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal error.' });
  }
});

app.get('/api/appointments/availability', (req, res) => {
  try {
    const date = sanitize(req.query.date || '');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return res.status(400).json({ success: false, error: 'Valid date required.' });
    const db     = loadDB();
    const booked = db.appointments.filter(a => a.date === date && a.status === 'confirmed').map(a => a.time);
    res.json({ success: true, date, allSlots: VALID_SLOTS, bookedSlots: booked, availableSlots: VALID_SLOTS.filter(s => !booked.includes(s)) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal error.' });
  }
});

app.get('/api/appointments', (req, res) => {
  const db = loadDB();
  res.json({ success: true, total: db.appointments.length, data: [...db.appointments].reverse() });
});

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/about/stats', (_, res) => {
  res.json({ success: true, data: {
    countries: 40, annualClients: 50000, compliance: ['RBI', 'FEMA'], satisfactionScore: 98.7,
    pillars: [
      { name: 'Vertex Travel',      description: 'Bespoke luxury tour experiences across 5 continents.', continents: 5 },
      { name: 'Vertex Finance',     description: 'Fast, secure currency exchange with cross-border transfers.', currencies: 80 },
      { name: 'Vertex Hospitality', description: 'Ultra-premium stays and private estates globally.', properties: 1200 }
    ],
    journey: ['Choose', 'Handle', 'Deliver', 'Experience']
  }});
});

app.post('/api/about/consultation', (req, res) => {
  try {
    const full_name = sanitize(req.body.full_name || req.body.name);
    const email     = sanitize(req.body.email);
    const company   = sanitize(req.body.company || '');
    const interest  = sanitize(req.body.interest || 'General Inquiry');
    const phone     = sanitize(req.body.phone || '');
    if (!full_name || full_name.length < 2) return res.status(400).json({ success: false, error: 'Full name required.' });
    if (!isValidEmail(email))              return res.status(400).json({ success: false, error: 'Valid email required.' });
    const db = loadDB();
    const id = db.nextInquiryId++;
    db.inquiries.push({ id, full_name, email, phone, service_interest: `[About] ${interest}`, message: company ? `Company: ${company}` : '', created_at: new Date().toISOString() });
    saveDB(db);
    res.json({ success: true, message: 'Consultation request received. Our team will contact you within 24 hours.', id });
  } catch (err) { res.status(500).json({ success: false, error: 'Internal error.' }); }
});

app.get('/api/about/testimonials', (_, res) => {
  res.json({ success: true, data: [
    { id: 1, name: 'Marcus Chen',     title: 'Managing Director, Aria Global',  initials: 'MC', rating: 5, quote: 'Vertex has redefined how our executive team manages cross-border travel.' },
    { id: 2, name: 'Elena Rodriguez', title: 'CFO, TechBridge EU',              initials: 'ER', rating: 5, quote: 'Vertex Finance saved us significant capital during our European expansion.' },
    { id: 3, name: 'Julian Thorne',   title: 'Founder, Thorne Estate Group',    initials: 'JT', rating: 5, quote: 'Vertex Hospitality delivers ultra-premium stays with corporate privacy.' }
  ]});
});

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD / ADMIN
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/dashboard', (_, res) => {
  const db = loadDB();
  res.json({ success: true, data: {
    totalInquiries: db.inquiries.length,
    totalSubscribers: db.subscribers.length,
    totalAppointments: db.appointments.length,
    recentInquiries: [...db.inquiries].reverse().slice(0, 5),
    recentAppointments: [...db.appointments].reverse().slice(0, 5)
  }});
});

app.get('/api/inquiries',   (_, res) => { const db = loadDB(); res.json({ success: true, total: db.inquiries.length,   data: [...db.inquiries].reverse() }); });
app.get('/api/subscribers', (_, res) => { const db = loadDB(); res.json({ success: true, total: db.subscribers.length, data: [...db.subscribers].reverse() }); });

// ── Export as Netlify Function ────────────────────────────────────────────────
module.exports.handler = serverless(app);
