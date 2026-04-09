import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import cycleRoutes from './routes/cycle';
import moodRoutes from './routes/mood';
import sosRoutes from './routes/sos';
import contactRoutes from './routes/contacts';
import settingsRoutes from './routes/settings';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authMiddleware = (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/luna', {
  retryWrites: true,
  w: 'majority',
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// Routes
app.use('/auth', authRoutes);
app.use('/cycle', authMiddleware, cycleRoutes);
app.use('/mood', authMiddleware, moodRoutes);
app.use('/sos', authMiddleware, sosRoutes);
app.use('/contacts', authMiddleware, contactRoutes);
app.use('/settings', authMiddleware, settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Luna Backend running on port ${PORT}`);
});