import express from 'express';
import multer from 'multer';
import { processTriage } from '../services/triageService.js';
import ChatSession from '../models/ChatSession.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { aiTriageLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Multer memory storage for symptom photos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// POST /api/ai/triage
router.post('/triage', aiTriageLimiter, optionalAuth, upload.single('photo'), async (req, res, next) => {
  try {
    const text = req.body.text || '';
    const imageUrl = req.body.imageUrl || null;
    const lat = req.body.lat ? parseFloat(req.body.lat) : null;
    const lng = req.body.lng ? parseFloat(req.body.lng) : null;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Symptom description text is required' });
    }

    if (text.length > 4000) {
      return res.status(400).json({ message: 'Symptom description exceeds 4000 characters limit' });
    }

    let base64Image = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.base64Image) {
      base64Image = req.body.base64Image;
      mimeType = req.body.mimeType || 'image/jpeg';
    }

    const userId = req.user ? req.user._id : null;

    const result = await processTriage({
      text: text.trim(),
      imageUrl: imageUrl || (base64Image ? `data:${mimeType};base64,${base64Image.substring(0, 30)}...` : null),
      base64Image,
      mimeType,
      lat,
      lng,
      userId,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/history (JWT)
router.get('/history', protect, async (req, res, next) => {
  try {
    const history = await ChatSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ history });
  } catch (err) {
    next(err);
  }
});

export default router;
