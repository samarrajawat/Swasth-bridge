import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, LogOut, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    patient: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    doctor: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    admin: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-navy-800/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {user && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-glow-teal group-hover:scale-110 transition-transform">
            <Activity size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Swasth<span className="text-teal-400">Bridge</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className={`hidden sm:inline-flex badge border ${roleColors[user.role]} capitalize`}>
              {user.role}
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <User size={14} className="text-teal-400" />
              </div>
              <span className="hidden md:block font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
