const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  qualification: String,
  experience: Number,
  availability: {
    type: Boolean,
    default: true,
  },
  opd_timings: {
    shift_1_start: { type: String, default: '09:00' },
    shift_1_end:   { type: String, default: '12:00' },
    shift_2_start: { type: String, default: '13:00' },
    shift_2_end:   { type: String, default: '16:00' },
  },
  leave_dates: {
    type: [String],
    default: [],
  },
  consultation_fee: {
    type: Number,
    default: 300,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
