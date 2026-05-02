const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmName, pinCode, address } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    if (await User.findOne({ phone }))
      return res.status(400).json({ message: 'Phone already registered' });

    const userData = { name, email, phone, password, role: role || 'customer' };
    if (role === 'seller') {
      userData.farmName = farmName;
      userData.pinCode = pinCode;
      userData.address = address;
      userData.sellerStatus = 'pending'; // requires admin approval
    }

    const user = await User.create(userData);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerStatus: user.sellerStatus,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account is blocked' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerStatus: user.sellerStatus,
      walletBalance: user.walletBalance,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

module.exports = { register, login, getMe };
