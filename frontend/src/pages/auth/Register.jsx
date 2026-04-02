import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', age: '', gender: 'Male',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(form.email)) {
      setError('Invalid email format. Must contain @ and end with .com');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError('Phone must be exactly 10 digits (numbers only)');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const { confirmPassword, ...submitData } = form;
    const result = await register(submitData);
    if (result.success) {
      navigate('/patient');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Swasth<span className="text-teal-400">Bridge</span></h1>
          </div>
          <p className="text-slate-400">Hospital Management System</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Create Patient Account</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                id="reg-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                pattern="^[^\s@]+@[^\s@]+\.com$"
                title="Must contain @ and end with .com"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  pattern="\d{10}"
                  title="Exactly 10 numeric digits"
                  maxLength="10"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Age</label>
                <input
                  id="reg-age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                id="reg-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field"
              />
            </div>

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Info note */}
        <div className="mt-4 glass-card p-4 flex items-start gap-3">
          <span className="text-lg">🏥</span>
          <div>
            <p className="text-xs text-slate-400 font-medium">Are you a doctor?</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Doctor accounts are created by the hospital administrator. Contact your hospital admin to get your login credentials.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
