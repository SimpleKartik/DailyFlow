const Activity = require('../models/Activity');

// @desc    Get all activities for user
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id }).populate('category');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
  try {
    const { name, description, category, type, target, unit, frequency, reminderTime, reminderEnabled, color } = req.body;

    const activity = await Activity.create({
      userId: req.user._id,
      name,
      description,
      category: category || null,
      type,
      target,
      unit,
      frequency,
      reminderTime,
      reminderEnabled,
      color
    });

    const populatedActivity = await Activity.findById(activity._id).populate('category');
    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, userId: req.user._id }).populate('category');

    if (activity) {
      res.json(activity);
    } else {
      res.status(404).json({ message: 'Activity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, userId: req.user._id });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const { name, description, category, type, target, unit, frequency, reminderTime, reminderEnabled, color } = req.body;
    
    // Construct updates manually to prevent injecting invalid/restricted fields (like userId)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category || null;
    if (type !== undefined) updates.type = type;
    if (target !== undefined) updates.target = target;
    if (unit !== undefined) updates.unit = unit;
    if (frequency !== undefined) updates.frequency = frequency;
    if (reminderTime !== undefined) updates.reminderTime = reminderTime;
    if (reminderEnabled !== undefined) updates.reminderEnabled = reminderEnabled;
    if (color !== undefined) updates.color = color;

    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category');

    res.json(updatedActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, userId: req.user._id });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.deleteMany({ activityId: activity._id, userId: req.user._id });

    await activity.deleteOne();
    res.json({ message: 'Activity and associated logs removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getActivities,
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity
};
