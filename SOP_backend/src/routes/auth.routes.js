import express from 'express';

import {
  register,
  login,
  sendOtp,
  verifyOtp,
  logout,
  refreshToken,
  getProfile,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticate, getProfile);

export default router;
