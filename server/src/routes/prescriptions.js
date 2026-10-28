import express from 'express';
import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/prescriptions/mine (JWT)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id })
      .sort({ issuedAt: -1 })
      .lean();

    const docIds = [...new Set(prescriptions.map((p) => p.doctorId))];
    const doctors = await Doctor.find({ docId: { $in: docIds } }).lean();
    const docMap = new Map(doctors.map((d) => [d.docId, d]));

    const enriched = prescriptions.map((p) => ({
      ...p,
      doctor: docMap.get(p.doctorId) || null,
    }));

    res.json({ prescriptions: enriched });
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/:id (JWT, owner only)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id).lean();

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to prescription' });
    }

    const [doctor, appointment] = await Promise.all([
      Doctor.findOne({ docId: prescription.doctorId }).lean(),
      Appointment.findById(prescription.appointmentId).lean(),
    ]);

    res.json({
      prescription: {
        ...prescription,
        doctor,
        appointment,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
