const mongoose = require('mongoose');
const { Transaction, Sponsorship } = require('../models');

const addTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getMonthlyProfit = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const summary = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: startDate, $lte: endDate } } },
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

const createSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: sponsorship });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getSponsorships = async (req, res) => {
  try {
    const deals = await Sponsorship.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  addTransaction,
  getMonthlyProfit,
  createSponsorship,
  getSponsorships,
  getUserTransactions
};