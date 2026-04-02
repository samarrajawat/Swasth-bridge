import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Clock, Pill, Activity, ArrowRight } from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { strayDelay: 0.1, staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white overflow-hidden relative">
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Swasth<span className="text-teal-400">Bridge</span></span>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/login" className="btn-secondary hidden md:inline-flex items-center gap-2 mr-4 border-white/10">
            Login
          </Link>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Patient Portal <ArrowRight size={18} />
          </Link>
        </motion.div>
      </nav>

      {/* Modern 2-Column Hero Section */}
      <main className="container mx-auto px-6 pt-12 pb-24 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Column: Text & CTA */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:w-1/2 space-y-8 z-20 relative"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> Next Generation Healthcare
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            Healing Through <br />
            <span className="text-teal-400">
              Absolute Sync.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
            Eliminate chaotic waiting rooms. SwasthBridge calculates mathematically precise OPD queues, synchronizes live pharmacy deductions, and secures data through advanced encrypted RBAC tunnels.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/login" className="btn-primary py-4 px-10 text-lg w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg">
              Enter The Ecosystem
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Column: Dynamic 3D Hero Artifact */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring' }}
          className="lg:w-1/2 relative flex justify-center items-center"
        >
          <motion.img 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            src="/hero-asset.png" 
            alt="3D Medical Asset" 
            className="w-full max-w-lg relative z-10"
          />
        </motion.div>

      </main>

      {/* Feature Section */}
      <section className="relative z-20 bg-navy-900 border-t border-white/10 pt-20 pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Mathematical Precision</h2>
            <div className="w-16 h-1 bg-teal-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card p-10 bg-navy-800 hover:border-teal-500/50 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-all">
                <Clock className="text-teal-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Algorithmic Shifts</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our engine inherently understands two-shift gaps. Patients are automatically queued across lunch hours with 100% exact time expectations.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card p-10 bg-navy-800 hover:border-teal-500/50 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-all">
                <Pill className="text-teal-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fluid Pharmacy</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                When a doctor signs a digital prescription, specific hospital inventory is simultaneously debited. Stock-outs simply don't happen.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card p-10 bg-navy-800 hover:border-teal-500/50 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-all">
                <Shield className="text-teal-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Iron-Clad Tunnels</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Role-based routing securely encrypts Patient portals away from Administrative domains. You only ever see what you're authorized to.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
