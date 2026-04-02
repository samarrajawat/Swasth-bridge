const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time_slot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'cancelled'],
    default: 'booked',
  },
  symptoms: String,
  prescription: String,
  medicines_prescribed: [{
    medicine_name: String,
    quantity: Number,
    category: String
  }],
  queue_position: Number,
}, { timestamps: true });

appointmentSchema.index({ doctor_id: 1, date: 1 });
appointmentSchema.index({ patient_id: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
