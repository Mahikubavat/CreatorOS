const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', dashboardCtrl.getOverview);
router.get('/content-analytics', dashboardCtrl.getContentAnalytics);

module.exports = router;