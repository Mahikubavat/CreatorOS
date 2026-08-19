const express = require('express');
const router = express.Router();
const financeCtrl = require('../controllers/financeController');

// R.4 Requirements
router.post('/transaction', financeCtrl.addTransaction);
router.get('/profit', financeCtrl.getMonthlyProfit);
router.post('/sponsorship', financeCtrl.createSponsorship);
router.get('/sponsorship', financeCtrl.getSponsorships);

module.exports = router;