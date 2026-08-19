const mongoose = require('mongoose');
const { Task, TimeBlock, Content, Transaction } = require('../models');

exports.getDashboardOverview = async (req, res) => {
  try {
    const { userId } = req.query;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [tasks, upcomingContent, timeBlocks] = await Promise.all([
      Task.find({ userId, dueDate: { $gte: todayStart, $lte: todayEnd } }),
      Content.find({ userId, stage: 'Scheduled' }).limit(5),
      TimeBlock.find({ userId, date: { $gte: todayStart, $lte: todayEnd } })
    ]);

    res.status(200).json({
      success: true,
      data: { todaysTasks: tasks, upcomingContent, todaysTimeBlocks: timeBlocks }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getContentAnalytics = async (req, res) => {
  try {
    const { userId } = req.query;
    const analytics = await Content.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: { platform: "$platform", stage: "$stage" }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};