import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color = 'teal', trend, subtext }) => {
  const colorMap = {
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/20 text-blue-400 border-teal-500/20',
    red: 'bg-red-500/20 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="stat-card group hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
