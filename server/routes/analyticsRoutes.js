const express = require('express');
const router = express.Router();
const { getWeeklyStats, getMonthlyStats, getStreaks } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/weekly', protect, getWeeklyStats);
router.get('/monthly', protect, getMonthlyStats);
router.get('/streaks', protect, getStreaks);

module.exports = router;
