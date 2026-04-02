const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Admin creates a new doctor account + profile
// @route   POST /api/doctors/create
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    const {
      // User account fields
      name, email, password, phone,
      // Doctor profile fields
      specialization, qualification, experience, consultation_fee,
      opd_timings, leave_dates, rating,
    } = req.body;

    if (!name || !email || !password || !specialization || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, phone, and specialization are required' });
    }

    // Strict Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format. Must contain @ and .com' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone must be exactly 10 digits and numbers only' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user account with role=doctor
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      phone: phone || '',
    });

    // Create doctor profile linked to that user
    const doctor = await Doctor.create({
      user_id: user._id,
      specialization: specialization || 'General Physician',
      qualification: qualification || 'MBBS',
      experience: experience || 0,
      consultation_fee: consultation_fee || 300,
      opd_timings: opd_timings || {
        shift_1_start: '09:00', shift_1_end: '12:00',
        shift_2_start: '13:00', shift_2_end: '16:00'
      },
      leave_dates: leave_dates || [],
      rating: rating || 4.5,
      availability: true,
    });

    // Populate user info before returning
    const populated = await Doctor.findById(doctor._id).populate('user_id', 'name email phone');

    res.status(201).json({
      success: true,
      message: `Doctor account created for ${name}`,
      doctor: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin deletes a doctor (removes profile + user account)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const userId = doctor.user_id;

    // Remove doctor profile and their user account
    await Doctor.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Doctor account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors with user info
// @route   GET /api/doctors
// @access  Private
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user_id', 'name email phone');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user_id', 'name email phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor)
const updateAvailability = async (req, res) => {
  try {
    const { availability, opd_timings, leave_dates } = req.body;
    const doctor = await Doctor.findOne({ user_id: req.user._id });

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    if (typeof availability !== 'undefined') doctor.availability = availability;
    if (opd_timings) doctor.opd_timings = opd_timings;
    if (leave_dates) doctor.leave_dates = leave_dates;

    await doctor.save();
    res.json({ success: true, message: 'Availability updated', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { date, status } = req.query;
    const filter = { doctor_id: doctor._id };
    if (date) filter.date = date;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient_id', 'name email phone age gender')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor profile for logged-in doctor user
// @route   GET /api/doctors/me
// @access  Private (Doctor)
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.user._id }).populate('user_id', 'name email phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDoctor, deleteDoctor, getAllDoctors, getDoctorById, updateAvailability, getDoctorAppointments, getMyDoctorProfile };
