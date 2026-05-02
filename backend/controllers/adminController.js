const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Seller management
const getSellers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { role: 'seller' };
    if (status) query.sellerStatus = status;
    const sellers = await User.find(query).select('-password');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body; // approved | blocked | pending
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { sellerStatus: status, isActive: status !== 'blocked' },
      { new: true }
    ).select('-password');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSellers, pendingSellers, totalOrders, totalProducts] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalUsers,
      totalSellers,
      pendingSellers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Location-wise stock visibility
const getStockByLocation = async (req, res) => {
  try {
    const { pinCode } = req.query;
    const query = { isActive: true };
    if (pinCode) query['stockByPin.pinCode'] = pinCode;
    const products = await Product.find(query)
      .select('name stockByPin totalStock')
      .populate('seller', 'name farmName');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSellers, updateSellerStatus, getAllOrders, getDashboardStats, getStockByLocation };
