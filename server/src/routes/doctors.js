import express from 'express';
import Doctor from '../models/Doctor.js';
import Slot from '../models/Slot.js';
import { getHaversineDistance } from '../services/triageService.js';

const router = express.Router();

// GET /api/doctors/meta
router.get('/meta', async (req, res, next) => {
  try {
    const specialties = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = await Doctor.countDocuments();
    res.json({
      total,
      specialties: specialties.map((s) => ({
        name: s._id,
        count: s.count,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors?search=&specialization=&maxFee=&sort=rating|fee|distance&lat=&lng=
router.get('/', async (req, res, next) => {
  try {
    const { search, specialization, maxFee, sort = 'rating', lat, lng } = req.query;

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { clinicArea: searchRegex },
        { about: searchRegex },
      ];
    }

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (maxFee) {
      const feeNum = Number(maxFee);
      if (!isNaN(feeNum)) {
        query.videoConsultFee = { $lte: feeNum };
      }
    }

    let doctors = await Doctor.find(query).lean();

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    // Attach Haversine distance
    doctors = doctors.map((doc) => {
      let distanceKm = null;
      if (userLat != null && userLng != null && !isNaN(userLat) && !isNaN(userLng)) {
        distanceKm = getHaversineDistance(userLat, userLng, doc.location.lat, doc.location.lng);
      }
      return { ...doc, distanceKm };
    });

    // Sorting
    doctors.sort((a, b) => {
      if (sort === 'fee') {
        return a.videoConsultFee - b.videoConsultFee;
      }
      if (sort === 'distance') {
        if (a.distanceKm != null && b.distanceKm != null) {
          return a.distanceKm - b.distanceKm;
        }
        return b.rating - a.rating;
      }
      // default: rating descending, then distance, then fee
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      if (a.distanceKm != null && b.distanceKm != null && a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return a.videoConsultFee - b.videoConsultFee;
    });

    res.json({
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:docId/slots?date=YYYY-MM-DD
router.get('/:docId/slots', async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    const query = { doctorId: docId };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.startsAt = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Next 7 days
      const now = new Date();
      query.startsAt = { $gte: now };
    }

    const slots = await Slot.find(query).sort({ startsAt: 1 }).lean();

    res.json({
      doctorId: docId,
      slots,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:docId
router.get('/:docId', async (req, res, next) => {
  try {
    const { docId } = req.params;
    const doctor = await Doctor.findOne({ docId }).lean();

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});

export default router;

