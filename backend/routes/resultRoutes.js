import express from 'express';
import { submitQuiz, getMyResults, getResultById, getTeacherResults, deleteResult } from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', protect, authorize('student', 'admin'), submitQuiz);
router.get('/my-results', protect, authorize('student', 'admin'), getMyResults);
router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherResults);
router.get('/:id', protect, getResultById);
router.delete('/:id', protect, deleteResult);

export default router;

