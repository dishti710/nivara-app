import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  cycleLength: number;
  periodDays: number;
  lastPeriodDate: string;
  emergencyContacts: IContact[];
  settings: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface IContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface IUserSettings {
  periodReminders: boolean;
  dailyWellnessCheck: boolean;
  appLock: boolean;
  locationSharing: boolean;
  wellnessCheckIn: boolean;
  reminderTime: string;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: String,
    cycleLength: { type: Number, default: 28 },
    periodDays: { type: Number, default: 5 },
    lastPeriodDate: { type: String, required: true },
    emergencyContacts: [
      {
        id: String,
        name: String,
        phone: String,
        email: String,
        isPrimary: Boolean,
      },
    ],
    settings: {
      periodReminders: { type: Boolean, default: true },
      dailyWellnessCheck: { type: Boolean, default: true },
      appLock: { type: Boolean, default: false },
      locationSharing: { type: Boolean, default: false },
      wellnessCheckIn: { type: Boolean, default: true },
      reminderTime: { type: String, default: '09:00' },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);