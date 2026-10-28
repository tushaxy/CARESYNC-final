import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      index: true,
    },
    qualifications: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 500,
    },
    videoConsultFee: {
      type: Number,
      required: true,
      index: true,
    },
    clinicConsultFee: {
      type: Number,
      required: true,
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    clinicArea: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    nextAvailableLabel: {
      type: String,
      default: 'Today 5:00 PM',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    about: {
      type: String,
      required: true,
    },
    avatarHue: {
      type: Number,
      default: 140, // Greenish hue by default
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Doctor', doctorSchema);
