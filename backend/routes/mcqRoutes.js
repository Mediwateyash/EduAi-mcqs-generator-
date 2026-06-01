import express from 'express';
import { getMCQsByMaterial, updateMCQ, deleteMCQ } from '../controllers/mcqController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/material/:materialId', protect, authorize('teacher', 'admin'), getMCQsByMaterial);
router.put('/:id', protect, authorize('teacher', 'admin'), updateMCQ);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMCQ);

export default router;
