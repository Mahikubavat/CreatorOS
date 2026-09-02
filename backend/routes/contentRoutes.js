<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', contentCtrl.createContent);
router.get('/', contentCtrl.getContent);
router.put('/:id', contentCtrl.updateContent);
router.delete('/:id', contentCtrl.deleteContent);

=======
const express = require('express');
const router = express.Router();
const contentCtrl = require('../controllers/contentController');

// R.2 Requirements
router.post('/', contentCtrl.createContent);
router.get('/', contentCtrl.getContent);
router.put('/:id', contentCtrl.updateContent);

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = router;