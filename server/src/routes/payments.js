import express from 'express';
import crypto from 'crypto';
import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import { protect } from '../middleware/auth.js';
import { verifyRazorpaySignature } from '../services/razorpayService.js';

const router = express.Router();

// POST /api/payments/verify (JWT)
router.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: 'Missing payment verification identifiers' });
    }

    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature. Payment verification failed.' });
    }

    // Find the appointment linked to this Razorpay order ID
    const appointment = await Appointment.findOne({
      'payment.orderId': razorpay_order_id,
      userId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment matching this payment order not found' });
    }

    // Generate unique Jitsi room name
    const roomSlug = `caresync-${appointment.doctorId}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;

    appointment.status = 'paid';
    appointment.payment.paymentId = razorpay_payment_id;
    appointment.payment.signature = razorpay_signature;
    appointment.jitsiRoom = roomSlug;
    await appointment.save();

    // Mark slot as booked
    await Slot.findOneAndUpdate(
      {
        doctorId: appointment.doctorId,
        startsAt: appointment.slotISO,
      },
      { status: 'booked' }
    );

    const doctor = await Doctor.findOne({ docId: appointment.doctorId }).lean();

    res.json({
      success: true,
      message: 'Payment verified and appointment confirmed',
      appointment: {
        ...appointment.toObject(),
        doctor,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
