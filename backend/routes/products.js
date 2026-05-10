import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
} from '../controllers/productController.js';
import { protect, requireApprovedSeller } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getProducts);
router.get('/seller/my', protect, requireApprovedSeller, getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, requireApprovedSeller, upload.array('images', 5), createProduct);
router.put('/:id', protect, requireApprovedSeller, updateProduct);
router.delete('/:id', protect, requireApprovedSeller, deleteProduct);

export default router;
