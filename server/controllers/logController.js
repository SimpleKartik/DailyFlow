const ActivityLog = require('../models/ActivityLog');
const startOfDay = require('date-fns/startOfDay');
const endOfDay = require('date-fns/endOfDay');

// @desc    Get logs for a specific date range
// @route   GET /api/logs
// @access  Private
const getLogs = async (req, res) => {
  try {
    const { startDate, endDate, activityId } = req.query;
    let query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (activityId) {
      query.activityId = activityId;
    }

    const logs = await ActivityLog.find(query).populate('activityId');
    res.json(logs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create or update log (upsert)
// @route   POST /api/logs
// @access  Private
const upsertLog = async (req, res) => {
  try {
    const { activityId, date, value, completed, note } = req.body;
    
    // Normalize date to midnight UTC for consistent querying
    const logDate = new Date(date);
    logDate.setUTCHours(0,0,0,0);

    const log = await ActivityLog.findOneAndUpdate(
      { userId: req.user._id, activityId, date: logDate },
      { value, completed, note },
      { new: true, upsert: true }
    ).populate('activityId');

    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a specific log by ID
// @route   PUT /api/logs/:id
// @access  Private
const updateLog = async (req, res) => {
  try {
    const log = await ActivityLog.findOne({ _id: req.params.id, userId: req.user._id });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    const { value, completed, note } = req.body;
    
    log.value = value !== undefined ? value : log.value;
    log.completed = completed !== undefined ? completed : log.completed;
    log.note = note !== undefined ? note : log.note;

    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete log
// @route   DELETE /api/logs/:id
// @access  Private
const deleteLog = async (req, res) => {
  try {
    const log = await ActivityLog.findOne({ _id: req.params.id, userId: req.user._id });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    await log.deleteOne();
    res.json({ message: 'Log removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getLogs,
  upsertLog,
  updateLog,
  deleteLog
};
