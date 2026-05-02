const router = require('express').Router();
const { getCart, addToCart, updateCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/', protect, clearCart);

module.exports = router;
