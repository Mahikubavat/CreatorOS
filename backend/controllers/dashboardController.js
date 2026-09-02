<<<<<<< HEAD
const mongoose = require('mongoose');
const { Content, Task, Transaction } = require('../models');

const getOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const activeTasks = await Task.countDocuments({ userId, status: 'Active' });
    const pendingContent = await Content.countDocuments({ userId, stage: { $ne: 'Published' } });

    const revenueSummary = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    let totalIncome = revenueSummary.find(r => r._id === 'Income')?.total || 0;
    let totalExpense = revenueSummary.find(r => r._id === 'Expense')?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        activeTasks,
        pendingContent,
        netProfit: totalIncome - totalExpense
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getContentAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stageBreakdown = await Content.aggregate([
      { $match: { userId } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const platformBreakdown = await Content.aggregate([
      { $match: { userId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: { stageBreakdown, platformBreakdown }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getOverview, getContentAnalytics };
=======
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
>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
