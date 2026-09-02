<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

// R.1 Requirements
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.put('/:id', userCtrl.updateProfile);

=======
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

// R.1 Requirements
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.put('/:id', userCtrl.updateProfile);

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = router;