const express = require('express');
const router = express.Router();
const financeCtrl = require('../controllers/financeController');
const { protect } = require('../middleware/auth');

router.post('/transaction', protect, financeCtrl.addTransaction);
router.get('/profit', protect, financeCtrl.getMonthlyProfit);
router.post('/sponsorship', protect, financeCtrl.createSponsorship);
router.get('/sponsorship', protect, financeCtrl.getSponsorships);
router.get('/user-ledger', protect, financeCtrl.getUserTransactions);

router.delete('/transaction/:id', protect, financeCtrl.deleteTransaction);
router.put('/sponsorship/:id', protect, financeCtrl.updateSponsorship);
router.delete('/sponsorship/:id', protect, financeCtrl.deleteSponsorship);

module.exports = router;