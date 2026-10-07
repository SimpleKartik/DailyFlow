const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Ensure one log per activity per day
activityLogSchema.index({ userId: 1, activityId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
