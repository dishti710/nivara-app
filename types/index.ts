export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cycleLength: number;
  periodDays: number;
  lastPeriodDate: string;
  emergencyContacts: EmergencyContact[];
  settings: UserSettings;
}

export interface CycleData {
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  cycleLength: number;
  periodDays: number;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  currentDay: number;
  nextPeriodDate: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  timestamp: string;
  mood: number; // 0-4
  symptoms: string[];
  emotions: string[];
  notes: string;
  cycleDay: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface UserSettings {
  periodReminders: boolean;
  dailyWellnessCheck: boolean;
  appLock: boolean;
  locationSharing: boolean;
  wellnessCheckIn: boolean;
  reminderTime: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  timestamp: string;
  location: { lat: number; lng: number };
  status: 'active' | 'cancelled' | 'resolved';
  contactsNotified: string[];
}