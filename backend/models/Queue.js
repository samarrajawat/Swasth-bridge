const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    unique: true,
  },
  queue: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Queue', queueSchema);
