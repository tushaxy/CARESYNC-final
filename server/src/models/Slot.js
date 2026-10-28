import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String, // docId reference e.g. "doc-001"
      required: true,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'booked'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Slot', slotSchema);
