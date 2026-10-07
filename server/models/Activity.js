const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  type: {
    type: String,
    enum: ['boolean', 'time', 'quantity'],
    required: true
  },
  target: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    trim: true,
    default: ''
  },
  frequency: {
    type: [Number], // 0=Sun, 1=Mon, etc. Empty array means everyday
    default: [0, 1, 2, 3, 4, 5, 6]
  },
  reminderTime: {
    type: String, // 'HH:mm'
    default: ''
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#10B981' // default tailwind emerald-500
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
