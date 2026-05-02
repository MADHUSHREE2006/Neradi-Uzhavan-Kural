const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Cart = require('../models/Cart');

// @route POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ message: `Product ${item.product} not available` });

      // Check PIN-based stock
      const pinStock = product.stockByPin.find((s) => s.pinCode === shippingAddress.pinCode);
      if (!pinStock || pinStock.quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name} at your PIN code` });

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });
    }

    // Wallet payment
    if (paymentMethod === 'wallet') {
      const customer = await User.findById(req.user._id);
      if (customer.walletBalance < totalAmount)
        return res.status(400).json({ message: 'Insufficient wallet balance' });

      customer.walletBalance -= totalAmount;
      await customer.save();

      await WalletTransaction.create({
        user: customer._id,
        type: 'debit',
        amount: totalAmount,
        description: 'Order payment',
        balanceAfter: customer.walletBalance,
      });
    }

    // Deduct stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product, 'stockByPin.pinCode': shippingAddress.pinCode },
        { $inc: { 'stockByPin.$.quantity': -item.quantity, totalStock: -item.quantity } }
      );
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
      totalAmount,
      trackingHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/seller/my  (seller sees orders containing their products)
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/status  (seller/admin update status)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    order.trackingHistory.push({ status, note: note || '' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrder, getSellerOrders, updateOrderStatus };
