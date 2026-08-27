import express from 'express';
import { registerUser, loginUser, getUserProfile, getAllUsers, changeUserPassword, updateLeaderboardPreference, updateUserProfile } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/leaderboard-preference', protect, updateLeaderboardPreference);

// User management endpoints accessible by teachers and admins
router.get('/users', protect, authorize('teacher', 'admin'), getAllUsers);
router.put('/users/:id/change-password', protect, authorize('teacher', 'admin'), changeUserPassword);

export default router;
