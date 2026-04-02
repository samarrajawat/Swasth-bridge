const express = require('express');
const router = express.Router();
const {
  createDoctor, deleteDoctor,
  getAllDoctors, getDoctorById,
  updateAvailability, getDoctorAppointments, getMyDoctorProfile,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

// 🔒 Admin-only — create and delete doctor accounts
router.post('/create', protect, roleGuard('admin'), createDoctor);
router.delete('/:id', protect, roleGuard('admin'), deleteDoctor);

// 🩺 Doctor-only
router.get('/me', protect, roleGuard('doctor'), getMyDoctorProfile);
router.get('/appointments', protect, roleGuard('doctor'), getDoctorAppointments);
router.put('/availability', protect, roleGuard('doctor'), updateAvailability);

// 🌐 Any authenticated user
router.get('/', protect, getAllDoctors);
router.get('/:id', protect, getDoctorById);

module.exports = router;
