import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { BedDouble, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const BED_TYPES = ['All', 'ICU', 'General', 'Private', 'Emergency'];

const bedColors = {
  Available: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  Occupied: 'bg-red-500/20 border-red-500/30 text-red-400',
  'Under Maintenance': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
};

const BedAvailability = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState({});
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/beds').then(r => {
      setBeds(r.data.beds || []);
      setStats(r.data.stats || {});
      setLoading(false);
    });
  }, []);

  const filtered = typeFilter === 'All' ? beds : beds.filter(b => b.type === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Bed Availability</h1>
        <p className="text-slate-400 mt-1">Real-time hospital bed status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Beds', value: stats.total, color: 'text-white' },
          { label: 'Available', value: stats.available, color: 'text-emerald-400' },
          { label: 'Occupied', value: stats.occupied, color: 'text-red-400' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400 font-medium">Overall Occupancy</span>
          <span className="text-sm font-semibold text-white">{stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0}%</span>
        </div>
        <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: stats.total ? `${(stats.occupied / stats.total) * 100}%` : '0%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {BED_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${typeFilter === t ? 'bg-teal-500 text-white' : 'bg-navy-900 text-slate-400 hover:text-white border border-white/10'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Bed grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading beds...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filtered.map((bed, i) => (
            <motion.div key={bed._id}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }}
              title={`${bed.bed_number} — ${bed.type} — ${bed.ward}\nStatus: ${bed.status}`}
              className={`p-3 rounded-xl border text-center cursor-default transition-all hover:scale-105 ${bedColors[bed.status]}`}
            >
              <BedDouble size={18} className="mx-auto mb-1" />
              <p className="text-xs font-semibold leading-tight">{bed.bed_number}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-tight truncate">{bed.type}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(bedColors).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${cls}`} />
            <span className="text-xs text-slate-400">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedAvailability;
