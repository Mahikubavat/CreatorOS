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
