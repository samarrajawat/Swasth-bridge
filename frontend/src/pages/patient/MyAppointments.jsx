import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { XCircle, FileText, Calendar, Clock } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppts = async () => {
    try {
      const { data } = await API.get('/appointments/patient');
      setAppointments(data.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppts(); }, []);

  const cancelAppt = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/cancel/${id}`);
      fetchAppts();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => ({
    booked: <span className="badge-info">Booked</span>,
    completed: <span className="badge-success">Completed</span>,
    cancelled: <span className="badge-danger">Cancelled</span>,
  }[s]);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Appointments</h1>
        <p className="text-slate-400 mt-1">View and manage your appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'booked', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-teal-500 text-white' : 'bg-navy-900 text-slate-400 hover:text-white border border-white/10'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a._id} className="glass-card p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 font-bold text-lg flex-shrink-0">
                    {a.doctor_id?.user_id?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{a.doctor_id?.user_id?.name || 'Doctor'}</h3>
                      {statusBadge(a.status)}
                    </div>
                    <p className="text-teal-400 text-sm">{a.doctor_id?.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {a.date}</span>
                      {a.queue_position && <span>Token #{a.queue_position}</span>}
                    </div>
                    {a.symptoms && <p className="text-xs text-slate-400 mt-1.5">Symptoms: {a.symptoms}</p>}
                    {(a.prescription || (a.medicines_prescribed && a.medicines_prescribed.length > 0)) && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-teal-500/20 rounded-lg">
                        {a.prescription && (
                          <p className="text-sm border-b border-teal-500/20 pb-2 mb-2 text-white/90">
                            <strong>Doctor's Notes:</strong> {a.prescription}
                          </p>
                        )}
                        {a.medicines_prescribed && a.medicines_prescribed.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1"><FileText size={12} /> Prescribed Medicines:</p>
                            <ul className="list-disc list-inside text-xs text-slate-300 ml-1 space-y-0.5">
                              {a.medicines_prescribed.map((med, idx) => (
                                <li key={idx}>
                                  {med.medicine_name} — <span className="text-teal-400 font-medium">Qty: {med.quantity}</span> {med.category ? `(${med.category})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {a.status === 'booked' && (
                  <button onClick={() => cancelAppt(a._id)} className="btn-danger flex items-center gap-1 text-xs">
                    <XCircle size={14} /> Cancel
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

export default MyAppointments;
