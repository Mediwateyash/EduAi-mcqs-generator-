import express from 'express';
import { getTeacherAnalytics, getStudentAnalytics, getLeaderboard } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', protect, authorize('student', 'admin'), getStudentAnalytics);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
