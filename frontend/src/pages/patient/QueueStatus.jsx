import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Users, Clock, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueStatus = () => {
  const [doctors, setDoctors] = useState([]);
  
  // Independent State for Personal Queue Banners
  const [myTokens, setMyTokens] = useState([]); 
  const [loadingPersonal, setLoadingPersonal] = useState(true);

  // Independent State for Global Queue Explorer
  const [selectedDoc, setSelectedDoc] = useState('');
  const [queue, setQueue] = useState(null);
  const [loadingExplorer, setLoadingExplorer] = useState(false);

  useEffect(() => {
    // 1. Fetch doctors for the dropdown
    API.get('/doctors').then(r => setDoctors(r.data.doctors || []));
    
    // 2. Fetch strictly personal active queues today
    const fetchPersonalTokens = async () => {
      try {
        const { data } = await API.get('/appointments/patient');
        const today = new Date().toISOString().split('T')[0];
        
        // Find their personal booked appointments for today
        const myActiveAppts = (data.appointments || []).filter(
          a => a.date === today && a.status === 'booked'
        );

        if (myActiveAppts.length === 0) {
          setLoadingPersonal(false);
          return;
        }

        // For each active appointment, fetch the precise queue position
        const positionPromises = myActiveAppts.map(async (appt) => {
          const docId = appt.doctor_id._id || appt.doctor_id;
          const posRes = await API.get(`/queue/${docId}/position`);
          return {
            appointment: appt,
            doctor_name: appt.doctor_id.user_id?.name || 'Doctor',
            positionInfo: posRes.data
          };
        });

        const resolvedTokens = await Promise.all(positionPromises);
        setMyTokens(resolvedTokens.filter(t => t.positionInfo && t.positionInfo.position));

        // Default the explorer to their first doctor
        if (resolvedTokens.length > 0) {
          setSelectedDoc(myActiveAppts[0].doctor_id._id || myActiveAppts[0].doctor_id);
        }

      } catch (err) { 
        console.error('Failed to auto-detect personal queues:', err); 
      } finally {
        setLoadingPersonal(false);
      }
    };
    
    fetchPersonalTokens();
  }, []);

  // Global queue fetching
  const fetchGlobalQueue = async () => {
    if (!selectedDoc) return;
    setLoadingExplorer(true);
    try {
      const qRes = await API.get(`/queue/${selectedDoc}`);
      setQueue(qRes.data);
    } catch (e) { console.error(e); }
    finally { setLoadingExplorer(false); }
  };

  // Only trigger global queue fetch when dropdown changes
  useEffect(() => { 
    if (selectedDoc) fetchGlobalQueue(); 
  }, [selectedDoc]);

  // Loader for overall mount
  if (loadingPersonal) {
    return <div className="text-center py-12 text-slate-400 animate-pulse">Detecting your personal queue statuses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Queue Status</h1>
        <p className="text-slate-400 mt-1">Check your personal wait times and explore live hospital queues</p>
      </div>

      {/* STATIC TOP SECTION: Personal Tokens */}
      {myTokens.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-teal-400 border-b border-teal-500/20 pb-2 uppercase tracking-wider">Your Active Tokens Today</h2>
          {myTokens.map((token, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Status with <strong>Dr. {token.doctor_name}</strong></p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-6xl font-black text-white">#{token.positionInfo.position}</p>
                  </div>
                  <p className="text-teal-400 mt-2 font-medium bg-teal-500/10 px-3 py-1 rounded-lg inline-block border border-teal-500/20">
                    Estimated wait: <span className="font-bold">{token.positionInfo.estimated_wait}</span>
                  </p>
                </div>
                <div className="hidden sm:flex w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 items-center justify-center">
                  <Clock size={40} className="text-teal-400 animate-pulse-slow" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 text-center text-slate-400 border border-white/5 bg-navy-800/30">
          You have no active tokens booked for today.
        </div>
      )}

      <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* DYNAMIC BOTTOM SECTION: Global Hospital Queues */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Explore Hospital Queues</h2>
          <p className="text-xs text-slate-400">Select any doctor to view their live waiting list.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <select value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)} className="input-field appearance-none pr-10 border-white/10">
              <option value="">Select a doctor...</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>{d.user_id?.name} — {d.specialization}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={fetchGlobalQueue} disabled={!selectedDoc || loadingExplorer} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={loadingExplorer ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {queue && (
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 bg-navy-800 border-b border-white/10">
              <h2 className="font-medium text-white flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                Public Queue Roster
              </h2>
              <div className="flex gap-2">
                <span className="badge-info">{queue.count} total today</span>
              </div>
            </div>
            {queue.queue?.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-16 h-16 mx-auto bg-navy-800/5 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={24} className="text-emerald-500/50" />
                </div>
                Queue is completely clear today!
              </div>
            ) : (
              <div className="p-4 space-y-3 bg-navy-950/30">
                <AnimatePresence>
                  {queue.queue.map((item, i) => {
                    const isMyToken = myTokens.some(t => t.appointment._id === item._id);
                    return (
                      <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border ${isMyToken ? 'bg-teal-500/10 border-teal-500/30' : 'bg-navy-800 border-white/5'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 drop-shadow-lg' : 'bg-navy-900 text-slate-300'}`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.patient_id?.name || 'Patient'}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">Symptoms: {item.symptoms || 'None'}</p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-slate-400 font-medium bg-navy-950/80 px-2 py-1 rounded-md border border-white/5">
                            Wait: {item.calculated_wait}
                          </span>
                          <p className="text-[10px] text-teal-400 mt-1 block">Expected: {item.expected_time}</p>
                        </div>
                        {isMyToken && (
                          <span className="badge-success text-xs px-2 py-0.5 ml-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">You</span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueStatus;
