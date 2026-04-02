const Bed = require('../models/Bed');

// @desc    Get all beds
// @route   GET /api/beds
// @access  Private
const getAllBeds = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const beds = await Bed.find(filter).populate('patient_id', 'name email phone');
    const stats = {
      total: beds.length,
      available: beds.filter(b => b.status === 'Available').length,
      occupied: beds.filter(b => b.status === 'Occupied').length,
      maintenance: beds.filter(b => b.status === 'Under Maintenance').length,
    };
    res.json({ success: true, stats, beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bed status
// @route   PUT /api/beds/:id
// @access  Private (Admin)
const updateBed = async (req, res) => {
  try {
    const { status, patient_id } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    bed.status = status;
    bed.patient_id = status === 'Occupied' ? patient_id : null;
    bed.admitted_at = status === 'Occupied' ? new Date() : null;
    await bed.save();

    res.json({ success: true, message: 'Bed updated', bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new bed
// @route   POST /api/beds
// @access  Private (Admin)
const addBed = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    res.status(201).json({ success: true, bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllBeds, updateBed, addBed };
