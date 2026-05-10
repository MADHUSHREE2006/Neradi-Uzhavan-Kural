//const Wishlist = require('../models/Wishlist');
import Wishlist from '../models/Wishlist.js';

const getWishlists = async (req, res) => {
  try {
    const lists = await Wishlist.find({ user: req.user._id }).populate('products', 'name price images');
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createWishlist = async (req, res) => {
  try {
    const { name } = req.body;
    const list = await Wishlist.create({ user: req.user._id, name: name || 'Default' });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const list = await Wishlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!list) return res.status(404).json({ message: 'Wishlist not found' });

    if (!list.products.includes(req.body.productId)) {
      list.products.push(req.body.productId);
      await list.save();
    }
    await list.populate('products', 'name price images');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const list = await Wishlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!list) return res.status(404).json({ message: 'Wishlist not found' });

    list.products = list.products.filter((p) => p.toString() !== req.params.productId);
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getWishlists, createWishlist, addToWishlist, removeFromWishlist };
