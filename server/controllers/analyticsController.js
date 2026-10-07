const ActivityLog = require('../models/ActivityLog');
const Activity = require('../models/Activity');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format } = require('date-fns');

// @desc    Get weekly completion stats
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(today, { weekStartsOn: 1 });

    const logs = await ActivityLog.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly completion stats
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyStats = async (req, res) => {
  try {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    const logs = await ActivityLog.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get streak stats
// @route   GET /api/analytics/streaks
// @access  Private
const getStreaks = async (req, res) => {
  try {
    // Basic streak calculation
    const logs = await ActivityLog.find({ userId: req.user._id, completed: true })
      .sort({ date: -1 });

    // This is a simplified streak calculation for all activities globally.
    // In a production app, streak calculation would be per-activity and account for frequency.
    let currentStreak = 0;
    let bestStreak = 0;
    
    // Detailed streak logic can be computed on the client side based on all logs, 
    // or calculated here. We will return the raw logs to the client for complex computations.
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWeeklyStats,
  getMonthlyStats,
  getStreaks
};
