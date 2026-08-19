const express = require('express');
const router = express.Router();
const taskCtrl = require('../controllers/taskController');

// R.3 Requirements
router.post('/', taskCtrl.createTask);
router.get('/', taskCtrl.getTasks);
router.put('/:id', taskCtrl.updateTask);
router.delete('/:id', taskCtrl.deleteTask);
router.post('/timeblock', taskCtrl.createTimeBlock);

module.exports = router;