const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'creatoros_secret_key';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { fullName, email, password, contentNiche } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already registered' });

    const user = await User.create({ fullName, email, password, contentNiche });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ success: true, token, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ['fullName','displayName','bio','profilePicture','socialMediaLinks','preferredBaseCurrency','contentNiche'];
    const upd = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) upd[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.id, upd, { new: true, runValidators: true }).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, error: 'Passwords do not match' });
    const user = await User.findById(req.user.id);
    if (!user || !(await user.matchPassword(currentPassword))) return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };