import mongoose, { Schema, Document } from 'mongoose';

export interface ICycleData extends Document {
  userId: string;
  startDate: string;
  endDate?: string;
  cycleLength: number;
  periodDays: number;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  currentDay: number;
  nextPeriodDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const cycleDataSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    startDate: { type: String, required: true },
    endDate: String,
    cycleLength: { type: Number, default: 28 },
    periodDays: { type: Number, default: 5 },
    phase: {
      type: String,
      enum: ['menstrual', 'follicular', 'ovulation', 'luteal'],
      default: 'menstrual',
    },
    currentDay: { type: Number, default: 1 },
    nextPeriodDate: String,
  },
  { timestamps: true }
);

export const CycleData = mongoose.model('CycleData', cycleDataSchema);