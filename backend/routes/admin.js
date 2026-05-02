const router = require('express').Router();
const {
  getSellers, updateSellerStatus, getAllOrders, getDashboardStats, getStockByLocation,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sellers', getSellers);
router.put('/sellers/:id/status', updateSellerStatus);
router.get('/orders', getAllOrders);
router.get('/stock', getStockByLocation);

module.exports = router;
