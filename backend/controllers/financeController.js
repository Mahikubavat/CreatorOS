const mongoose = require('mongoose');
const { Transaction, Sponsorship } = require('../models');

exports.addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMonthlyProfit = async (req, res) => {
  try {
    const { userId, year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    let totalIncome = summary.find(s => s._id === 'Income')?.total || 0;
    let totalExpenses = summary.find(s => s._id === 'Expense')?.total || 0;

    res.status(200).json({
      success: true,
      period: `${year}-${month}`,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.create(req.body);
    res.status(201).json({ success: true, data: sponsorship });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getSponsorships = async (req, res) => {
  try {
    const deals = await Sponsorship.find({ userId: req.query.userId });
    res.status(200).json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all transactions for a specific user
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Finds transactions matching the userId and populates user info
    const transactions = await Transaction.find({ userId }).populate('userId', 'fullName email preferredBaseCurrency');
    
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};