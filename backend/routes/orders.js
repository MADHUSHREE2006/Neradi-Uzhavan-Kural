import express from 'express';
import {
  placeOrder, getMyOrders, getOrder, getSellerOrders, updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, requireRole, requireApprovedSeller } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, requireRole('customer'), placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/seller/my', protect, requireApprovedSeller, getSellerOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole('seller', 'admin'), updateOrderStatus);

export default router;
