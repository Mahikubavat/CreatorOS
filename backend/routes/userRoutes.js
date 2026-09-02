const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public authentication routes
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);

// Protected user profile routes
router.get('/profile', protect, userCtrl.getProfile);
router.put('/profile', protect, userCtrl.updateProfile);

module.exports = router;