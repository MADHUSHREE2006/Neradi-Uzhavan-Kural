import express from 'express';
import {
  getSellers, updateSellerStatus, getAllOrders, getDashboardStats, getStockByLocation,
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sellers', getSellers);
router.put('/sellers/:id/status', updateSellerStatus);
router.get('/orders', getAllOrders);
router.get('/stock', getStockByLocation);

export default router;
