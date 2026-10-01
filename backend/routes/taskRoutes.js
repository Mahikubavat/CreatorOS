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
router.delete('/timeblock/:id', taskCtrl.deleteTimeBlock);

module.exports = router;