import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Cart from '../models/Cart.js';

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
    let walletTxn = null;
    if (paymentMethod === 'wallet') {
      const customer = await User.findById(req.user._id);
      if (customer.walletBalance < totalAmount)
        return res.status(400).json({ message: 'Insufficient wallet balance' });

      customer.walletBalance -= totalAmount;
      await customer.save();

      walletTxn = await WalletTransaction.create({
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
      paymentTransactionId: walletTxn?._id || null,
      trackingHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Link transaction reference back to order
    if (walletTxn) {
      walletTxn.reference = order._id.toString();
      await walletTxn.save();
    }

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
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('paymentTransactionId', 'type amount description createdAt balanceAfter reference');
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
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.orderStatus;
    order.orderStatus = status;
    order.trackingHistory.push({ status, note: note || '' });

    // On delivery: mark COD as paid and credit each seller's wallet
    if (status === 'delivered' && prevStatus !== 'delivered') {
      // Mark COD orders as paid
      if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
      }

      // Credit each seller for their items in this order
      const sellerTotals = {};
      for (const item of order.items) {
        const sellerId = item.seller.toString();
        sellerTotals[sellerId] = (sellerTotals[sellerId] || 0) + item.price * item.quantity;
      }

      for (const [sellerId, amount] of Object.entries(sellerTotals)) {
        const seller = await User.findById(sellerId);
        if (seller) {
          seller.walletBalance += amount;
          await seller.save();
          await WalletTransaction.create({
            user: seller._id,
            type: 'credit',
            amount,
            description: `Payment received for order #${order._id.toString().slice(-8).toUpperCase()}`,
            reference: order._id.toString(),
            balanceAfter: seller.walletBalance,
          });
        }
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { placeOrder, getMyOrders, getOrder, getSellerOrders, updateOrderStatus };
