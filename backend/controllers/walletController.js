const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ balance: user.walletBalance, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin-only: add funds to a user's wallet
const addFunds = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += Number(amount);
    await user.save();

    await WalletTransaction.create({
      user: user._id,
      type: 'credit',
      amount,
      description: description || 'Admin credit',
      balanceAfter: user.walletBalance,
    });

    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWallet, addFunds };
