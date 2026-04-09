import express from 'express';
import {
  signUp,
  signIn,
  getCurrentUser,
} from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/me', getCurrentUser);

export default router;