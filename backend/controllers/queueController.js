const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Helper to parse time limit
function parseTime(timeStr, baseDate) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Complex mathematics to jump the lunch gap
function calculateWaitInfo(doctor, queue_position, forDateStr) {
  const isToday = forDateStr === new Date().toISOString().split('T')[0];
  const baseDate = isToday ? new Date() : new Date(forDateStr);

  const timings = doctor.opd_timings || {
    shift_1_start: '09:00', shift_1_end: '12:00',
    shift_2_start: '13:00', shift_2_end: '16:00'
  };

  const s1_start = parseTime(timings.shift_1_start, baseDate);
  const s1_end = parseTime(timings.shift_1_end, baseDate);
  const s2_start = parseTime(timings.shift_2_start, baseDate);

  const shift1_duration_mins = (s1_end - s1_start) / 60000;
  const shift1_capacity = Math.floor(shift1_duration_mins / 10);

  let expectedTime;
  if (queue_position <= shift1_capacity) {
    expectedTime = new Date(s1_start.getTime() + (queue_position - 1) * 10 * 60000);
  } else {
    const queueInShift2 = queue_position - shift1_capacity;
    expectedTime = new Date(s2_start.getTime() + (queueInShift2 - 1) * 10 * 60000);
  }

  // Calculate string
  if (isToday) {
    const now = new Date();
    const diffMins = Math.round((expectedTime - now) / 60000);
    
    let stringWait = '';
    if (diffMins <= 0) stringWait = '0 minutes (Due)';
    else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0) stringWait = `${hours} hr ${mins} min`;
      else stringWait = `${mins} min`;
    }
    
    return {
      expectedTime: expectedTime,
      waitString: stringWait,
      timeString: expectedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
  } else {
    return {
      expectedTime: expectedTime,
      waitString: 'N/A', // Future
      timeString: expectedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
  }
}

// @desc    Get queue for a doctor (Today's live waiting list)
// @route   GET /api/queue/:doctorId
// @access  Private
const getQueue = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Dynamic queue: All booked appointments for TODAY, sorted by queue_position
    const queue = await Appointment.find({
      doctor_id: req.params.doctorId,
      date: today,
      status: 'booked'
    })
    .sort({ queue_position: 1 })
    .populate('patient_id', 'name phone age gender')
    .lean();

    // Augment the array with wait times
    const augmentedQueue = queue.map(a => {
      const waitInfo = calculateWaitInfo(doctor, a.queue_position, today);
      return {
        ...a,
        calculated_wait: waitInfo.waitString,
        expected_time: waitInfo.timeString
      };
    });

    const overallWait = queue.length > 0 ? calculateWaitInfo(doctor, queue.length + 1, today).waitString : '0 min';

    res.json({
      success: true,
      queue: augmentedQueue,
      count: queue.length,
      estimated_wait: overallWait,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's position in queue
// @route   GET /api/queue/:doctorId/position
// @access  Private (Patient)
const getMyQueuePosition = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = await Appointment.findOne({
      patient_id: req.user._id,
      doctor_id: req.params.doctorId,
      date: today,
      status: 'booked',
    });

    if (!appointment) return res.json({ success: true, position: null, message: 'No appointment found' });

    const waitInfo = calculateWaitInfo(doctor, appointment.queue_position, today);

    res.json({ 
      success: true, 
      position: appointment.queue_position, 
      appointment_id: appointment._id, 
      estimated_wait: waitInfo.waitString,
      exact_time: waitInfo.timeString
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQueue, getMyQueuePosition, calculateWaitInfo }; // Export helper for appointment booking logic
