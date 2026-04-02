import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Users, Star, Phone, Plus, X, Trash2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', qualification: '', experience: 0, consultation_fee: 300,
  });

  const fetchDoctors = () => {
    API.get('/doctors').then(r => { 
      setDoctors(r.data.doctors || []); 
      setLoading(false); 
    }).catch(err => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setAdding(true); setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(form.email)) {
      setError('Invalid email format. Must contain @ and end with .com');
      setAdding(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError('Phone must be exactly 10 digits (numbers only)');
      setAdding(false);
      return;
    }

    try {
      await API.post('/doctors/create', form);
      fetchDoctors();
      setShowAddModal(false);
      setForm({ name: '', email: '', password: '', phone: '', specialization: '', qualification: '', experience: 0, consultation_fee: 300 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this doctor's account?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Doctors</h1>
          <p className="text-slate-400 mt-1">{doctors.length} doctors registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <div key={doc._id} className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center text-xl font-bold text-teal-400 flex-shrink-0">
                  {doc.user_id?.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{doc.user_id?.name}</h3>
                      <p className="text-teal-400 text-sm">{doc.specialization}</p>
                      <p className="text-slate-400 text-xs">{doc.qualification}</p>
                    </div>
                    <span className={`badge border ${doc.availability ? 'badge-success border-emerald-500/30 text-emerald-400' : 'badge-danger border-red-500/30 text-red-400'}`}>
                      {doc.availability ? 'Active' : 'Off'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {doc.rating}</span>
                    <span>{doc.experience}y experience</span>
                    <span>₹{doc.consultation_fee}/visit</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Phone size={12} /> {doc.user_id?.phone || 'N/A'}</span>
                    <span className="flex items-center gap-1 truncate"><Mail size={12} /> {doc.user_id?.email}</span>
                  </div>

                </div>
              </div>

              {/* Delete Button at the bottom */}
              <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleDeleteDoctor(doc._id)}
                  disabled={deletingId === doc._id}
                  className="btn-danger flex items-center gap-1.5 text-xs py-1.5"
                >
                  {deletingId === doc._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Doctor
                </button>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">No doctors registered yet.</div>
          )}
        </div>
      )}

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto overflow-x-hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-glass my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Doctor</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Dr. John Doe" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input name="email" type="email" pattern="^[^\s@]+@[^\s@]+\.com$" title="Must contain @ and end with .com" required value={form.email} onChange={handleChange} placeholder="doctor@hospital.com" className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Password <span className="text-slate-400 text-xs">(for doctor login)</span></label>
                    <input name="password" required value={form.password} onChange={handleChange} minLength="6" type="text" placeholder="Min. 6 chars" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input name="phone" type="tel" pattern="\d{10}" maxLength="10" title="Exactly 10 numeric digits" required value={form.phone} onChange={handleChange} placeholder="Mobile number" className="input-field" />
                  </div>
                </div>

                <div className="border-t border-white/10 my-4 pt-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Specialization</label>
                    <input name="specialization" required value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiology, Pediatrics" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Qualification</label>
                    <input name="qualification" required value={form.qualification} onChange={handleChange} placeholder="e.g. MBBS, MD" className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Experience (Years)</label>
                    <input name="experience" type="number" min="0" required value={form.experience} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Consultation Fee (₹)</label>
                    <input name="consultation_fee" type="number" min="0" required value={form.consultation_fee} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={adding} className="btn-primary flex items-center gap-2">
                    {adding && <Loader2 size={16} className="animate-spin" />}
                    {adding ? 'Creating...' : 'Create Doctor Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageDoctors;
