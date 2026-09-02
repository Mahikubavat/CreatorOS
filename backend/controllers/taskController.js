const { Task, TimeBlock } = require('../models');

const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { priority, status } = req.query;
    let query = { userId: req.user.id };
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const tasks = await Task.find(query).populate('contentId', 'title platform stage');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createTimeBlock = async (req, res) => {
  try {
    const timeblock = await TimeBlock.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: timeblock });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getTimeBlocks = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { userId: req.user.id };
    if (date) query.date = new Date(date);

    const blocks = await TimeBlock.find(query);
    res.status(200).json({ success: true, count: blocks.length, data: blocks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createTimeBlock,
  getTimeBlocks
};