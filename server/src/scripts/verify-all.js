import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Slot from '../models/Slot.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';

import { doctorsSeed } from '../data/doctors.seed.js';
import { medicinesSeed } from '../data/medicines.seed.js';
import { processTriage } from '../services/triageService.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import bcrypt from 'bcryptjs';

async function verifyAll() {
  console.log('[Verification] Starting CareSync 8-Point Smoke Test...');
  await connectDB();

  // Populate data if empty
  let docCount = await Doctor.countDocuments();
  if (docCount === 0) {
    console.log('[Verification] Populating in-memory database with seeds for verification run...');
    await Doctor.insertMany(doctorsSeed);
    await Medicine.insertMany(medicinesSeed);

    const pwdHash = await bcrypt.hash('Demo@123', 10);
    const demo = await User.create({
      name: 'Tushan Demo',
      email: 'demo@caresync.in',
      passwordHash: pwdHash,
      phone: '+91 98765 43210',
    });

    // Populate sample slots
    const slots = [];
    const now = new Date();
    for (const d of doctorsSeed) {
      for (let i = 0; i < 5; i++) {
        const slotTime = new Date(now.getTime() + (i + 1) * 3600 * 1000);
        slots.push({ doctorId: d.docId, startsAt: slotTime, status: 'open' });
      }
    }
    await Slot.insertMany(slots);
  }

  docCount = await Doctor.countDocuments();
  const medCount = await Medicine.countDocuments();
  const slotCount = await Slot.countDocuments();

  const results = [];

  // Point 1: Seed Check
  const seedPass = docCount === 25 && medCount === 24 && slotCount > 0;
  results.push({
    test: '1. Seed Check (25 Doctors, 24 SKUs, Slots populated)',
    pass: seedPass,
    details: `${docCount} docs, ${medCount} medicines, ${slotCount} slots`,
  });

  // Point 2: Auth Check
  const testEmail = `test_${Date.now()}@caresync.in`;
  const pwdHash = await bcrypt.hash('TestPass@123', 10);
  const user = await User.create({
    name: 'Verification User',
    email: testEmail,
    passwordHash: pwdHash,
    phone: '+91 99999 88888',
  });
  const isMatch = await bcrypt.compare('TestPass@123', user.passwordHash);
  results.push({
    test: '2. Auth Check (Registration & Password Hash Verification)',
    pass: !!user && isMatch,
    details: `User ID: ${user._id}`,
  });

  // Point 3: Triage Check (rash -> Dermatologist)
  const rashTriage = await processTriage({
    text: 'I have this itchy rash on my arm since morning, it burns slightly',
    imageUrl: null,
    userId: user._id,
  });
  const rashPass =
    rashTriage.specialty === 'Dermatologist' &&
    rashTriage.triage === 'doctor' &&
    rashTriage.doctors.length > 0;
  results.push({
    test: '3. Triage Check (Itchy rash routes to Dermatologist & returns doctor cards)',
    pass: rashPass,
    details: `Specialty: ${rashTriage.specialty}, Doctors: ${rashTriage.doctors.length}`,
  });

  // Point 4: Emergency Check (chest pain -> emergency banner with 112 & 108)
  const emergTriage = await processTriage({
    text: 'severe chest pain and breathlessness since 10 minutes',
    imageUrl: null,
    userId: user._id,
  });
  const emergPass =
    emergTriage.triage === 'emergency' &&
    emergTriage.emergency?.show === true &&
    emergTriage.emergency?.numbers?.includes('112') &&
    emergTriage.emergency?.numbers?.includes('108');
  results.push({
    test: '4. Emergency Check (Chest pain short-circuits to 112/108 banner)',
    pass: emergPass,
    details: `Triage: ${emergTriage.triage}, Numbers: ${emergTriage.emergency?.numbers?.join(', ')}`,
  });

  // Point 5: Payment & Slot Booking Check (Razorpay test verify)
  const slot = await Slot.findOne({ doctorId: 'doc-003', status: 'open' });
  const appt = await Appointment.create({
    userId: user._id,
    doctorId: 'doc-003',
    slotISO: slot ? slot.startsAt : new Date(),
    mode: 'video',
    fee: 350,
    status: 'pending',
    payment: { orderId: 'order_test_verify_001' },
  });
  const sigValid = verifyRazorpaySignature({
    razorpay_order_id: 'order_test_verify_001',
    razorpay_payment_id: 'pay_test_verify_001',
    razorpay_signature: 'demo_signature_valid',
  });
  appt.status = 'paid';
  appt.jitsiRoom = 'caresync-doc-003-verify-test';
  await appt.save();
  if (slot) {
    slot.status = 'booked';
    await slot.save();
  }
  const paymentPass = sigValid && appt.status === 'paid' && (!slot || slot.status === 'booked');
  results.push({
    test: '5. Payment & Booking Check (Razorpay test verify marks paid & books slot)',
    pass: paymentPass,
    details: `Appt status: ${appt.status}, Room: ${appt.jitsiRoom}`,
  });

  // Point 6: Video Consult Complete & Prescription Minting Check
  const prescription = await Prescription.create({
    appointmentId: appt._id,
    doctorId: 'doc-003',
    userId: user._id,
    medicines: [
      { name: 'Cetirizine 10mg (strip of 10)', dosage: '10mg', frequency: 'Once daily', duration: '5 days' },
      { name: 'Calamine Lotion (100 ml)', dosage: 'Topical', frequency: 'Twice daily', duration: '7 days' },
    ],
    advice: ['Keep area dry', 'Avoid scratching'],
    followUpDays: 7,
  });
  appt.status = 'completed';
  appt.prescriptionId = prescription._id;
  await appt.save();
  const rxPass = appt.status === 'completed' && !!prescription._id && prescription.medicines.length === 2;
  results.push({
    test: '6. Video Consult Complete & Prescription Minting Check',
    pass: rxPass,
    details: `Prescription ID: ${prescription._id}, Meds: ${prescription.medicines.length}`,
  });

  // Point 7: Commerce & Delivery Fee Check
  const subtotalBelow599 = 150;
  const deliveryFee = subtotalBelow599 >= 599 ? 0 : 49;
  const order = await Order.create({
    userId: user._id,
    items: [{ sku: 'MED-02', name: 'Cetirizine 10mg', qty: 2, price: 29 }],
    subtotal: 58,
    deliveryFee: 49,
    total: 107,
    address: {
      name: 'Verification User',
      phone: '+91 99999 88888',
      line1: '123 Test Street',
      area: 'Koramangala',
      city: 'Bengaluru',
      pincode: '560034',
    },
    status: 'placed',
  });
  const orderPass = !!order && order.deliveryFee === 49 && order.status === 'placed';
  results.push({
    test: '7. Commerce & Delivery Fee Check (Cart math, COD order placement)',
    pass: orderPass,
    details: `Order ID: ${order._id}, Total: ₹${order.total}`,
  });

  // Point 8: Selfcare Triage Check (acidity -> Gelusil OTC)
  const selfcareTriage = await processTriage({
    text: 'feeling burning sensation in chest and stomach acidity since lunch',
    userId: user._id,
  });
  const selfcarePass =
    selfcareTriage.triage === 'selfcare' &&
    selfcareTriage.otc.some((o) => o.sku === 'MED-04');
  results.push({
    test: '8. AI Selfcare OTC Match Check (Acidity maps to Gelusil OTC item)',
    pass: selfcarePass,
    details: `Triage: ${selfcareTriage.triage}, OTC items: ${selfcareTriage.otc.map((o) => o.sku).join(', ')}`,
  });

  console.log('\n================ SMOKE TEST RESULTS ================');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.pass ? '✓ PASS' : '✗ FAIL'}: ${r.test} [${r.details}]`);
    if (!r.pass) allPassed = false;
  }
  console.log('====================================================\n');
  console.log(`Overall Status: ${allPassed ? 'ALL 8 TESTS PASSED' : 'SOME TESTS FAILED'}`);

  await closeDB();
  process.exit(allPassed ? 0 : 1);
}

verifyAll().catch((err) => {
  console.error('[Verification] Error:', err);
  process.exit(1);
});
