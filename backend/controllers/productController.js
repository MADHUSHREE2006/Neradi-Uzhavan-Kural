import Product from '../models/Product.js';

// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search, pinCode, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (pinCode) query['stockByPin'] = { $elemMatch: { pinCode, quantity: { $gt: 0 } } };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('seller', 'name farmName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name farmName pinCode');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/products  (seller only)
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, unit, stockByPin, isRental, rentalUnit } = req.body;
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    const totalStock = (stockByPin || []).reduce((sum, s) => sum + Number(s.quantity), 0);

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      category,
      price,
      unit,
      images,
      stockByPin: stockByPin || [],
      totalStock,
      isRental: isRental === true || isRental === 'true',
      rentalUnit: isRental ? (rentalUnit || '') : '',
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/products/:id  (seller only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, category, price, unit, stockByPin, isActive, isRental, rentalUnit } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (unit) product.unit = unit;
    if (stockByPin) {
      product.stockByPin = stockByPin;
      product.totalStock = stockByPin.reduce((sum, s) => sum + Number(s.quantity), 0);
    }
    if (typeof isRental !== 'undefined') {
      product.isRental = isRental === true || isRental === 'true';
      product.rentalUnit = product.isRental ? (rentalUnit || product.rentalUnit || '') : '';
    }
    if (typeof isActive !== 'undefined') product.isActive = isActive;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/products/:id  (seller only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/products/seller/my  (seller's own products)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).populate('category', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts };
