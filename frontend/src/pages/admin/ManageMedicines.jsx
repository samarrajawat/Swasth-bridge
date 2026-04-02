import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    medicine_name: '', category: 'Tablet', quantity: '', expiry_date: '', price: '', threshold: 20, manufacturer: '', batch_number: '',
  });
  const [filter, setFilter] = useState('all');

  const fetchMeds = async () => {
    try {
      const { data } = await API.get('/medicines');
      setMedicines(data.medicines || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeds(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ medicine_name: '', category: 'Tablet', quantity: '', expiry_date: '', price: '', threshold: 20, manufacturer: '', batch_number: '' });
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditing(med._id);
    setForm({
      medicine_name: med.medicine_name, category: med.category, quantity: med.quantity,
      expiry_date: new Date(med.expiry_date).toISOString().split('T')[0],
      price: med.price, threshold: med.threshold, manufacturer: med.manufacturer || '', batch_number: med.batch_number || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/medicines/${editing}`, form);
      } else {
        await API.post('/medicines', form);
      }
      setShowForm(false);
      fetchMeds();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const deleteMed = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try { await API.delete(`/medicines/${id}`); fetchMeds(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const today = new Date();
  const isLowStock = (m) => m.quantity <= m.threshold;
  const isExpired = (m) => new Date(m.expiry_date) < today;

  const filtered = filter === 'low' ? medicines.filter(isLowStock)
    : filter === 'expired' ? medicines.filter(isExpired)
    : medicines;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medicine Inventory</h1>
          <p className="text-slate-400 mt-1">{medicines.length} medicines · {medicines.filter(isLowStock).length} low stock</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Low stock banner */}
      {medicines.filter(isLowStock).length > 0 && (
        <div className="alert-low-stock">
          <AlertTriangle size={18} className="animate-pulse shrink-0" />
          <span className="font-medium">{medicines.filter(isLowStock).length} medicines need restocking</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all', 'All'], ['low', '⚠️ Low Stock'], ['expired', '🔴 Expired']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-teal-500 text-white' : 'bg-navy-900 text-slate-400 hover:text-white border border-white/10'}`}>{lbl}</button>
        ))}
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 border-teal-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">{editing ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="label">Medicine Name</label>
                <input required value={form.medicine_name} onChange={e => setForm({...form, medicine_name: e.target.value})} placeholder="Paracetamol 500mg" className="input-field" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                  {['Tablet','Capsule','Syrup','Injection','Ointment','Drops','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input type="number" required min="0" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input type="date" required value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Price (₹)</label>
                <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Low Stock Threshold</label>
                <input type="number" required min="1" value={form.threshold} onChange={e => setForm({...form, threshold: +e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Manufacturer</label>
                <input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} placeholder="Cipla" className="input-field" />
              </div>
              <div>
                <label className="label">Batch Number</label>
                <input value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} placeholder="BT001" className="input-field" />
              </div>
              <div className="col-span-full flex gap-3">
                <button type="submit" className="btn-primary text-sm">{editing ? 'Update Medicine' : 'Add Medicine'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="table-header text-left">Medicine</th>
                <th className="table-header text-left">Category</th>
                <th className="table-header text-left">Stock</th>
                <th className="table-header text-left">Expiry</th>
                <th className="table-header text-left">Price</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(med => (
                <tr key={med._id} className={`table-row ${isLowStock(med) ? 'bg-red-500/5' : ''}`}>
                  <td className="table-cell">
                    <p className="font-medium text-white">{med.medicine_name}</p>
                    <p className="text-xs text-slate-400">{med.manufacturer}</p>
                  </td>
                  <td className="table-cell text-slate-400">{med.category}</td>
                  <td className="table-cell">
                    <span className={`font-semibold ${isLowStock(med) ? 'text-red-400' : 'text-white'}`}>{med.quantity}</span>
                    <span className="text-xs text-slate-400"> / {med.threshold}</span>
                  </td>
                  <td className="table-cell">
                    <span className={isExpired(med) ? 'text-red-400' : 'text-slate-300'}>
                      {new Date(med.expiry_date).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="table-cell text-emerald-400">₹{med.price}</td>
                  <td className="table-cell">
                    {isExpired(med) ? <span className="badge-danger">Expired</span>
                      : isLowStock(med) ? <span className="badge-warning">Low Stock</span>
                      : <span className="badge-success">OK</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(med)} className="w-8 h-8 rounded-lg bg-blue-500/10 border border-teal-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteMed(med._id)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageMedicines;
