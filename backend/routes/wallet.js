const router = require('express').Router();
const { getWallet, addFunds } = require('../controllers/walletController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, getWallet);
router.post('/add-funds', protect, requireRole('admin'), addFunds);

module.exports = router;
