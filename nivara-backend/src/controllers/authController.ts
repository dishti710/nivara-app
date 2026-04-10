import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CycleData } from '../models/CycleData';

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, name, lastPeriodDate } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      lastPeriodDate,
      cycleLength: 28,
      periodDays: 5,
      emergencyContacts: [],
      settings: {
        periodReminders: true,
        dailyWellnessCheck: true,
        appLock: false,
        locationSharing: false,
        wellnessCheckIn: true,
        reminderTime: '09:00',
      },
    });

    await user.save();

    // Create initial cycle data
    const cycleData = new CycleData({
      userId: user._id.toString(),
      startDate: lastPeriodDate,
      cycleLength: 28,
      periodDays: 5,
      phase: 'menstrual',
      currentDay: 1,
      nextPeriodDate: new Date(
        new Date(lastPeriodDate).getTime() + 28 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    await cycleData.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        cycleLength: user.cycleLength,
        periodDays: user.periodDays,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};