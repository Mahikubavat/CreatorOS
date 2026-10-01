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
    const updates = { ...req.body };
    if (updates.status === 'Completed') updates.completedAt = new Date();
    if (updates.status === 'Active') updates.completedAt = null;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
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
    const { startTime, endTime, date } = req.body;
    if (!startTime || !endTime || startTime >= endTime) return res.status(400).json({ success: false, error: 'End time must be after start time' });
    const clash = await TimeBlock.findOne({ userId: req.user.id, date: new Date(date), startTime: { $lt: endTime }, endTime: { $gt: startTime } });
    if (clash) return res.status(400).json({ success: false, error: `Overlaps with "${clash.label}" (${clash.startTime}-${clash.endTime})` });
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

const deleteTimeBlock = async (req, res) => {
  try {
    await TimeBlock.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  deleteTimeBlock,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createTimeBlock,
  getTimeBlocks
};