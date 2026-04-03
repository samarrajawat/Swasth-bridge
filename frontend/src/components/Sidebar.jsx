import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Calendar, Clock, BedDouble, Stethoscope,
  Users, Package, ChevronRight, Activity,
} from 'lucide-react';

const patientLinks = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/book', icon: Calendar, label: 'Book Appointment' },
  { to: '/patient/appointments', icon: Stethoscope, label: 'My Appointments' },
  { to: '/patient/queue', icon: Clock, label: 'Queue Status' },
  { to: '/patient/beds', icon: BedDouble, label: 'Bed Availability' },
];

const doctorLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/availability', icon: Clock, label: 'My Availability' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/doctors', icon: Users, label: 'Manage Doctors' },
  { to: '/admin/beds', icon: BedDouble, label: 'Manage Beds' },
  { to: '/admin/medicines', icon: Package, label: 'Medicine Inventory' },
];

const roleLinksMap = { patient: patientLinks, doctor: doctorLinks, admin: adminLinks };

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const links = roleLinksMap[user?.role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-navy-800/95 md:bg-navy-800/60 backdrop-blur-sm border-r border-white/10 flex flex-col p-4 gap-1 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-3 pb-4 mb-2 border-b border-white/10">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Navigation</p>
        </div>

        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-30" />
          </NavLink>
        ))}

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
