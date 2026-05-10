import express from 'express';
import { getWishlists, createWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWishlists);
router.post('/', protect, createWishlist);
router.post('/:id/add', protect, addToWishlist);
router.delete('/:id/remove/:productId', protect, removeFromWishlist);

export default router;
