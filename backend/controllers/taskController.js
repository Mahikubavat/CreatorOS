const { Task, TimeBlock } = require('../models');

// R.3.1 - R.3.4 Tasks
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { userId, priority, status } = req.query;
    let filter = { userId };
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const tasks = await Task.find(filter).populate('contentId', 'title platform');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// R.3.5 Time Blocking
exports.createTimeBlock = async (req, res) => {
  try {
    const block = await TimeBlock.create(req.body);
    res.status(201).json({ success: true, data: block });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};