import express from 'express';
import { getWallet, addFunds } from '../controllers/walletController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/add-funds', protect, requireRole('admin'), addFunds);

export default router;
