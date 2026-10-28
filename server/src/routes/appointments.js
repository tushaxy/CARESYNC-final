import express from 'express';
import crypto from 'crypto';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Slot from '../models/Slot.js';
import Prescription from '../models/Prescription.js';
import { protect } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';

const router = express.Router();

// POST /api/appointments (JWT) {docId, slotISO, mode, note}
router.post('/', protect, async (req, res, next) => {
  try {
    let { docId, slotISO, mode = 'video', note = '' } = req.body;

    if (!docId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    if (!slotISO) {
      const openSlot = await Slot.findOne({ doctorId: docId, status: { $ne: 'booked' } });
      slotISO = openSlot ? openSlot.startsAt : new Date();
    }

    const doctor = await Doctor.findOne({ docId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const fee = mode === 'clinic' ? doctor.clinicConsultFee : doctor.videoConsultFee;

    // Create pending appointment
    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId: docId,
      slotISO: new Date(slotISO),
      mode,
      fee,
      status: 'pending',
      note,
    });

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: fee,
      receipt: appointment._id.toString(),
      notes: {
        appointmentId: appointment._id.toString(),
        doctorId: docId,
        doctorName: doctor.name,
      },
    });

    appointment.payment.orderId = razorpayOrder.id;
    await appointment.save();

    res.status(201).json({
      appointment,
      razorpayOrder,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/mine (JWT)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach doctor info
    const docIds = [...new Set(appointments.map((a) => a.doctorId))];
    const doctors = await Doctor.find({ docId: { $in: docIds } }).lean();
    const docMap = new Map(doctors.map((d) => [d.docId, d]));

    const enriched = appointments.map((a) => ({
      ...a,
      doctor: docMap.get(a.doctorId) || null,
    }));

    res.json({ appointments: enriched });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/:id (JWT, owner only)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this appointment' });
    }

    const doctor = await Doctor.findOne({ docId: appointment.doctorId }).lean();

    res.json({
      appointment: {
        ...appointment,
        doctor,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/complete (JWT, owner)
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    appointment.status = 'completed';

    // Issue demo prescription if not already issued
    let prescription = null;
    if (appointment.prescriptionId) {
      prescription = await Prescription.findById(appointment.prescriptionId);
    }

    if (!prescription) {
      const doctor = await Doctor.findOne({ docId: appointment.doctorId });
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

      prescription = await Prescription.create({
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        userId: req.user._id,
        medicines: medicinesList,
        advice: [
          'Take prescribed doses at regular intervals.',
          'Stay well hydrated with minimum 2.5L water daily.',
          'Avoid heavy physical exertion until recovery.',
          'Reach out via CareSync if any adverse reaction occurs.',
        ],
        followUpDays: 7,
        issuedAt: new Date(),
        demoIssued: true,
      });

      appointment.prescriptionId = prescription._id;
    }

    await appointment.save();

    res.json({
      message: 'Consultation marked as completed',
      appointment,
      prescriptionId: prescription._id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

