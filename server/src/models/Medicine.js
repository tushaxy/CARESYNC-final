import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      default: 'CareSync Pharmacy',
    },
    category: {
      type: String,
      enum: ['device', 'otc', 'wellness'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    prescribedFor: {
      type: [String],
      default: [],
      index: true,
    },
    stock: {
      type: Number,
      default: 100,
    },
    blurb: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Medicine', medicineSchema);
