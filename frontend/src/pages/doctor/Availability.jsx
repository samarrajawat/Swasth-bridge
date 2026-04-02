import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Save, CheckCircle, Clock, CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Availability = () => {
  const [availability, setAvailability] = useState(true);
  
  // Timings State
  const [shift1Start, setShift1Start] = useState('09:00');
  const [shift1End, setShift1End] = useState('12:00');
  const [shift2Start, setShift2Start] = useState('13:00');
  const [shift2End, setShift2End] = useState('16:00');

  // Leave State
  const [leaveDates, setLeaveDates] = useState([]);
  const [newLeaveDate, setNewLeaveDate] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get('/doctors/me').then(r => {
      const d = r.data.doctor;
      setAvailability(d.availability);
      
      if (d.opd_timings) {
        setShift1Start(d.opd_timings.shift_1_start || '09:00');
        setShift1End(d.opd_timings.shift_1_end || '12:00');
        setShift2Start(d.opd_timings.shift_2_start || '13:00');
        setShift2End(d.opd_timings.shift_2_end || '16:00');
      }

      setLeaveDates(d.leave_dates || []);
    });
  }, []);

  const addLeaveDate = () => {
    if (!newLeaveDate) return;
    if (!leaveDates.includes(newLeaveDate)) {
      setLeaveDates([...leaveDates, newLeaveDate].sort());
    }
    setNewLeaveDate('');
  };

  const removeLeaveDate = (date) => {
    setLeaveDates(leaveDates.filter(d => d !== date));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        availability,
        opd_timings: {
          shift_1_start: shift1Start,
          shift_1_end: shift1End,
          shift_2_start: shift2Start,
          shift_2_end: shift2End,
        },
        leave_dates: leaveDates
      };

      await API.put('/doctors/availability', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert(e.response?.data?.message || 'Error saving availability'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Availability & Schedule</h1>
        <p className="text-slate-400 mt-1">Configure your active OPD shifts and manage your leave calendar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Availability toggle */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Master Override</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAvailability(true)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all font-medium ${availability ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-slate-400'}`}
              >
                🟢 Ready
              </button>
              <button
                onClick={() => setAvailability(false)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all font-medium ${!availability ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 text-slate-400'}`}
              >
                🔴 Offline
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">If offline, no one can book you on any date.</p>
          </div>

          {/* Leave Dates */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon size={16} className="text-purple-400"/> My Leave Dates
            </h2>
            <p className="text-xs text-slate-400 mb-4">Block upcoming dates from receiving patient bookings.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="date" 
                value={newLeaveDate} 
                onChange={(e) => setNewLeaveDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Cannot take leave in the past
                className="input-field py-2"
              />
              <button onClick={addLeaveDate} className="btn-secondary py-2 px-4 shrink-0">Add Leave</button>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {leaveDates.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No leave dates scheduled.</p>
                )}
                {leaveDates.map(date => (
                  <motion.div key={date} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {date}
                    <button onClick={() => removeLeaveDate(date)} className="hover:text-white hover:bg-navy-800/10 rounded-full p-0.5 transition-colors">
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Timings */}
        <div className="glass-card p-6 border-teal-500/20 bg-gradient-to-br from-navy-900 to-blue-900/10">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-blue-400"/> Regular OPD Shifts
          </h2>
          <p className="text-xs text-slate-400 mb-6">Patient wait times will be mathematically estimated within these two boundaries.</p>

          <div className="space-y-6">
            {/* Shift 1 */}
            <div className="p-4 bg-navy-950/50 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-medium text-blue-300 text-sm flex items-center gap-2">
                Morning Shift (Shift 1)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                  <input type="time" value={shift1Start} onChange={e => setShift1Start(e.target.value)} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">End Time</label>
                  <input type="time" value={shift1End} onChange={e => setShift1End(e.target.value)} className="input-field" required />
                </div>
              </div>
            </div>

            {/* Shift 2 */}
            <div className="p-4 bg-navy-950/50 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-medium text-amber-300 text-sm flex items-center gap-2">
                Afternoon Shift (Shift 2)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                  <input type="time" value={shift2Start} onChange={e => setShift2Start(e.target.value)} className="input-field" required />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">End Time</label>
                  <input type="time" value={shift2End} onChange={e => setShift2End(e.target.value)} className="input-field" required />
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <p className="text-xs text-amber-400 leading-relaxed">
                <strong>Note:</strong> Time between Shift 1 End and Shift 2 Start is considered your Lunch/Break period. Appointments will automatically bridge this gap mathematically when estimating wait times!
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <button onClick={save} disabled={saving} className="btn-primary py-3 px-8 flex items-center gap-2 text-base font-bold shadow-lg shadow-teal-500/20">
          {saved ? (
            <><CheckCircle size={20} /> Settings Safely Applied!</>
          ) : saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Save size={20} /> Save Schedule Configuration</>
          )}
        </button>
      </div>
    </div>
  );
};

export default Availability;
