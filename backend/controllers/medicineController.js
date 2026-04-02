const MedicineInventory = require('../models/MedicineInventory');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await MedicineInventory.find().sort({ medicine_name: 1 });
    res.json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Private (Admin)
const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await MedicineInventory.find({
      $expr: { $lte: ['$quantity', '$threshold'] },
    });
    res.json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add medicine
// @route   POST /api/medicines
// @access  Private (Admin)
const addMedicine = async (req, res) => {
  try {
    const medicine = await MedicineInventory.create(req.body);
    res.status(201).json({ success: true, message: 'Medicine added', medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update medicine stock
// @route   PUT /api/medicines/:id
// @access  Private (Admin)
const updateMedicine = async (req, res) => {
  try {
    const medicine = await MedicineInventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine updated', medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin)
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await MedicineInventory.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllMedicines, getLowStockMedicines, addMedicine, updateMedicine, deleteMedicine };
