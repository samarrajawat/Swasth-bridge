import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { BedDouble, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

const bedColors = {
  Available: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  Occupied: 'border-red-500/40 bg-red-500/10 text-red-400',
  'Under Maintenance': 'border-amber-500/40 bg-amber-500/10 text-amber-400',
};

const ManageBeds = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newBed, setNewBed] = useState({ bed_number: '', type: 'General', ward: '', floor: 1 });

  const fetchBeds = async () => {
    try {
      const { data } = await API.get('/beds');
      setBeds(data.beds || []);
      setStats(data.stats || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBeds(); }, []);

  const updateBed = async (id, status) => {
    try {
      await API.put(`/beds/${id}`, { status });
      fetchBeds();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const addBed = async (e) => {
    e.preventDefault();
    try {
      await API.post('/beds', newBed);
      setShowAdd(false);
      setNewBed({ bed_number: '', type: 'General', ward: '', floor: 1 });
      fetchBeds();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const types = ['All', 'ICU', 'General', 'Private', 'Emergency'];
  const filtered = typeFilter === 'All' ? beds : beds.filter(b => b.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Beds</h1>
          <p className="text-slate-400 mt-1">{stats.total} total beds · {stats.available} available</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Bed
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-teal-500/30">
          <h2 className="section-title mb-4">Add New Bed</h2>
          <form onSubmit={addBed} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label">Bed Number</label>
              <input required value={newBed.bed_number} onChange={e => setNewBed({...newBed, bed_number: e.target.value})} placeholder="BED-061" className="input-field" />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={newBed.type} onChange={e => setNewBed({...newBed, type: e.target.value})} className="input-field">
                {['ICU','General','Private','Emergency'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ward</label>
              <input value={newBed.ward} onChange={e => setNewBed({...newBed, ward: e.target.value})} placeholder="General Ward A" className="input-field" />
            </div>
            <div>
              <label className="label">Floor</label>
              <input type="number" min="1" value={newBed.floor} onChange={e => setNewBed({...newBed, floor: +e.target.value})} className="input-field" />
            </div>
            <div className="col-span-full flex gap-3">
              <button type="submit" className="btn-primary text-sm">Add Bed</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, cls: 'text-white' },
          { label: 'Available', value: stats.available, cls: 'text-emerald-400' },
          { label: 'Occupied', value: stats.occupied, cls: 'text-red-400' },
          { label: 'Maintenance', value: stats.maintenance, cls: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${typeFilter === t ? 'bg-teal-500 text-white' : 'bg-navy-900 text-slate-400 hover:text-white border border-white/10'}`}>{t}</button>
        ))}
      </div>

      {/* Bed table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="table-header text-left">Bed No.</th>
                <th className="table-header text-left">Type</th>
                <th className="table-header text-left">Ward</th>
                <th className="table-header text-left">Floor</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(bed => (
                <tr key={bed._id} className="table-row">
                  <td className="table-cell font-semibold text-white">{bed.bed_number}</td>
                  <td className="table-cell">{bed.type}</td>
                  <td className="table-cell text-slate-400">{bed.ward || '—'}</td>
                  <td className="table-cell text-slate-400">{bed.floor || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge border text-xs ${bedColors[bed.status]}`}>{bed.status}</span>
                  </td>
                  <td className="table-cell">
                    <select
                      value={bed.status}
                      onChange={e => updateBed(bed._id, e.target.value)}
                      className="bg-navy-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                    >
                      <option>Available</option>
                      <option>Occupied</option>
                      <option>Under Maintenance</option>
                    </select>
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

export default ManageBeds;
