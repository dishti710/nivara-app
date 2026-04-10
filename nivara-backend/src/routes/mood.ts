import express from 'express';
import {
  createMoodEntry,
  getMoodHistory,
  getMoodStats,
} from '../controllers/moodController';

const router = express.Router();

router.post('/entry', createMoodEntry);
router.get('/history', getMoodHistory);
router.get('/stats', getMoodStats);

export default router;