import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, requireRole('admin'), createCategory);
router.put('/:id', protect, requireRole('admin'), updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

export default router;
