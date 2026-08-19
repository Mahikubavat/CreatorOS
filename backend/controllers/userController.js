const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, message: "Account created", data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });
    res.status(200).json({ success: true, message: "Login success", data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};