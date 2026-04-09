import express from 'express';
import {
  triggerSOS,
  cancelSOS,
  getSOSHistory,
} from '../controllers/sosController';

const router = express.Router();

router.post('/alert', triggerSOS);
router.post('/cancel', cancelSOS);
router.get('/history', getSOSHistory);

export default router;