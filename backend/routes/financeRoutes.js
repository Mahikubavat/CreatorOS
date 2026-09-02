<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const financeCtrl = require('../controllers/financeController');
const { protect } = require('../middleware/auth');

router.post('/transaction', protect, financeCtrl.addTransaction);
router.get('/profit', protect, financeCtrl.getMonthlyProfit);
router.post('/sponsorship', protect, financeCtrl.createSponsorship);
router.get('/sponsorship', protect, financeCtrl.getSponsorships);
router.get('/user-ledger', protect, financeCtrl.getUserTransactions);

=======
const express = require('express');
const router = express.Router();
const financeCtrl = require('../controllers/financeController');

// R.4 Requirements
router.post('/transaction', financeCtrl.addTransaction);
router.get('/profit', financeCtrl.getMonthlyProfit);
router.post('/sponsorship', financeCtrl.createSponsorship);
router.get('/sponsorship', financeCtrl.getSponsorships);
router.get('/user-ledger', financeCtrl.getUserTransactions);

>>>>>>> 36f0ca9d4ee803daab395736d0e8470b32ab600f
module.exports = router;