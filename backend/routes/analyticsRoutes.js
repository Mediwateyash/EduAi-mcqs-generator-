import express from 'express';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', protect, authorize('student', 'admin'), getStudentAnalytics);

export default router;
