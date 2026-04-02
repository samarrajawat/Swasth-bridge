const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, cancelAppointment, completeAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.post('/', protect, roleGuard('patient'), bookAppointment);
router.get('/patient', protect, roleGuard('patient'), getPatientAppointments);
router.put('/cancel/:id', protect, roleGuard('patient'), cancelAppointment);
router.put('/complete/:id', protect, roleGuard('doctor'), completeAppointment);

module.exports = router;
