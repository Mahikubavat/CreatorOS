const express = require('express');
const router = express.Router();
const financeCtrl = require('../controllers/financeController');
const { protect } = require('../middleware/auth');

router.post('/transaction', protect, financeCtrl.addTransaction);
router.get('/profit', protect, financeCtrl.getMonthlyProfit);
router.post('/sponsorship', protect, financeCtrl.createSponsorship);
router.get('/sponsorship', protect, financeCtrl.getSponsorships);
router.get('/user-ledger', protect, financeCtrl.getUserTransactions);

module.exports = router;