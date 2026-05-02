const router = require('express').Router();
const { getWishlists, createWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlists);
router.post('/', protect, createWishlist);
router.post('/:id/add', protect, addToWishlist);
router.delete('/:id/remove/:productId', protect, removeFromWishlist);

module.exports = router;
