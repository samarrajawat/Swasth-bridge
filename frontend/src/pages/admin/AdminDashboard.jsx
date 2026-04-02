import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import StatCard from '../../components/StatCard';
import { Users, BedDouble, Package, AlertTriangle, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [docRes, bedRes, medRes, lowRes] = await Promise.all([
          API.get('/doctors'),
          API.get('/beds'),
          API.get('/medicines'),
          API.get('/medicines/low-stock'),
        ]);
        setStats({
          doctors: (docRes.data.doctors || []).length,
          activeDoctors: (docRes.data.doctors || []).filter(d => d.availability).length,
          totalBeds: bedRes.data.stats?.total || 0,
          availableBeds: bedRes.data.stats?.available || 0,
          occupiedBeds: bedRes.data.stats?.occupied || 0,
          medicines: (medRes.data.medicines || []).length,
          lowStock: (lowRes.data.medicines || []).length,
        });
        setLowStock(lowRes.data.medicines || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const quickLinks = [
    { to: '/admin/doctors', icon: Users, label: 'Manage Doctors', color: 'teal', desc: 'View and manage doctor profiles' },
    { to: '/admin/beds', icon: BedDouble, label: 'Manage Beds', color: 'blue', desc: 'Track and update bed status' },
    { to: '/admin/medicines', icon: Package, label: 'Medicine Inventory', color: 'purple', desc: 'Manage stock and alerts' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Admin Dashboard 🏥</h1>
              <p className="text-slate-400 mt-1">System overview and management controls</p>
            </div>
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
              <Activity size={32} className="text-amber-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Low stock alert */}
      {stats.lowStock > 0 && (
        <div className="alert-low-stock">
          <AlertTriangle size={20} className="shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold">{stats.lowStock} medicine(s) running low on stock</p>
            <p className="text-xs opacity-70 mt-0.5">Immediate restocking required</p>
          </div>
          <Link to="/admin/medicines" className="text-xs border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
            View →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Doctors" value={stats.doctors} icon={Users} color="teal" subtext={stats.doctors !== undefined ? `${stats.activeDoctors} active` : undefined} />
        <StatCard label="Total Beds" value={stats.totalBeds} icon={BedDouble} color="blue" subtext={stats.totalBeds !== undefined ? `${stats.availableBeds} available` : undefined} />
        <StatCard label="Occupied Beds" value={stats.occupiedBeds} icon={BedDouble} color="red" subtext={stats.totalBeds ? `${Math.round((stats.occupiedBeds/stats.totalBeds)*100)}% occupancy` : undefined} />
        <StatCard label="Medicine Types" value={stats.medicines} icon={Package} color="purple" subtext={stats.medicines !== undefined ? `${stats.lowStock} low stock` : undefined} />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, color, desc }) => (
          <Link key={to} to={to} className="glass-card p-5 hover:border-white/20 transition-all group hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              } group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-white">{label}</h3>
            <p className="text-sm text-slate-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Low stock list */}
      {lowStock.length > 0 && (
        <div className="glass-card">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="section-title text-red-400 flex items-center gap-2"><AlertTriangle size={18} /> Low Stock Medicines</h2>
            <Link to="/admin/medicines" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="divide-y divide-white/5">
            {lowStock.map(m => (
              <div key={m._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{m.medicine_name}</p>
                  <p className="text-xs text-slate-400">{m.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold">{m.quantity} left</p>
                  <p className="text-xs text-slate-400">Threshold: {m.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
