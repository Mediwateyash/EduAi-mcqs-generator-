import express from 'express';
import { createCourse, getCourses, deleteCourse, getCourseById, addQuizToCourse, removeQuizFromCourse } from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/')
    .post(authorize('teacher', 'admin'), createCourse)
    .get(getCourses);

router.route('/:id')
    .get(getCourseById)
    .delete(authorize('teacher', 'admin'), deleteCourse);

router.post('/:courseId/add-quiz', authorize('teacher', 'admin'), addQuizToCourse);
router.post('/:courseId/remove-quiz', authorize('teacher', 'admin'), removeQuizFromCourse);

export default router;

