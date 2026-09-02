const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', contentCtrl.createContent);
router.get('/', contentCtrl.getContent);
router.put('/:id', contentCtrl.updateContent);
router.delete('/:id', contentCtrl.deleteContent);

module.exports = router;