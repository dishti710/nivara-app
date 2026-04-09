import mongoose, { Schema, Document } from 'mongoose';

export interface ISOSAlert extends Document {
  userId: string;
  timestamp: string;
  location: { lat: number; lng: number };
  status: 'active' | 'cancelled' | 'resolved';
  contactsNotified: string[];
  createdAt: Date;
  updatedAt: Date;
}

const sosAlertSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true },
    location: {
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'resolved'],
      default: 'active',
    },
    contactsNotified: [String],
  },
  { timestamps: true }
);

export const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);