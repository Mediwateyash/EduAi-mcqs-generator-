import express from 'express';
import { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

export default router;
