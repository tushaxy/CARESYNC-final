import express from 'express';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// GET /api/medicines?search=&category=
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (category && category.toLowerCase() !== 'all') {
      query.category = category.toLowerCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { prescribedFor: regex },
        { blurb: regex },
        { sku: regex },
      ];
    }

    const medicines = await Medicine.find(query).sort({ sku: 1 }).lean();

    res.json({
      count: medicines.length,
      medicines,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/medicines/:sku
router.get('/:sku', async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({ sku: req.params.sku.toUpperCase() }).lean();
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine SKU not found' });
    }
    res.json({ medicine });
  } catch (err) {
    next(err);
  }
});

export default router;
