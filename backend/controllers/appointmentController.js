const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const MedicineInventory = require('../models/MedicineInventory');
const { calculateWaitInfo } = require('./queueController');

// @desc    Book appointment (OPD Token system per date)
// @route   POST /api/appointments
// @access  Private (Patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, date, symptoms } = req.body;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.availability) return res.status(400).json({ success: false, message: 'Doctor is not available' });

    const patientExisting = await Appointment.findOne({
      patient_id: req.user._id, doctor_id, date, status: 'booked',
    });
    if (patientExisting) return res.status(400).json({ success: false, message: 'You already have a token for this doctor on this date' });

    // Ensure the date is not a leave date
    if (doctor.leave_dates && doctor.leave_dates.includes(date)) {
      return res.status(400).json({ success: false, message: 'Doctor is on leave on this date' });
    }

    // Ensure OPD hasn't ended if booking for today
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr) {
      const timings = doctor.opd_timings || { shift_2_end: '16:00' };
      const [h, m] = timings.shift_2_end.split(':').map(Number);
      const now = new Date();
      const endOfShift = new Date();
      endOfShift.setHours(h, m, 0, 0);
      
      if (now > endOfShift) {
        return res.status(400).json({ success: false, message: 'OPD shifts have ended for today. Please select a future date.' });
      }
    }

    // Calculate token number (queue position starts from 1 per doctor per date)
    const countForDate = await Appointment.countDocuments({ doctor_id, date });
    const queuePosition = countForDate + 1;

    const appointment = await Appointment.create({
      patient_id: req.user._id,
      doctor_id,
      date,
      time_slot: 'OPD Token', // Fallback for schema
      symptoms,
      queue_position: queuePosition,
    });

    const waitInfo = calculateWaitInfo(doctor, queuePosition, date);

    res.status(201).json({
      success: true,
      message: 'Token generated successfully',
      appointment,
      queue_position: queuePosition,
      estimated_wait: waitInfo.waitString,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient
// @access  Private (Patient)
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient_id: req.user._id })
      .populate({ path: 'doctor_id', populate: { path: 'user_id', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/cancel/:id
// @access  Private (Patient)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.patient_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status !== 'booked') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete appointment (Doctor calls this)
// @route   PUT /api/appointments/complete/:id
// @access  Private (Doctor)
const completeAppointment = async (req, res) => {
  try {
    const { prescription, medicines_prescribed } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor || appointment.doctor_id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'completed';
    appointment.prescription = prescription;
    
    // Store array in the appointment model forever for future reference
    if (medicines_prescribed && medicines_prescribed.length > 0) {
      appointment.medicines_prescribed = medicines_prescribed.map(m => ({
        medicine_name: m.medicine_name,
        quantity: m.quantity,
        category: m.category
      }));
    }

    await appointment.save();

    // Deduct medicine inventory if prescribed
    if (medicines_prescribed && medicines_prescribed.length > 0) {
      for (const med of medicines_prescribed) {
        const medicine = await MedicineInventory.findById(med.medicine_id);
        if (medicine && medicine.quantity >= med.quantity) {
          medicine.quantity -= med.quantity;
          await medicine.save();
        }
      }
    }

    res.json({ success: true, message: 'Appointment completed', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { bookAppointment, getPatientAppointments, cancelAppointment, completeAppointment };
