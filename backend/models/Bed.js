const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bed_number: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['ICU', 'General', 'Private', 'Emergency'],
    default: 'General',
  },
  ward: String,
  floor: Number,
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Available',
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  admitted_at: Date,
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
