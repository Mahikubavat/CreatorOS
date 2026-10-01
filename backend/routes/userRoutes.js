const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/me', protect, userCtrl.getProfile);
router.put('/password', protect, userCtrl.changePassword);
router.put('/profile', protect, userCtrl.updateProfile);

module.exports = router;
