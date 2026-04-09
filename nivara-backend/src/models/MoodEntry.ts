import mongoose, { Schema, Document } from 'mongoose';

export interface IMoodEntry extends Document {
  userId: string;
  timestamp: string;
  mood: number;
  symptoms: string[];
  emotions: string[];
  notes: string;
  cycleDay: number;
  createdAt: Date;
}

const moodEntrySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true },
    mood: { type: Number, min: 0, max: 4, required: true },
    symptoms: [String],
    emotions: [String],
    notes: String,
    cycleDay: Number,
  },
  { timestamps: true }
);

export const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);