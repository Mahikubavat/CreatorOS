const mongoose = require('mongoose');
const { Content, Task, TimeBlock, Transaction } = require('../models');

const getPeriodStart = (period, now = new Date()) => {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  if (period === '7d') start.setUTCDate(start.getUTCDate() - 6);
  else if (period === '30d') start.setUTCDate(start.getUTCDate() - 29);
  else if (period === '90d') start.setUTCDate(start.getUTCDate() - 89);
  else if (period === '12m') { start.setUTCDate(1); start.setUTCMonth(start.getUTCMonth() - 11); }
  else if (period === 'all') return null;
  else { start.setUTCDate(1); start.setUTCMonth(start.getUTCMonth() - 5); }
  return start;
};

const eachDay = (start, end) => {
  const dates = [];
  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
};

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
      { $group: {
        _id: '$platform',
        count: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$stage', 'Published'] }, 1, 0] } },
        planned: { $sum: { $cond: [{ $ne: ['$stage', 'Published'] }, 1, 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stageBreakdown,
        platformBreakdown,
        total: platformBreakdown.reduce((sum, platform) => sum + platform.count, 0),
        published: platformBreakdown.reduce((sum, platform) => sum + platform.published, 0),
        planned: platformBreakdown.reduce((sum, platform) => sum + platform.planned, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getFinanceAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const allowedPeriods = ['7d', '30d', '90d', '6m', '12m', 'all'];
    const period = allowedPeriods.includes(req.query.period) ? req.query.period : '6m';
    const start = getPeriodStart(period);
    const match = { userId };
    if (start) match.date = { $gte: start };

    const byCategory = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    const monthly = await Transaction.aggregate([
      { $match: match },
      { $group: {
        _id: {
          date: { $dateToString: { format: period === '7d' || period === '30d' || period === '90d' ? '%Y-%m-%d' : '%Y-%m', date: '$date', timezone: 'UTC' } },
          type: '$type'
        },
        total: { $sum: '$amount' }
      } },
      { $sort: { '_id.date': 1 } }
    ]);

    const totalIncome = byCategory.filter(item => item._id.type === 'Income').reduce((sum, item) => sum + item.total, 0);
    const totalExpense = byCategory.filter(item => item._id.type === 'Expense').reduce((sum, item) => sum + item.total, 0);
    res.status(200).json({ success: true, data: {
      period,
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        profitMargin: totalIncome ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
      },
      byCategory,
      monthly
    } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getProductivityAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const [tasks, blocks] = await Promise.all([Task.find({ userId }), TimeBlock.find({ userId })]);
    const now = new Date();
    const allowedPeriods = ['7d', '30d'];
    const period = allowedPeriods.includes(req.query.period) ? req.query.period : '7d';
    const start = getPeriodStart(period, now);
    const todayStart = new Date(now); todayStart.setUTCHours(0, 0, 0, 0);
    const completed = tasks.filter(t => t.status === 'Completed');
    const elapsedDeadlines = tasks.filter(task => task.dueDate && task.dueDate < todayStart);
    const missed = elapsedDeadlines.filter(task => task.status === 'Active' || (task.completedAt && task.completedAt.toISOString().slice(0, 10) > task.dueDate.toISOString().slice(0, 10)));
    const weekdayPattern = Array.from({ length: 7 }, (_, day) => ({
      day,
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      tasks: tasks.filter(task => task.dueDate && task.dueDate.getUTCDay() === day).length
    }));
    const routinePattern = Array.from({ length: 7 }, (_, day) => ({
      day,
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      blocks: blocks.filter(block => block.date.getUTCDay() === day).length
    }));
    const trend = eachDay(start, now).map(date => {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const next = new Date(dayStart); next.setUTCDate(next.getUTCDate() + 1);
      return {
        date,
        completed: completed.filter(task => {
          const completedAt = task.completedAt || task.updatedAt;
          return completedAt >= dayStart && completedAt < next;
        }).length
      };
    });
    res.status(200).json({ success: true, data: {
      period,
      total: tasks.length,
      completed: completed.length,
      active: tasks.length - completed.length,
      overdue: tasks.filter(task => task.status === 'Active' && task.dueDate && task.dueDate < todayStart).length,
      completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
      missedRate: elapsedDeadlines.length ? Math.round((missed.length / elapsedDeadlines.length) * 100) : 0,
      missedDeadlines: missed.length,
      elapsedDeadlines: elapsedDeadlines.length,
      trend,
      week: trend,
      weekdayPattern,
      routinePattern
    } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getOverview, getContentAnalytics, getFinanceAnalytics, getProductivityAnalytics };