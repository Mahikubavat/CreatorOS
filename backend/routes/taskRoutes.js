<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const taskCtrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', taskCtrl.createTask);
router.get('/', taskCtrl.getTasks);
router.put('/:id', taskCtrl.updateTask);
router.delete('/:id', taskCtrl.deleteTask);
router.post('/timeblock', taskCtrl.createTimeBlock);
router.get('/timeblock', taskCtrl.getTimeBlocks);

=======
const express = require('express');
const router = express.Router();
const taskCtrl = require('../controllers/taskController');

// R.3 Requirements
router.post('/', taskCtrl.createTask);
router.get('/', taskCtrl.getTasks);
router.put('/:id', taskCtrl.updateTask);
router.delete('/:id', taskCtrl.deleteTask);
router.post('/timeblock', taskCtrl.createTimeBlock);

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = router;