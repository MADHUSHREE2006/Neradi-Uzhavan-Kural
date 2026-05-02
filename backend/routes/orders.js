const router = require('express').Router();
const {
  placeOrder, getMyOrders, getOrder, getSellerOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, requireRole, requireApprovedSeller } = require('../middleware/auth');

router.post('/', protect, requireRole('customer'), placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/seller/my', protect, requireApprovedSeller, getSellerOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole('seller', 'admin'), updateOrderStatus);

module.exports = router;
