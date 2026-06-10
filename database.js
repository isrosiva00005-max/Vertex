const fs = require('fs');
const path = require('path');

// ── JSON File-Based Database (zero external dependencies) ──
const DB_PATH = path.join(__dirname, 'vertex-data.json');

// Initialize database structure
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('DB load error, reinitializing:', err.message);
  }
  return {
    inquiries: [], subscribers: [], appointments: [],
    nextInquiryId: 1, nextSubscriberId: 1, nextAppointmentId: 1
  };
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Ensure DB file exists and has all required keys on startup
(function initDB() {
  const db = loadDB();
  let changed = false;
  if (!db.appointments)       { db.appointments = [];        changed = true; }
  if (!db.nextAppointmentId)  { db.nextAppointmentId = 1;    changed = true; }
  if (changed) saveDB(db);
})();

// ── Database Operations ────────────────────────────────────

const addInquiry = {
  run(params) {
    const db = loadDB();
    const inquiry = {
      id: db.nextInquiryId++,
      full_name: params.full_name,
      email: params.email,
      phone: params.phone || '',
      service_interest: params.service_interest || '',
      message: params.message || '',
      created_at: new Date().toISOString()
    };
    db.inquiries.push(inquiry);
    saveDB(db);
    return { lastInsertRowid: inquiry.id };
  }
};

const addSubscriber = {
  run(params) {
    const db = loadDB();
    // Check for duplicates
    const exists = db.subscribers.some(s => s.email.toLowerCase() === params.email.toLowerCase());
    if (exists) {
      throw new Error('UNIQUE constraint failed: subscribers.email');
    }
    const subscriber = {
      id: db.nextSubscriberId++,
      email: params.email,
      subscribed_at: new Date().toISOString()
    };
    db.subscribers.push(subscriber);
    saveDB(db);
    return { lastInsertRowid: subscriber.id };
  }
};

const addAppointment = {
  run(params) {
    const db = loadDB();
    // Check for duplicate slot (same date + time already booked)
    const conflict = db.appointments.find(
      a => a.date === params.date && a.time === params.time && a.status === 'confirmed'
    );
    if (conflict) {
      throw new Error('SLOT_TAKEN');
    }
    const appointment = {
      id: db.nextAppointmentId++,
      full_name: params.full_name,
      email: params.email,
      service: params.service,
      date: params.date,
      time: params.time,
      timezone: params.timezone || 'GMT+5:30',
      status: 'confirmed',
      booking_ref: 'VTX-' + String(db.nextAppointmentId - 1).padStart(5, '0'),
      created_at: new Date().toISOString()
    };
    db.appointments.push(appointment);
    saveDB(db);
    return { lastInsertRowid: appointment.id, booking_ref: appointment.booking_ref };
  }
};

const getAppointments = {
  all() {
    const db = loadDB();
    return [...db.appointments].reverse();
  }
};

const getAppointmentsByDate = {
  all(date) {
    const db = loadDB();
    return db.appointments.filter(a => a.date === date && a.status === 'confirmed');
  }
};

const getInquiries = {
  all() {
    const db = loadDB();
    return [...db.inquiries].reverse(); // newest first
  }
};

const getSubscribers = {
  all() {
    const db = loadDB();
    return [...db.subscribers].reverse();
  }
};

const getInquiryCount = {
  get() {
    const db = loadDB();
    return { count: db.inquiries.length };
  }
};

const getSubscriberCount = {
  get() {
    const db = loadDB();
    return { count: db.subscribers.length };
  }
};

const getAppointmentCount = {
  get() {
    const db = loadDB();
    return { count: db.appointments.length };
  }
};

module.exports = {
  addInquiry,
  addSubscriber,
  addAppointment,
  getInquiries,
  getSubscribers,
  getAppointments,
  getAppointmentsByDate,
  getInquiryCount,
  getSubscriberCount,
  getAppointmentCount
};
