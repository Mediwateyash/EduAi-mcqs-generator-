import express from 'express';
import { uploadMaterial, getMaterials, getMaterialById, deleteMaterial } from '../controllers/materialController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', protect, authorize('teacher', 'admin'), upload.single('file'), uploadMaterial);
router.get('/', protect, authorize('teacher', 'admin'), getMaterials);
router.get('/:id', protect, authorize('teacher', 'admin'), getMaterialById);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

export default router;
