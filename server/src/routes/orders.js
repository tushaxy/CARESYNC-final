import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders (JWT)
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to place an order' });
    }

    if (!address || !address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      return res.status(400).json({ message: 'Complete delivery address with phone and pincode is required' });
    }

    // Calculate subtotal accurately from items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const med = await Medicine.findOne({ sku: item.sku });
      const price = med ? med.price : (item.price || 50);
      const name = med ? med.name : (item.name || item.sku);
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);

      subtotal += price * qty;
      validatedItems.push({
        sku: item.sku,
        name,
        qty,
        price,
      });
    }

    // Delivery fee rule: Rs 49, free if subtotal >= 599
    const deliveryFee = subtotal >= 599 ? 0 : 49;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      userId: req.user._id,
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
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/mine (JWT)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ placedAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

export default router;
