import { Request, Response } from 'express';
import { MoodEntry } from '../models/MoodEntry';
import { CycleData } from '../models/CycleData';

export const createMoodEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { mood, symptoms, emotions, notes } = req.body;

    // Get current cycle day
    const cycleData = await CycleData.findOne({ userId });
    const cycleDay = cycleData?.currentDay || 1;

    const moodEntry = new MoodEntry({
      userId,
      timestamp: new Date().toISOString(),
      mood,
      symptoms,
      emotions,
      notes,
      cycleDay,
    });

    await moodEntry.save();

    res.json({
      message: 'Mood entry created',
      moodEntry,
    });
  } catch (error) {
    console.error('Create mood entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMoodHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const moodEntries = await MoodEntry.find({
      userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    res.json(moodEntries);
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMoodStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const entries = await MoodEntry.find({ userId });

    if (entries.length === 0) {
      return res.json({ averageMood: 0, totalEntries: 0 });
    }

    const averageMood =
      entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;

    res.json({
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: entries.length,
      commonSymptoms: getCommonItems(entries, 'symptoms'),
      commonEmotions: getCommonItems(entries, 'emotions'),
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function getCommonItems(entries: any[], field: string): string[] {
  const counts: { [key: string]: number } = {};

  entries.forEach((entry) => {
    entry[field].forEach((item: string) => {
      counts[item] = (counts[item] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([item]) => item);
}