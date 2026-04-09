import { Request, Response } from 'express';
import { CycleData } from '../models/CycleData';
import { User } from '../models/User';

const calculatePhase = (dayOfCycle: number): string => {
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= 12) return 'follicular';
  if (dayOfCycle <= 16) return 'ovulation';
  return 'luteal';
};

export const getCurrentCycle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    let cycleData = await CycleData.findOne({ userId });

    if (!cycleData) {
      // Create default cycle if doesn't exist
      const user = await User.findById(userId);
      const startDate = user?.lastPeriodDate || new Date().toISOString();

      cycleData = new CycleData({
        userId,
        startDate,
        cycleLength: user?.cycleLength || 28,
        periodDays: user?.periodDays || 5,
        phase: 'menstrual',
        currentDay: 1,
      });

      await cycleData.save();
    }

    // Calculate current day
    const startDate = new Date(cycleData.startDate);
    const today = new Date();
    const daysDifference = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentDay = (daysDifference % cycleData.cycleLength) + 1;

    // Calculate phase
    const phase = calculatePhase(currentDay);

    // Update cycle data
    cycleData.currentDay = currentDay;
    cycleData.phase = phase;
    cycleData.nextPeriodDate = new Date(
      startDate.getTime() + cycleData.cycleLength * 24 * 60 * 60 * 1000
    ).toISOString();

    await cycleData.save();

    res.json({
      phase,
      currentDay,
      cycleLength: cycleData.cycleLength,
      periodDays: cycleData.periodDays,
      nextPeriodDate: cycleData.nextPeriodDate,
      daysUntilPeriod: Math.max(
        0,
        cycleData.cycleLength - currentDay
      ),
    });
  } catch (error) {
    console.error('Get cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCycle = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { cycleLength, periodDays, lastPeriodDate } = req.body;

    const cycleData = await CycleData.findOne({ userId });
    if (!cycleData) {
      return res.status(404).json({ error: 'Cycle data not found' });
    }

    if (cycleLength) cycleData.cycleLength = cycleLength;
    if (periodDays) cycleData.periodDays = periodDays;
    if (lastPeriodDate) cycleData.startDate = lastPeriodDate;

    await cycleData.save();

    // Update user settings
    await User.findByIdAndUpdate(userId, {
      cycleLength: cycleLength || 28,
      periodDays: periodDays || 5,
      lastPeriodDate: lastPeriodDate || new Date().toISOString(),
    });

    res.json({ message: 'Cycle updated successfully' });
  } catch (error) {
    console.error('Update cycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};