const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/contentController');

// R.2 Requirements
router.post('/', contentCtrl.createContent);
router.get('/', contentCtrl.getContent);
router.put('/:id', contentCtrl.updateContent);

module.exports = router;