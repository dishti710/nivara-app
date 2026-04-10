import { db } from '@/config/firebase';
import { CycleData, EmergencyContact, MoodEntry } from '@/types';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

// ===== MOOD SERVICES =====
export const moodService = {
  async addEntry(userId: string, entry: Omit<MoodEntry, 'id' | 'timestamp'>) {
    try {
      const docRef = await addDoc(collection(db, 'moodEntries'), {
        ...entry,
        userId,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      throw error;
    }
  },

  async getHistory(userId: string, days = 30) {
    try {
      const q = query(
        collection(db, 'moodEntries'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw error;
    }
  },

  async getStats(userId: string) {
    try {
      const entries = await this.getHistory(userId, 30);

      if (entries.length === 0) {
        return {
          averageMood: 0,
          totalEntries: 0,
          commonSymptoms: [],
          commonEmotions: [],
        };
      }

      const moodSum = entries.reduce((sum, entry: any) => sum + (entry.mood || 0), 0);
      const averageMood = moodSum / entries.length;

      // Count symptoms and emotions
      const symptomCounts: Record<string, number> = {};
      const emotionCounts: Record<string, number> = {};

      entries.forEach((entry: any) => {
        entry.symptoms?.forEach((symptom: string) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
        entry.emotions?.forEach((emotion: string) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });

      const commonSymptoms = Object.entries(symptomCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([symptom]) => symptom);

      const commonEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([emotion]) => emotion);

      return {
        averageMood: Math.round(averageMood * 10) / 10,
        totalEntries: entries.length,
        commonSymptoms,
        commonEmotions,
      };
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      throw error;
    }
  },
};

// ===== CYCLE SERVICES =====
export const cycleService = {
  async calculatePhase(dayOfCycle: number): Promise<string> {
    if (dayOfCycle <= 5) return 'menstrual';
    if (dayOfCycle <= 12) return 'follicular';
    if (dayOfCycle <= 16) return 'ovulation';
    return 'luteal';
  },

  async getCycleData(userId: string) {
    try {
      const docRef = doc(db, 'cycles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cycleData = docSnap.data();

        // Calculate current day
        const startDate = new Date(cycleData.startDate);
        const today = new Date();
        const daysDifference = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const currentDay = (daysDifference % cycleData.cycleLength) + 1;
        const phase = await this.calculatePhase(currentDay);

        // Calculate next period date
        const nextPeriod = new Date(startDate);
        nextPeriod.setDate(nextPeriod.getDate() + cycleData.cycleLength);

        return {
          ...cycleData,
          currentDay,
          phase,
          nextPeriodDate: nextPeriod.toISOString(),
          daysUntilPeriod: Math.max(0, cycleData.cycleLength - currentDay),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching cycle data:', error);
      throw error;
    }
  },

  async createCycleData(
    userId: string,
    cycleLength = 28,
    periodDays = 5,
    lastPeriodDate = new Date().toISOString()
  ) {
    try {
      const cycleRef = doc(db, 'cycles', userId);
      await setDoc(cycleRef, {
        userId,
        startDate: lastPeriodDate,
        cycleLength,
        periodDays,
        phase: 'menstrual',
        currentDay: 1,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating cycle data:', error);
      throw error;
    }
  },

  async updateCycleData(userId: string, updates: Partial<CycleData>) {
    try {
      const cycleRef = doc(db, 'cycles', userId);
      await updateDoc(cycleRef, updates);
    } catch (error) {
      console.error('Error updating cycle data:', error);
      throw error;
    }
  },
};

// ===== SOS SERVICES =====
export const sosService = {
  async createSOSAlert(userId: string, location: any, userName: string) {
    try {
      const docRef = await addDoc(collection(db, 'sosAlerts'), {
        userId,
        userName,
        timestamp: serverTimestamp(),
        location,
        status: 'active',
        contactsNotified: [],
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating SOS alert:', error);
      throw error;
    }
  },

  async getSosHistory(userId: string) {
    try {
      const q = query(
        collection(db, 'sosAlerts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      throw error;
    }
  },

  async cancelSOS(alertId: string) {
    try {
      await updateDoc(doc(db, 'sosAlerts', alertId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error cancelling SOS:', error);
      throw error;
    }
  },
};

// ===== CONTACT SERVICES =====
export const contactService = {
  async addContact(userId: string, contact: EmergencyContact) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentContacts = userSnap.data().emergencyContacts || [];
        await updateDoc(userRef, {
          emergencyContacts: [...currentContacts, contact],
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  async removeContact(userId: string, contactId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const updatedContacts = userSnap
          .data()
          .emergencyContacts.filter((c: any) => c.id !== contactId);
        await updateDoc(userRef, {
          emergencyContacts: updatedContacts,
        });
      }
    } catch (error) {
      console.error('Error removing contact:', error);
      throw error;
    }
  },

  async getContacts(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().emergencyContacts || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
};