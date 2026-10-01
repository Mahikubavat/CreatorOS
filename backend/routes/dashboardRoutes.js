const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', dashboardCtrl.getOverview);
router.get('/content-analytics', dashboardCtrl.getContentAnalytics);
router.get('/finance-analytics', dashboardCtrl.getFinanceAnalytics);
router.get('/productivity-analytics', dashboardCtrl.getProductivityAnalytics);

module.exports = router;