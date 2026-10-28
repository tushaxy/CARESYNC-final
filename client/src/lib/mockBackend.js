import { doctorsSeed, medicinesSeed } from '../data/mockData.js';

// Haversine distance in km
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Red-flag emergency regex
const RED_FLAG_REGEX = /\b(chest pain|difficulty breathing|shortness of breath|breathless|unconscious|unconsciousness|passing out|seizure|seizures|convulsion|heavy bleeding|bleeding heavily|slurred speech|one side weakness|stroke|heart attack|suicide|suicidal|overdose|severe allergic reaction|anaphylaxis)\b/i;

// Storage helpers
const STORAGE_KEYS = {
  USERS: 'caresync_mock_users',
  APPOINTMENTS: 'caresync_mock_appointments',
  PRESCRIPTIONS: 'caresync_mock_prescriptions',
  ORDERS: 'caresync_mock_orders',
  AI_HISTORY: 'caresync_mock_ai_history',
};

const DEFAULT_USER = {
  id: 'usr-demo-001',
  _id: 'usr-demo-001',
  name: 'Tushar Demo',
  email: 'demo@caresync.in',
  password: 'Demo@123',
  phone: '+91 98765 43210',
  createdAt: new Date().toISOString(),
};

function getStorage(key, fallback = []) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage set failed:', e);
  }
}

// Ensure default user exists
function initMockDatabase() {
  const users = getStorage(STORAGE_KEYS.USERS, []);
  if (!users.some((u) => u.email === DEFAULT_USER.email)) {
    users.push(DEFAULT_USER);
    setStorage(STORAGE_KEYS.USERS, users);
  }

  // Seed sample past appointment if none exist
  const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
  if (appts.length === 0) {
    const sampleApptId = 'appt-init-001';
    const sampleRxId = 'rx-init-001';
    const sampleDoc = doctorsSeed[2]; // Dr. Priya Sharma (Dermatologist)

    const initialAppointment = {
      id: sampleApptId,
      _id: sampleApptId,
      userId: DEFAULT_USER.id,
      doctorId: sampleDoc.docId,
      doctor: sampleDoc,
      slotISO: new Date(Date.now() - 86400000 * 2).toISOString(),
      mode: 'video',
      fee: sampleDoc.videoConsultFee,
      status: 'completed',
      note: 'Follow-up consultation for skin rash',
      payment: {
        orderId: 'order_init_001',
        paymentId: 'pay_init_001',
        signature: 'sig_init_001',
      },
      prescriptionId: sampleRxId,
      jitsiRoom: `caresync-${sampleDoc.docId}-initial`,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    const initialPrescription = {
      id: sampleRxId,
      _id: sampleRxId,
      appointmentId: sampleApptId,
      doctorId: sampleDoc.docId,
      doctor: sampleDoc,
      userId: DEFAULT_USER.id,
      medicines: [
        {
          name: 'Cetirizine 10mg (strip of 10)',
          dosage: '10mg',
          frequency: 'Once daily after dinner',
          duration: '5 days',
          notes: 'Take with warm water before bed.',
        },
        {
          name: 'Calamine Lotion (100 ml)',
          dosage: 'Topical application',
          frequency: 'Twice daily',
          duration: '7 days',
          notes: 'Apply gently to affected skin surface.',
        },
      ],
      advice: [
        'Take prescribed doses at regular intervals.',
        'Avoid direct sun exposure while skin is sensitive.',
        'Drink plenty of fluids.',
      ],
      followUpDays: 7,
      issuedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      demoIssued: true,
    };

    setStorage(STORAGE_KEYS.APPOINTMENTS, [initialAppointment]);
    setStorage(STORAGE_KEYS.PRESCRIPTIONS, [initialPrescription]);
  }
}

// Execute initial database setup
initMockDatabase();

// Retrieve currently authenticated user from token or storage
function getCurrentUser(token) {
  const users = getStorage(STORAGE_KEYS.USERS, [DEFAULT_USER]);
  if (!token) {
    const storedToken = localStorage.getItem('caresync_token');
    if (!storedToken) return null;
    token = storedToken;
  }

  // Token is formatted like 'mock_jwt_token_<userId>' or generic
  const found = users.find((u) => token.includes(u.id) || token.includes(u._id) || token === 'mock_token_demo');
  return found || users[0] || DEFAULT_USER;
}

// Generate dynamic 7-day slots for a doctor
function generateSlotsForDoctor(docId) {
  const slots = [];
  const times = ['09:30:00', '11:00:00', '14:30:00', '16:00:00', '17:30:00', '19:00:00'];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    times.forEach((t, idx) => {
      const slotTime = new Date(`${dateStr}T${t}.000Z`);
      // Only include if in the future or today afternoon
      slots.push({
        _id: `slot_${docId}_${dayOffset}_${idx}`,
        id: `slot_${docId}_${dayOffset}_${idx}`,
        doctorId: docId,
        startsAt: slotTime.toISOString(),
        status: idx === 1 && dayOffset === 0 ? 'booked' : 'available',
      });
    });
  }

  return slots;
}

/**
 * Main Mock Backend Router
 * Matches incoming axios request config and returns simulated HTTP response { status, data }
 */
export async function handleMockRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  let url = config.url || '';

  // Strip baseURL or leading /api
  url = url.replace(/^https?:\/\/[^\/]+/, '');
  url = url.replace(/^\/?api/, '');
  if (!url.startsWith('/')) url = '/' + url;

  // Split path & query params
  const [path, queryString] = url.split('?');
  const urlParams = new URLSearchParams(queryString || '');
  const params = { ...config.params, ...Object.fromEntries(urlParams.entries()) };

  // Parse body if stringified
  let body = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Could be FormData or raw string
    }
  }

  // Extract auth token
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : localStorage.getItem('caresync_token');
  const currentUser = getCurrentUser(token);

  // Small synthetic delay for smooth natural feel (60ms)
  await new Promise((r) => setTimeout(r, 60));

  // ==========================================
  // AUTH ROUTES
  // ==========================================

  // POST /auth/register
  if (method === 'post' && path === '/auth/register') {
    const { name, email, password, phone } = body || {};
    if (!name || !email || !password) {
      return {
        status: 400,
        data: { message: 'Name, email, and password are required' },
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = getStorage(STORAGE_KEYS.USERS, []);
    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return {
        status: 400,
        data: { message: 'Email already registered. Please log in.' },
      };
    }

    const newId = 'usr_' + Date.now();
    const newUser = {
      id: newId,
      _id: newId,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);

    const newToken = `mock_jwt_token_${newUser.id}`;
    return {
      status: 201,
      data: {
        token: newToken,
        user: {
          id: newUser.id,
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    };
  }

  // POST /auth/login
  if (method === 'post' && path === '/auth/login') {
    const { email, password } = body || {};
    if (!email || !password) {
      return {
        status: 400,
        data: { message: 'Email and password are required' },
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const users = getStorage(STORAGE_KEYS.USERS, [DEFAULT_USER]);
    let user = users.find((u) => u.email === normalizedEmail);

    // Allow demo credentials if not yet in list
    if (!user && normalizedEmail === 'demo@caresync.in') {
      user = DEFAULT_USER;
    }

    if (!user || user.password !== password) {
      return {
        status: 401,
        data: { message: 'Invalid email or password' },
      };
    }

    const newToken = `mock_jwt_token_${user.id}`;
    return {
      status: 200,
      data: {
        token: newToken,
        user: {
          id: user.id,
          _id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    };
  }

  // GET /auth/me
  if (method === 'get' && path === '/auth/me') {
    if (!currentUser) {
      return {
        status: 401,
        data: { message: 'Not authenticated' },
      };
    }
    return {
      status: 200,
      data: {
        user: {
          id: currentUser.id || currentUser._id,
          _id: currentUser._id || currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          createdAt: currentUser.createdAt,
        },
      },
    };
  }

  // ==========================================
  // DOCTOR ROUTES
  // ==========================================

  // GET /doctors/meta
  if (method === 'get' && path === '/doctors/meta') {
    const counts = {};
    doctorsSeed.forEach((d) => {
      counts[d.specialization] = (counts[d.specialization] || 0) + 1;
    });

    const specialties = Object.entries(counts).map(([name, count]) => ({ name, count }));
    return {
      status: 200,
      data: {
        total: doctorsSeed.length,
        specialties,
      },
    };
  }

  // GET /doctors/:docId/slots
  const docSlotsMatch = path.match(/^\/doctors\/([^\/]+)\/slots$/);
  if (method === 'get' && docSlotsMatch) {
    const docId = docSlotsMatch[1];
    const slots = generateSlotsForDoctor(docId);
    return {
      status: 200,
      data: {
        doctorId: docId,
        slots,
      },
    };
  }

  // GET /doctors/:docId
  const docSingleMatch = path.match(/^\/doctors\/([^\/]+)$/);
  if (method === 'get' && docSingleMatch) {
    const docId = docSingleMatch[1];
    const doctor = doctorsSeed.find((d) => d.docId === docId || d._id === docId);
    if (!doctor) {
      return {
        status: 404,
        data: { message: 'Doctor not found' },
      };
    }
    return {
      status: 200,
      data: { doctor },
    };
  }

  // GET /doctors
  if (method === 'get' && path === '/doctors') {
    let result = [...doctorsSeed];
    const search = (params.search || '').trim().toLowerCase();
    const specialization = params.specialization;
    const maxFee = params.maxFee ? Number(params.maxFee) : null;
    const sort = params.sort || 'rating';
    const lat = params.lat ? parseFloat(params.lat) : 12.9716;
    const lng = params.lng ? parseFloat(params.lng) : 77.5946;

    if (search) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.specialization.toLowerCase().includes(search) ||
          d.clinicArea.toLowerCase().includes(search) ||
          (d.about && d.about.toLowerCase().includes(search))
      );
    }

    if (specialization && specialization !== 'All') {
      result = result.filter((d) => d.specialization.toLowerCase() === specialization.toLowerCase());
    }

    if (maxFee) {
      result = result.filter((d) => d.videoConsultFee <= maxFee);
    }

    // Attach Haversine distance
    result = result.map((doc) => {
      const distanceKm = getHaversineDistance(lat, lng, doc.location.lat, doc.location.lng);
      return { ...doc, distanceKm };
    });

    // Sorting
    result.sort((a, b) => {
      if (sort === 'fee') return a.videoConsultFee - b.videoConsultFee;
      if (sort === 'distance') return a.distanceKm - b.distanceKm;
      // Default: rating desc, distance asc, fee asc
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return a.videoConsultFee - b.videoConsultFee;
    });

    return {
      status: 200,
      data: {
        count: result.length,
        doctors: result,
      },
    };
  }

  // ==========================================
  // APPOINTMENT ROUTES
  // ==========================================

  // POST /appointments
  if (method === 'post' && path === '/appointments') {
    const { docId, slotISO, mode = 'video', note = '' } = body || {};
    if (!docId || !slotISO) {
      return {
        status: 400,
        data: { message: 'Doctor ID and Slot are required' },
      };
    }

    const doctor = doctorsSeed.find((d) => d.docId === docId);
    if (!doctor) {
      return {
        status: 404,
        data: { message: 'Doctor not found' },
      };
    }

    const fee = mode === 'clinic' ? doctor.clinicConsultFee : doctor.videoConsultFee;
    const apptId = 'appt_' + Date.now();
    const orderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    const newAppointment = {
      _id: apptId,
      id: apptId,
      userId: currentUser?.id || DEFAULT_USER.id,
      doctorId: docId,
      doctor: doctor,
      slotISO: new Date(slotISO).toISOString(),
      mode,
      fee,
      amount: fee,
      status: 'pending',
      note,
      payment: {
        orderId,
        paymentId: '',
        signature: '',
      },
      createdAt: new Date().toISOString(),
    };

    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    appts.unshift(newAppointment);
    setStorage(STORAGE_KEYS.APPOINTMENTS, appts);

    return {
      status: 201,
      data: {
        appointment: newAppointment,
        razorpayOrder: {
          id: orderId,
          amount: fee * 100,
          currency: 'INR',
        },
      },
    };
  }

  // GET /appointments/mine
  if (method === 'get' && path === '/appointments/mine') {
    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const userId = currentUser?.id || DEFAULT_USER.id;
    const userAppts = appts
      .filter((a) => a.userId === userId)
      .map((a) => {
        const doctor = doctorsSeed.find((d) => d.docId === a.doctorId) || a.doctor;
        return { ...a, doctor };
      });

    return {
      status: 200,
      data: { appointments: userAppts },
    };
  }

  // POST /appointments/:id/complete
  const apptCompleteMatch = path.match(/^\/appointments\/([^\/]+)\/complete$/);
  if (method === 'post' && apptCompleteMatch) {
    const apptId = apptCompleteMatch[1];
    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const appt = appts.find((a) => a.id === apptId || a._id === apptId);

    if (!appt) {
      return {
        status: 404,
        data: { message: 'Appointment not found' },
      };
    }

    appt.status = 'completed';

    // Issue e-prescription
    const rxId = appt.prescriptionId || `rx_${Date.now()}`;
    const doctor = doctorsSeed.find((d) => d.docId === appt.doctorId) || appt.doctor || doctorsSeed[0];
    const spec = doctor ? doctor.specialization : 'General Physician';

    let medicinesList = [
      {
        name: 'Cetirizine 10mg (strip of 10)',
        dosage: '10mg',
        frequency: 'Once daily after dinner',
        duration: '5 days',
        notes: 'Take with warm water.',
      },
      {
        name: 'Calamine Lotion (100 ml)',
        dosage: 'Topical application',
        frequency: 'Twice daily',
        duration: '7 days',
        notes: 'Apply gently to affected skin area.',
      },
    ];

    if (spec.includes('General') || spec.includes('Fever')) {
      medicinesList = [
        {
          name: 'Dolo 650 (Paracetamol 650mg, strip of 15)',
          dosage: '650mg',
          frequency: 'SOS (as needed, max 3 times/day)',
          duration: '3 days',
          notes: 'Take after meals for fever relief.',
        },
        {
          name: 'ORS Electrolyte Powder (10 sachets)',
          dosage: '1 sachet in 1 liter water',
          frequency: 'Sip throughout the day',
          duration: '3 days',
          notes: 'Maintains fluid balance and electrolyte levels.',
        },
      ];
    }

    const prescriptions = getStorage(STORAGE_KEYS.PRESCRIPTIONS, []);
    let rx = prescriptions.find((p) => p.id === rxId || p._id === rxId);
    if (!rx) {
      rx = {
        _id: rxId,
        id: rxId,
        appointmentId: apptId,
        doctorId: appt.doctorId,
        doctor: doctor,
        userId: appt.userId,
        medicines: medicinesList,
        advice: [
          'Take prescribed doses at regular intervals.',
          'Stay well hydrated with minimum 2.5L water daily.',
          'Avoid heavy physical exertion until recovery.',
          'Reach out via CareSync if any adverse reaction occurs.',
        ],
        followUpDays: 7,
        issuedAt: new Date().toISOString(),
        demoIssued: true,
      };
      prescriptions.unshift(rx);
      setStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
    }

    appt.prescriptionId = rxId;
    setStorage(STORAGE_KEYS.APPOINTMENTS, appts);

    return {
      status: 200,
      data: {
        message: 'Consultation marked as completed',
        appointment: appt,
        prescriptionId: rxId,
      },
    };
  }

  // GET /appointments/:id
  const apptSingleMatch = path.match(/^\/appointments\/([^\/]+)$/);
  if (method === 'get' && apptSingleMatch) {
    const apptId = apptSingleMatch[1];
    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const appt = appts.find((a) => a.id === apptId || a._id === apptId);

    if (!appt) {
      return {
        status: 404,
        data: { message: 'Appointment not found' },
      };
    }

    const doctor = doctorsSeed.find((d) => d.docId === appt.doctorId) || appt.doctor;
    return {
      status: 200,
      data: {
        appointment: { ...appt, doctor },
      },
    };
  }

  // ==========================================
  // PAYMENT ROUTES
  // ==========================================

  // POST /payments/verify
  if (method === 'post' && path === '/payments/verify') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    let appt = null;

    if (razorpay_order_id) {
      appt = appts.find((a) => a.payment?.orderId === razorpay_order_id);
    }
    if (!appt) {
      appt = appts.find((a) => a.status === 'pending');
    }
    if (!appt && appts.length > 0) {
      appt = appts[0];
    }

    if (!appt) {
      return {
        status: 404,
        data: { message: 'Appointment matching payment not found' },
      };
    }

    appt.status = 'paid';
    appt.payment = {
      orderId: razorpay_order_id || appt.payment?.orderId || `order_${Date.now()}`,
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      signature: razorpay_signature || 'verified_test_sig',
    };
    appt.jitsiRoom = `caresync-${appt.doctorId}-${Date.now().toString(36)}`;

    setStorage(STORAGE_KEYS.APPOINTMENTS, appts);

    const doctor = doctorsSeed.find((d) => d.docId === appt.doctorId) || appt.doctor;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Payment verified and appointment confirmed',
        appointment: { ...appt, doctor },
      },
    };
  }

  // ==========================================
  // PRESCRIPTION ROUTES
  // ==========================================

  // GET /prescriptions/mine
  if (method === 'get' && path === '/prescriptions/mine') {
    const prescriptions = getStorage(STORAGE_KEYS.PRESCRIPTIONS, []);
    const userId = currentUser?.id || DEFAULT_USER.id;
    const enriched = prescriptions
      .filter((p) => p.userId === userId)
      .map((p) => {
        const doctor = doctorsSeed.find((d) => d.docId === p.doctorId) || p.doctor;
        return { ...p, doctor };
      });

    return {
      status: 200,
      data: { prescriptions: enriched },
    };
  }

  // GET /prescriptions/:id
  const rxSingleMatch = path.match(/^\/prescriptions\/([^\/]+)$/);
  if (method === 'get' && rxSingleMatch) {
    const rxId = rxSingleMatch[1];
    const prescriptions = getStorage(STORAGE_KEYS.PRESCRIPTIONS, []);
    const rx = prescriptions.find((p) => p.id === rxId || p._id === rxId);

    if (!rx) {
      return {
        status: 404,
        data: { message: 'Prescription not found' },
      };
    }

    const doctor = doctorsSeed.find((d) => d.docId === rx.doctorId) || rx.doctor;
    const appts = getStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const appointment = appts.find((a) => a.id === rx.appointmentId || a._id === rx.appointmentId);

    return {
      status: 200,
      data: {
        prescription: { ...rx, doctor, appointment },
      },
    };
  }

  // ==========================================
  // PHARMACY & ORDERS ROUTES
  // ==========================================

  // GET /medicines
  if (method === 'get' && path === '/medicines') {
    let result = [...medicinesSeed];
    const search = (params.search || '').trim().toLowerCase();
    const category = params.category;

    if (category && category.toLowerCase() !== 'all') {
      result = result.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.brand.toLowerCase().includes(search) ||
          m.sku.toLowerCase().includes(search) ||
          (m.prescribedFor && m.prescribedFor.some((p) => p.toLowerCase().includes(search))) ||
          (m.blurb && m.blurb.toLowerCase().includes(search))
      );
    }

    return {
      status: 200,
      data: {
        count: result.length,
        medicines: result,
      },
    };
  }

  // GET /medicines/:sku
  const medSingleMatch = path.match(/^\/medicines\/([^\/]+)$/);
  if (method === 'get' && medSingleMatch) {
    const sku = medSingleMatch[1].toUpperCase();
    const medicine = medicinesSeed.find((m) => m.sku.toUpperCase() === sku);
    if (!medicine) {
      return {
        status: 404,
        data: { message: 'Medicine SKU not found' },
      };
    }
    return {
      status: 200,
      data: { medicine },
    };
  }

  // POST /orders
  if (method === 'post' && path === '/orders') {
    const { items, address } = body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        status: 400,
        data: { message: 'Cart items are required to place an order' },
      };
    }

    if (!address || !address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      return {
        status: 400,
        data: { message: 'Complete delivery address with phone and pincode is required' },
      };
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const med = medicinesSeed.find((m) => m.sku === item.sku);
      const price = med ? med.price : item.price || 50;
      const name = med ? med.name : item.name || item.sku;
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);

      subtotal += price * qty;
      validatedItems.push({
        sku: item.sku,
        name,
        qty,
        price,
      });
    }

    const deliveryFee = subtotal >= 599 ? 0 : 49;
    const total = subtotal + deliveryFee;
    const orderId = 'ord_' + Date.now();

    const newOrder = {
      _id: orderId,
      id: orderId,
      userId: currentUser?.id || DEFAULT_USER.id,
      items: validatedItems,
      subtotal,
      deliveryFee,
      total,
      address: {
        name: address.name.trim(),
        phone: address.phone.trim(),
        line1: address.line1.trim(),
        area: (address.area || '').trim(),
        city: address.city.trim(),
        pincode: address.pincode.trim(),
      },
      status: 'placed',
      paymentId: `cod_${Date.now()}`,
      placedAt: new Date().toISOString(),
    };

    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    orders.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, orders);

    return {
      status: 201,
      data: {
        success: true,
        order: newOrder,
      },
    };
  }

  // GET /orders/mine
  if (method === 'get' && path === '/orders/mine') {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const userId = currentUser?.id || DEFAULT_USER.id;
    const userOrders = orders.filter((o) => o.userId === userId);

    return {
      status: 200,
      data: { orders: userOrders },
    };
  }

  // ==========================================
  // AI TRIAGE ROUTES
  // ==========================================

  // POST /ai/triage
  if (method === 'post' && path === '/ai/triage') {
    let text = '';
    if (body instanceof FormData) {
      text = body.get('text') || '';
    } else if (body && typeof body === 'object') {
      text = body.text || '';
    } else if (typeof body === 'string') {
      text = body;
    }

    const t = text.toLowerCase();

    // 1. Red-flag emergency detection
    if (RED_FLAG_REGEX.test(t)) {
      const emergencyResult = {
        triage: 'emergency',
        confidence: 100,
        summary: 'Emergency indicators detected. Please seek emergency medical assistance immediately. Do not wait for an online appointment.',
        possibleCauses: [{ name: 'Acute cardiopulmonary or neurological event', likelihood: 'high' }],
        specialty: null,
        advice: [
          'Call emergency ambulance 112 or 108 immediately.',
          'Keep the patient sitting or lying down comfortably and remain calm.',
          'Do not give oral medication or fluids until emergency responders arrive.',
        ],
        otc: [],
        emergency: {
          show: true,
          message: 'Critical red-flag symptoms detected. Immediate in-person emergency hospital care is advised.',
          numbers: ['112', '108'],
        },
        doctors: [],
      };

      return {
        status: 200,
        data: emergencyResult,
      };
    }

    // 2. Specialty routing
    let specialty = 'General Physician';
    let summary = '';
    let causes = [];
    let advice = [];
    let otc = [];

    if (/rash|itch|bite|itching|skin|acne|urticaria/i.test(t)) {
      specialty = 'Dermatologist';
      summary =
        'Analyzing your symptoms and skin presentation: likely localized contact irritation or mild allergic dermatitis. A quick consult with a dermatologist will confirm the trigger.';
      causes = [
        { name: 'Contact Dermatitis', likelihood: 'high' },
        { name: 'Allergic Urticaria', likelihood: 'medium' },
      ];
      advice = [
        'Apply a cool, damp cloth to soothe itching immediately.',
        'Avoid scratching to prevent breaking the skin barrier.',
        'Wear loose, breathable cotton clothes.',
      ];
      otc = [
        { sku: 'MED-07', name: 'Calamine Lotion (100 ml)', why: 'Soothes itching and calms irritated skin', dosage: 'Follow pack label' },
        { sku: 'MED-02', name: 'Cetirizine 10mg (strip of 10)', why: 'Reduces allergic histamine itching', dosage: 'Follow pack label' },
      ];
    } else if (/acidity|heartburn|gas|indigestion|stomach/i.test(t)) {
      specialty = 'Gastroenterologist';
      summary =
        'Your symptoms commonly indicate mild hyperacidity or gastric irritation. Sip cool water and avoid spicy food right now.';
      causes = [
        { name: 'Gastric acid reflux', likelihood: 'high' },
        { name: 'Dietary indigestion', likelihood: 'medium' },
      ];
      advice = [
        'Drink a glass of cold milk or lukewarm water.',
        'Avoid lying flat immediately after eating.',
        'Eat small, light meals and limit spicy dishes.',
      ];
      otc = [
        { sku: 'MED-04', name: 'Gelusil Antacid Gel (200 ml)', why: 'Rapid cooling relief from acid reflux', dosage: 'Follow pack label' },
      ];
    } else if (/child|baby|infant|toddler|pediatric/i.test(t)) {
      specialty = 'Pediatrician';
      summary =
        'For pediatric concerns, consulting a certified pediatrician ensures tailored care and age-appropriate dosing.';
      causes = [{ name: 'Pediatric viral infection or growth milestone check', likelihood: 'medium' }];
      advice = [
        'Keep child comfortable and hydrated.',
        'Monitor temperature regularly using a digital thermometer.',
        'Consult pediatrician before administering any OTC medicines.',
      ];
      otc = [
        { sku: 'MED-03', name: 'ORS Electrolyte Powder (10 sachets)', why: 'Maintains fluid balance for kids', dosage: 'Follow pediatrician guidance' },
      ];
    } else if (/anxiety|depression|panic|sleep|stress|sadness/i.test(t)) {
      specialty = 'Psychiatrist';
      summary =
        'You have described emotional or mental health symptoms. Speaking with a compassionate psychiatrist or clinical therapist can offer clarity and structured coping tools.';
      causes = [{ name: 'Stress-induced anxiety or mood disturbance', likelihood: 'high' }];
      advice = [
        'Practice slow diaphragmatic breathing (4s inhale, 4s hold, 6s exhale).',
        'Step outside for a short walk in fresh air.',
        'Schedule a confidential session with a licensed specialist.',
      ];
    } else if (/heart|palpitation|pulse|hypertension|blood pressure/i.test(t)) {
      specialty = 'Cardiologist';
      summary =
        'Cardiovascular symptoms warrant specialized evaluation to monitor arterial rhythm and heart health accurately.';
      causes = [{ name: 'Cardiac rhythm variation or elevated blood pressure', likelihood: 'medium' }];
      advice = [
        'Sit upright and rest in a well-ventilated room.',
        'Avoid caffeine, energy drinks, and tobacco.',
        'Consult a cardiologist for formal ECG evaluation.',
      ];
    } else {
      specialty = 'General Physician';
      summary =
        'Your symptoms are commonly evaluated by a General Physician. A brief video consultation will help confirm the cause and establish a personalized recovery plan.';
      causes = [
        { name: 'Common seasonal viral response', likelihood: 'high' },
        { name: 'Mild upper respiratory tract infection', likelihood: 'medium' },
      ];
      advice = [
        'Rest adequately and monitor body temperature.',
        'Drink plenty of warm liquids and stay hydrated.',
        'Schedule a consultation if symptoms persist over 48 hours.',
      ];
      otc = [
        { sku: 'MED-01', name: 'Dolo 650 (Paracetamol 650mg, strip of 15)', why: 'Fast relief for mild fever and body aches', dosage: 'Follow pack label' },
        { sku: 'MED-05', name: 'Cough Relief Syrup (150 ml)', why: 'Soothes throat irritation', dosage: 'Follow pack label' },
      ];
    }

    // Match top doctors for this specialty
    let docs = doctorsSeed.filter((d) => d.specialization.toLowerCase() === specialty.toLowerCase());
    if (docs.length === 0) {
      docs = doctorsSeed.filter((d) => d.specialization === 'General Physician');
    }
    docs.sort((a, b) => b.rating - a.rating);
    const matchedDocs = docs.slice(0, 3);

    // Save to AI chat history
    const history = getStorage(STORAGE_KEYS.AI_HISTORY, []);
    const newSession = {
      _id: 'chat_' + Date.now(),
      userId: currentUser?.id || DEFAULT_USER.id,
      createdAt: new Date().toISOString(),
      messages: [
        { role: 'user', text },
        { role: 'assistant', text: summary },
      ],
      triage: {
        triage: 'doctor',
        summary,
        specialty,
        doctors: matchedDocs,
      },
    };
    history.unshift(newSession);
    setStorage(STORAGE_KEYS.AI_HISTORY, history);

    return {
      status: 200,
      data: {
        triage: 'doctor',
        confidence: 88,
        summary,
        possibleCauses: causes,
        specialty,
        advice,
        otc,
        emergency: { show: false, message: '', numbers: [] },
        doctors: matchedDocs,
        actionSuggestions: [
          'Prescription needed',
          'Post-visit opinion',
          'Second opinion',
        ],
      },
    };
  }

  // GET /ai/history
  if (method === 'get' && path === '/ai/history') {
    const history = getStorage(STORAGE_KEYS.AI_HISTORY, []);
    return {
      status: 200,
      data: { history },
    };
  }

  // Fallback 404
  return {
    status: 404,
    data: { message: `Endpoint ${method.toUpperCase()} ${path} not found` },
  };
}
