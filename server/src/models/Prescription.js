import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    doctorId: {
      type: String, // doc-001
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        notes: { type: String, default: '' },
      },
    ],
    advice: {
      type: [String],
      default: [],
    },
    followUpDays: {
      type: Number,
      default: 7,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    demoIssued: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Prescription', prescriptionSchema);

