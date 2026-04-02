const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicine_name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Other'],
    default: 'Tablet',
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  expiry_date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  threshold: {
    type: Number,
    required: true,
    default: 20,
  },
  manufacturer: String,
  batch_number: String,
}, { timestamps: true });

// Virtual: is low stock
medicineSchema.virtual('is_low_stock').get(function () {
  return this.quantity <= this.threshold;
});

// Virtual: is expired
medicineSchema.virtual('is_expired').get(function () {
  return new Date(this.expiry_date) < new Date();
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MedicineInventory', medicineSchema);
