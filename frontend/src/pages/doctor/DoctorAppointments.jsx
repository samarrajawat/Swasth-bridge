import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { CheckCircle, XCircle, FileText, Calendar, Clock, User } from 'lucide-react';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('booked');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (dateFilter) params.date = dateFilter;
      const { data } = await API.get('/doctors/appointments', { params });
      setAppointments(data.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppts(); }, [filter, dateFilter]);

  const completeAppt = async (id) => {
    const prescription = prompt('Enter prescription notes:') || '';
    try {
      await API.put(`/appointments/complete/${id}`, { prescription });
      fetchAppts();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => ({
    booked: <span className="badge-info">Booked</span>,
    completed: <span className="badge-success">Completed</span>,
    cancelled: <span className="badge-danger">Cancelled</span>,
  }[s]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Patient Appointments</h1>
        <p className="text-slate-400 mt-1">Manage your scheduled appointments</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {['all', 'booked', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-teal-500 text-white' : 'bg-navy-900 text-slate-400 hover:text-white border border-white/10'}`}>
              {f}
            </button>
          ))}
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field w-auto text-sm py-2" />
        {dateFilter && <button onClick={() => setDateFilter('')} className="text-xs text-slate-400 hover:text-red-400">Clear date</button>}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a._id} className="glass-card p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{a.patient_id?.name}</h3>
                      {statusBadge(a.status)}
                    </div>
                    <p className="text-xs text-slate-400">{a.patient_id?.phone} · Age: {a.patient_id?.age} · {a.patient_id?.gender}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {a.time_slot}</span>
                    </div>
                    {a.symptoms && <p className="text-xs text-slate-400 mt-1.5 italic">"{a.symptoms}"</p>}
                    {a.prescription && (
                      <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-xs text-emerald-400 flex items-center gap-1"><FileText size={12} /> {a.prescription}</p>
                      </div>
                    )}
                  </div>
                </div>
                {a.status === 'booked' && (
                  <button onClick={() => completeAppt(a._id)} className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shrink-0">
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
