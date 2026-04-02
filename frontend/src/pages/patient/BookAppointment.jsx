import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Search, Star, DollarSign, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', symptoms: '' });
  const [search, setSearch] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/doctors').then(r => { setDoctors(r.data.doctors || []); setLoading(false); });
  }, []);

  const filtered = doctors.filter(d =>
    d.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true); setError('');
    try {
      const { data } = await API.post('/appointments', { doctor_id: selected._id, ...form });
      setResult(data);
      setSelected(null);
      setForm({ date: '', symptoms: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  const handleSelectDoctor = (doc) => {
    if (!doc.availability) return;
    if (selected?._id === doc._id) {
      setSelected(null);
    } else {
      setSelected(doc);
      setForm({ date: '', symptoms: '' });
      setResult(null);
      setError('');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Book Doctor</h1>
        <p className="text-slate-400 mt-1">Select a doctor and a date to get your OPD Token</p>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <CheckCircle size={24} />
            <h3 className="font-semibold text-lg">Token Generated!</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="text-slate-400">Date:</span> 
              <span className="text-white font-bold ml-2">{result.appointment?.date}</span>
            </div>
            <div>
              <span className="text-slate-400">Queue Number:</span> 
              <span className="text-white font-bold ml-2 text-lg">#{result.queue_position}</span>
            </div>
            {result.appointment?.date === today && (
              <div className="col-span-2">
                <span className="text-slate-400">Estimated Current Wait:</span> 
                <span className="text-amber-400 font-bold ml-2">{result.estimated_wait}</span>
              </div>
            )}
          </div>
          <button onClick={() => setResult(null)} className="btn-secondary mt-4 text-sm">Book Another</button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by doctor name or specialization..."
          className="input-field pl-12"
        />
      </div>

      {/* Doctors grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <motion.div key={doc._id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
              className={`glass-card p-5 cursor-pointer transition-all duration-200 ${selected?._id === doc._id ? 'border-teal-500/50 bg-teal-500/5' : 'hover:border-white/20'} ${!doc.availability ? 'opacity-60' : ''}`}
              onClick={() => handleSelectDoctor(doc)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500/30 to-blue-500/30 rounded-xl flex items-center justify-center text-lg font-bold text-teal-400">
                  {doc.user_id?.name?.charAt(0) || 'D'}
                </div>
                {doc.availability
                  ? <span className="badge-success">Available</span>
                  : <span className="badge-danger">Unavailable</span>
                }
              </div>
              <h3 className="font-semibold text-white">{doc.user_id?.name}</h3>
              <p className="text-teal-400 text-sm font-medium">{doc.specialization}</p>
              <p className="text-slate-400 text-xs mt-0.5">{doc.qualification} · {doc.experience}y exp</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" /> {doc.rating}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} className="text-emerald-400" /> ₹{doc.consultation_fee}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking form */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6 border-teal-500/30">
            <h2 className="section-title mb-4">Book with {selected.user_id?.name}</h2>
            {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleBook}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Date</label>
                  <input type="date" min={today} required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label">Symptoms</label>
                  <input required value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} placeholder="Brief description..." className="input-field" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={booking || !form.date} className="btn-primary flex items-center gap-2">
                  {booking ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Get Queue Number
                </button>
                <button type="button" onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookAppointment;
// Force Vite HMR Cache Clear
