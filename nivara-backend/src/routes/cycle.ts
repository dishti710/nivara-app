import express from 'express';
import {
  getCurrentCycle,
  updateCycle,
} from '../controllers/cycleController';

const router = express.Router();

router.get('/current', getCurrentCycle);
router.put('/update', updateCycle);

export default router;