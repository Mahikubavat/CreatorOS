const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

// R.1 Requirements
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.put('/:id', userCtrl.updateProfile);

module.exports = router;