import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../api/axios';
import StatCard from '../../components/StatCard';
import { Calendar, Clock, Users, CheckCircle, Activity, ArrowRight, X, PlusCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prescription Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [docRes, apptRes, medRes] = await Promise.all([
          API.get('/doctors/me'),
          API.get('/doctors/appointments'),
          API.get('/medicines').catch(() => ({ data: { medicines: [] }})), // Safely fetch medicines
        ]);
        const doc = docRes.data.doctor;
        setDoctor(doc);
        setAppointments(apptRes.data.appointments || []);
        setMedicines(medRes.data.medicines || []);
        
        if (doc) {
          const qRes = await API.get(`/queue/${doc._id}`);
          setQueue(qRes.data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const completedToday = todayAppts.filter(a => a.status === 'completed').length;
  const pendingToday = todayAppts.filter(a => a.status === 'booked').length;

  const openCompleteModal = (item) => {
    setSelectedAppt(item);
    setPrescriptionText('');
    setPrescribedMeds([]);
    setSelectedMedId('');
    setSelectedQuantity(1);
    setShowModal(true);
  };

  const addMedicineToPrescription = () => {
    if (!selectedMedId) return;
    const med = medicines.find(m => m._id === selectedMedId);
    if (!med) return;

    // Check if already added
    if (prescribedMeds.some(m => m.medicine_id === med._id)) {
      alert("Medicine already added to prescription.");
      return;
    }

    if (selectedQuantity > med.quantity) {
      alert(`Only ${med.quantity} available in inventory!`);
      return;
    }

    setPrescribedMeds([...prescribedMeds, { 
      medicine_id: med._id, 
      medicine_name: med.medicine_name, 
      category: med.category,
      quantity: selectedQuantity,
      max_stock: med.quantity 
    }]);
    
    setSelectedMedId('');
    setSelectedQuantity(1);
  };

  const removeMedicine = (id) => {
    setPrescribedMeds(prescribedMeds.filter(m => m.medicine_id !== id));
  };

  const submitPrescription = async () => {
    if (!selectedAppt) return;
    setSubmitting(true);
    
    // Format payload precisely for backend
    const payload = {
      prescription: prescriptionText,
      medicines_prescribed: prescribedMeds.map(m => ({ 
        medicine_id: m.medicine_id, 
        medicine_name: m.medicine_name, 
        category: m.category, 
        quantity: m.quantity 
      }))
    };

    try {
      await API.put(`/appointments/complete/${selectedAppt._id}`, payload);
      
      // Refresh queues and appointments
      const [apptRes, qRes, medRes] = await Promise.all([
        API.get('/doctors/appointments'),
        API.get(`/queue/${doctor._id}`),
        API.get('/medicines').catch(() => ({ data: { medicines: [] }}))
      ]);
      setAppointments(apptRes.data.appointments || []);
      setQueue(qRes.data);
      setMedicines(medRes.data.medicines || []);
      setShowModal(false);
    } catch (err) { 
      alert(err.response?.data?.message || 'Error saving prescription'); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-6 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Dr. {user?.name?.split(' ').slice(1).join(' ') || user?.name} 👨‍⚕️</h1>
              <p className="text-slate-400 mt-1">{doctor?.specialization} · {doctor?.qualification}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`badge border ${doctor?.availability ? 'badge-success border-emerald-500/30' : 'badge-danger border-red-500/30'}`}>
                  {doctor?.availability ? '🟢 Accepting Patients' : '🔴 Not Accepting'}
                </span>
                <Link to="/doctor/availability" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
                  Change <ArrowRight size={10} />
                </Link>
              </div>
            </div>
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center">
              <Activity size={32} className="text-teal-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Patients" value={todayAppts.length} icon={Calendar} color="teal" />
        <StatCard label="Completed" value={completedToday} icon={CheckCircle} color="emerald" />
        <StatCard label="Pending" value={pendingToday} icon={Clock} color="amber" />
        <StatCard label="Queue Length" value={queue?.count ?? 0} icon={Users} color="blue" />
      </div>

      {/* Current queue */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="section-title">Today's Queue</h2>
          {queue?.count > 0 && <span className="badge-warning">{queue.estimated_wait} remaining wait</span>}
        </div>
        {!queue || queue.count === 0 ? (
          <div className="p-8 text-center text-slate-400">Queue is empty for today</div>
        ) : (
          <div className="divide-y divide-white/5">
            {queue.queue?.map((item, i) => (
              <div key={item._id} className="flex items-center gap-4 p-4 hover:bg-navy-800/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-navy-700 text-slate-400'}`}>
                  #{item.queue_position}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{item.patient_id?.name}</p>
                  <p className="text-xs text-slate-400">OPD Token · Symptoms: {item.symptoms || 'Not specified'}</p>
                </div>
                {i === 0 && (
                  <button onClick={() => openCompleteModal(item)} className="btn-primary text-sm py-2 px-4 text-xs font-bold">
                    Check Patient
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {showModal && selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy-800 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-navy-950/50">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={20} /> Complete Checkup
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Patient: <span className="text-white font-medium">{selectedAppt.patient_id?.name}</span> (Token #{selectedAppt.queue_position})
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800/5">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-6">
                {/* Doctor Notes */}
                <div>
                  <label className="label text-teal-400">Prescription Notes & Diagnosis</label>
                  <textarea 
                    value={prescriptionText} 
                    onChange={e => setPrescriptionText(e.target.value)} 
                    placeholder="Enter medical notes, diagnosis, or advice here..." 
                    className="input-field min-h-[100px] resize-y"
                  />
                </div>

                {/* Medicine Inventory Link */}
                <div className="p-4 bg-navy-950/50 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-1 flex items-center gap-2">
                      <Activity size={16} className="text-amber-400" /> Prescribe Medicine (Inventory)
                    </h3>
                    <p className="text-xs text-slate-400">Select medicines directly from the hospital pharmacy. Quantities will automatically deduct.</p>
                  </div>
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">Medicine</label>
                      <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)} className="input-field text-sm py-2">
                        <option value="">Select inventory medicine...</option>
                        {medicines.filter(m => m.quantity > 0).map(m => (
                          <option key={m._id} value={m._id}>{m.medicine_name} ({m.category || 'Other'}) — {m.quantity} in stock</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
                      <input type="number" min="1" value={selectedQuantity} onChange={e => setSelectedQuantity(parseInt(e.target.value) || 1)} className="input-field text-sm py-2" />
                    </div>
                    <button type="button" onClick={addMedicineToPrescription} className="btn-secondary py-2 px-3 flex items-center gap-1">
                      <PlusCircle size={16} /> Add
                    </button>
                  </div>

                  {prescribedMeds.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs text-slate-400 block border-b border-white/10 pb-1">Added to Prescription:</label>
                      {prescribedMeds.map(m => (
                        <div key={m.medicine_id} className="flex items-center justify-between bg-navy-800 border border-white/5 p-2 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-white">{m.medicine_name}</p>
                            <p className="text-xs text-teal-400">{m.quantity}x {m.category}</p>
                          </div>
                          <button onClick={() => removeMedicine(m.medicine_id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-navy-950/80">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={submitPrescription} disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Save & Complete Treatment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;
