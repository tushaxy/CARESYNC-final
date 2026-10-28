import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Slot from '../models/Slot.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';
import ChatSession from '../models/ChatSession.js';

import { doctorsSeed } from '../data/doctors.seed.js';
import { medicinesSeed } from '../data/medicines.seed.js';

async function seed() {
  console.log('[Seeder] Starting CareSync database seed...');
  await connectDB();

  // Clean existing collections for idempotency
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Slot.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    Medicine.deleteMany({}),
    Order.deleteMany({}),
    ChatSession.deleteMany({}),
  ]);

  console.log('[Seeder] Cleared old collections.');

  // 1. Seed Doctors
  const doctors = await Doctor.insertMany(doctorsSeed);
  console.log(`[Seeder] Seeded ${doctors.length} doctors.`);

  // 2. Seed Medicines
  const medicines = await Medicine.insertMany(medicinesSeed);
  console.log(`[Seeder] Seeded ${medicines.length} medicines.`);

  // 3. Seed Demo User
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const demoUser = await User.create({
    name: 'Tushan Demo',
    email: 'demo@caresync.in',
    passwordHash,
    phone: '+91 98765 43210',
  });
  console.log(`[Seeder] Seeded 1 demo user: ${demoUser.email}`);

  // 4. Generate 7 days x 16 slots per doctor (deterministic UTC dates)
  // 16 slots per day from 9:00 AM to 5:00 PM every 30 mins
  const slotsToInsert = [];
  const now = new Date();
  // Start from today at 00:00:00 UTC
  const baseDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  for (const doc of doctorsSeed) {
    for (let day = 0; day < 7; day++) {
      // 9:00 AM to 5:00 PM IST is 3:30 AM to 11:30 AM UTC
      for (let hourIndex = 0; hourIndex < 16; hourIndex++) {
        const slotHour = 9 + Math.floor(hourIndex / 2);
        const slotMin = (hourIndex % 2) * 30;
        // In IST: slotHour:slotMin. Subtract 5 hrs 30 mins for UTC
        const slotDate = new Date(baseDate);
        slotDate.setUTCDate(baseDate.getUTCDate() + day);
        slotDate.setUTCHours(slotHour - 5, slotMin - 30, 0, 0);

        // Deterministically pre-book roughly 1 in every 8 slots
        const isPrebooked = (day * 16 + hourIndex) % 8 === 0;

        slotsToInsert.push({
          doctorId: doc.docId,
          startsAt: slotDate,
          status: isPrebooked ? 'booked' : 'open',
        });
      }
    }
  }

  const seededSlots = await Slot.insertMany(slotsToInsert);
  console.log(`[Seeder] Seeded ${seededSlots.length} slots across 7 days (${doctors.length} doctors).`);

  // 5. Seed completed appointment + sample prescription for demo user with doc-001
  const pastConsultDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const completedAppt = await Appointment.create({
    userId: demoUser._id,
    doctorId: 'doc-001',
    slotISO: pastConsultDate,
    mode: 'video',
    fee: 200,
    status: 'completed',
    payment: {
      orderId: 'order_demo_past_001',
      paymentId: 'pay_demo_past_001',
      signature: 'demo_signature_valid',
    },
    jitsiRoom: 'caresync-doc-001-past-review',
    note: 'Itchy rash and mild hives on forearms after contact with garden plants.',
  });

  const samplePrescription = await Prescription.create({
    appointmentId: completedAppt._id,
    doctorId: 'doc-001',
    userId: demoUser._id,
    medicines: [
      {
        name: 'Cetirizine 10mg (strip of 10)',
        dosage: '10mg',
        frequency: 'Once daily (at night)',
        duration: '5 days',
        notes: 'Take after dinner with water.',
      },
      {
        name: 'Calamine Lotion (100 ml)',
        dosage: 'Local application',
        frequency: 'Twice daily',
        duration: '7 days',
        notes: 'Shake well before applying gently over the affected skin.',
      },
    ],
    advice: [
      'Keep the affected rash area clean and dry.',
      'Avoid hot water baths and harsh soaps.',
      'Do not scratch the skin to prevent secondary bacterial infection.',
      'Stay well hydrated and wear loose cotton clothing.',
    ],
    followUpDays: 7,
    issuedAt: pastConsultDate,
    demoIssued: true,
  });

  // Link appointment to prescription
  completedAppt.prescriptionId = samplePrescription._id;
  await completedAppt.save();

  // 6. Seed sample past pharmacy order for demo user so order history is populated
  const sampleOrder = await Order.create({
    userId: demoUser._id,
    items: [
      {
        sku: 'MED-02',
        name: 'Cetirizine 10mg (strip of 10)',
        qty: 1,
        price: 29,
      },
      {
        sku: 'MED-07',
        name: 'Calamine Lotion (100 ml)',
        qty: 1,
        price: 92,
      },
    ],
    subtotal: 121,
    deliveryFee: 49,
    total: 170,
    address: {
      name: 'Tushan Demo',
      phone: '+91 98765 43210',
      line1: 'Flat 402, Green Palm Residency',
      area: '8th Main, Koramangala 4th Block',
      city: 'Bengaluru',
      pincode: '560034',
    },
    status: 'delivered',
    paymentId: 'cod_demo_001',
    placedAt: pastConsultDate,
  });

  // 7. Seed past chat session for demo user
  await ChatSession.create({
    userId: demoUser._id,
    messages: [
      {
        role: 'user',
        text: 'I have this itchy red rash on my arm since morning, it burns slightly when touched.',
      },
      {
        role: 'assistant',
        text: 'Hello! I evaluated your symptoms. No acute red-flag emergency detected. This appears consistent with acute contact dermatitis or a localized allergic reaction. I recommend consulting Dr. Ananya Iyer or Dr. Priya Sharma for clinical inspection.',
      },
    ],
    triage: {
      triage: 'doctor',
      confidence: 94,
      specialty: 'Dermatologist',
      summary: 'Your symptoms match localized contact irritation. It is best to avoid scratching and apply cool compresses.',
    },
  });

  console.log(`[Seeder] Created completed appointment: ${completedAppt._id}`);
  console.log(`[Seeder] Created prescription: ${samplePrescription._id}`);
  console.log(`[Seeder] Created sample order: ${sampleOrder._id}`);
  console.log('[Seeder] ========================================');
  console.log('[Seeder] Database Seed Completed Successfully!');
  console.log('[Seeder] Summary:');
  console.log(`[Seeder] - 25 Doctors`);
  console.log(`[Seeder] - 24 Medicines`);
  console.log(`[Seeder] - ${seededSlots.length} Appointment Slots`);
  console.log(`[Seeder] - 1 Demo User (demo@caresync.in / Demo@123)`);
  console.log(`[Seeder] - 1 Completed Video Appointment with Prescription`);
  console.log(`[Seeder] - 1 Pharmacy Order (status: delivered)`);
  console.log('[Seeder] ========================================');

  await closeDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seeder] Fatal seed error:', err);
  process.exit(1);
});
