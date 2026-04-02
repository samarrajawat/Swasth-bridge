import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import API from '../../api/axios';
import { Calendar, Clock, BedDouble, Stethoscope, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, pending: 0, availableBeds: 0, activeDoctors: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, bedRes, docRes] = await Promise.all([
          API.get('/appointments/patient'),
          API.get('/beds?status=Available'),
          API.get('/doctors'),
        ]);

        const appts = apptRes.data.appointments || [];
        setRecentAppointments(appts.slice(0, 5));
        setStats({
          appointments: appts.length,
          pending: appts.filter(a => a.status === 'booked').length,
          availableBeds: bedRes.data.stats?.available || 0,
          activeDoctors: (docRes.data.doctors || []).filter(d => d.availability).length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statusBadge = (s) => ({
    booked: <span className="badge-info">Booked</span>,
    completed: <span className="badge-success">Completed</span>,
    cancelled: <span className="badge-danger">Cancelled</span>,
  }[s]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card p-6 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-slate-400 mt-1">Track your health journey with SwasthBridge</p>
            </div>
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center">
              <Activity size={32} className="text-teal-400 animate-pulse-slow" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={stats.appointments} icon={Calendar} color="teal" />
        <StatCard label="Pending Visits" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Available Beds" value={stats.availableBeds} icon={BedDouble} color="emerald" />
        <StatCard label="Active Doctors" value={stats.activeDoctors} icon={Stethoscope} color="blue" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/patient/book" className="glass-card p-5 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-teal-500/30 transition-colors">
                <Calendar size={20} className="text-teal-400" />
              </div>
              <h3 className="font-semibold text-white">Book Appointment</h3>
              <p className="text-sm text-slate-400 mt-0.5">Schedule with a doctor</p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/patient/queue" className="glass-card p-5 hover:border-amber-500/30 transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
                <Clock size={20} className="text-amber-400" />
              </div>
              <h3 className="font-semibold text-white">Queue Status</h3>
              <p className="text-sm text-slate-400 mt-0.5">Check your wait time</p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent appointments */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="section-title">Recent Appointments</h2>
          <Link to="/patient/appointments" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No appointments yet. <Link to="/patient/book" className="text-teal-400">Book one!</Link></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="table-header text-left">Doctor</th>
              <th className="table-header text-left">Date</th>
              <th className="table-header text-left">Slot</th>
              <th className="table-header text-left">Status</th>
            </tr></thead>
            <tbody>
              {recentAppointments.map(a => (
                <tr key={a._id} className="table-row">
                  <td className="table-cell font-medium text-white">{a.doctor_id?.user_id?.name || 'Dr. —'}</td>
                  <td className="table-cell">{a.date}</td>
                  <td className="table-cell">{a.time_slot}</td>
                  <td className="table-cell">{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
