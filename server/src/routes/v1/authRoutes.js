import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe, refresh } from '../../controllers/authController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // Limit each IP to 10 requests per `window`
  message: 'Too many auth requests from this IP, please try again later'
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
