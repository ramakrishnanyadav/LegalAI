import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Network, Database, LockKeyhole, FileCode2, Terminal, ShieldCheck, Filter, ChevronDown, User, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TiltCard from './TiltCard';

interface Counsel {
  id: string;
  name: string;
  barNumber: string;
  yearsExperience: number;
  location: string;
  specializations: string[];
  courts: string[];
  languages: string[];
  consultationFee: string;
  availability: string;
  image: string;
  verified: boolean;
}

const counsels: Counsel[] = [
  {
    id: 'ADV-01',
    name: 'Adv. Priya Sharma',
    barNumber: 'D/1234/2012',
    yearsExperience: 12,
    location: 'Mumbai, Maharashtra',
    specializations: ['Criminal Defense', 'Bail Applications', 'Trial Advocacy'],
    courts: ['Bombay HC', 'Mumbai Sessions'],
    languages: ['ENG', 'HIN', 'MAR'],
    consultationFee: '₹2,000 - ₹5,000',
    availability: '< 48 Hours',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-02',
    name: 'Adv. Rajesh Kumar',
    barNumber: 'DL/5678/2008',
    yearsExperience: 16,
    location: 'New Delhi',
    specializations: ['White Collar', 'Finance Fraud', 'Corp Breach'],
    courts: ['Delhi HC', 'Patiala House'],
    languages: ['ENG', 'HIN', 'PUN'],
    consultationFee: '₹3,000 - ₹8,000',
    availability: '3 Days',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-03',
    name: 'Adv. Meera Patel',
    barNumber: 'KA/9012/2014',
    yearsExperience: 10,
    location: 'Bangalore, Karnataka',
    specializations: ['Cyber Crime', 'IT Act', 'Data Privacy'],
    courts: ['Karnataka HC', 'BLR Civil'],
    languages: ['ENG', 'HIN', 'KAN'],
    consultationFee: '₹1,500 - ₹4,000',
    availability: '< 24 Hours',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-04',
    name: 'Adv. Arjun Reddy',
    barNumber: 'TN/3456/2010',
    yearsExperience: 14,
    location: 'Chennai, Tamil Nadu',
    specializations: ['Crim Appeals', 'POCSO', 'Asset Protect'],
    courts: ['Madras HC', 'Chennai Dist'],
    languages: ['ENG', 'HIN', 'TAM'],
    consultationFee: '₹2,500 - ₹6,000',
    availability: '48 Hours',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
];

const specializationsDesc = ['ALL_SPECS', 'CRIM_DEFENSE', 'CYBER_CRIME', 'WHITE_COLLAR'];
const locationsDesc = ['ALL_SECTORS', 'MUMBAI', 'DELHI', 'BANGALORE', 'CHENNAI'];

const springConfig = { damping: 20, stiffness: 300 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', ...springConfig } },
};

// Clearance Badge Component
const ClearanceBadge = () => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full cursor-help hover:bg-[#10B981]/20 transition-colors">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
        <span className="text-[10px] text-[#10B981] font-mono font-bold tracking-widest uppercase">Cleared</span>
      </div>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-[#0A0F1C]/90 backdrop-blur-md border border-[#10B981]/40 p-2 text-[10px] text-[#A6E3E9] font-mono uppercase text-center shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0A0F1C] border-t border-l border-[#10B981]/40 rotate-45" />
          BAR COUNCIL AUTHENTICATION LOGGED
        </div>
      </div>
    </div>
  );
};

// Counsel Card
const CounselCard = ({ lawyer }: { lawyer: Counsel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRequestClick = () => {
    if (!user) {
      toast.error('Authentication required to contact counsel.');
      navigate('/login');
    } else {
      navigate('/lawyers');
    }
  };

  return (
    <TiltCard className="group" maxTilt={5}>
      <motion.div variants={cardVariants} className="relative h-full flex flex-col">
        {/* Hover beam edge */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex-1 bg-[#0A0F1C]/80 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-xl group-hover:border-[#3B82F6]/30 transition-colors">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-[#03060D] border border-white/20 overflow-hidden transform group-hover:scale-105 transition-transform">
                  <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                {/* Cyber corner brackets */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#3B82F6]" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#3B82F6]" />
              </div>

              <div>
                <h3 className="font-mono text-[#E2E8F0] text-lg font-bold tracking-widest">{lawyer.name}</h3>
                <p className="text-[10px] font-mono text-blue-400/60 uppercase">BAR_NO: {lawyer.barNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Database className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[10px] font-mono text-[#10B981]/70">{lawyer.yearsExperience} YR_PRACTICE</span>
                </div>
              </div>
            </div>
            {lawyer.verified && <ClearanceBadge />}
          </div>

          {/* Specs / Arrays */}
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">&gt; AREA_OF_PRACTICE</p>
              <div className="flex flex-wrap gap-2">
                {lawyer.specializations.map((spec) => (
                  <span key={spec} className="px-2 py-1 bg-white/[0.03] border border-white/10 text-[10px] font-mono text-blue-100/60 uppercase tracking-widest">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">&gt; AUTHORIZED_COURTS</p>
              <div className="space-y-1">
                {lawyer.courts.map((court) => (
                  <div key={court} className="flex items-center gap-2 text-[11px] font-mono text-[#E2E8F0]/80">
                    <Terminal className="w-3 h-3 text-purple-400" />
                    <span>{court}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer metrics & Action */}
          <div className="mt-auto pt-5 border-t border-white/10">
            <div className="flex items-end justify-between mb-4 font-mono">
              <div>
                <p className="text-[10px] text-white/30 tracking-widest uppercase">CONSULTATION_FEE</p>
                <p className="text-sm text-yellow-500/90 font-bold">{lawyer.consultationFee}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30 tracking-widest uppercase">AVAILABILITY</p>
                <p className="text-[12px] text-blue-400">{lawyer.availability}</p>
              </div>
            </div>

            <button
              onClick={handleRequestClick}
              className="w-full relative group/btn flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/40 text-[11px] font-mono text-blue-100 uppercase tracking-widest hover:border-blue-400 transition-colors overflow-hidden"
            >
              {user ? (
                <>
                  <LockKeyhole className="w-3.5 h-3.5" />
                  Request Link
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  Auth Read-Only
                </>
              )}
              {/* Scanline hover effect on button */}
              <div className="absolute inset-0 bg-blue-400/20 -translate-y-full group-hover/btn:translate-y-full transition-transform duration-1000 ease-in-out" />
            </button>
          </div>

        </div>
      </motion.div>
    </TiltCard>
  );
};

const LawyerMarketplace = () => {
  const [filter, setFilter] = useState('ALL_SPECS');

  return (
    <section className="py-24 px-4 bg-[#03060D] relative overflow-hidden text-[#E2E8F0]">
      {/* Background Matrix element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#1E1B4B]/30 to-[#0F172A]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', ...springConfig }}
          className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8"
        >
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
              <Network className="w-4 h-4" />
              Legal Counsel Grid
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
              Verified <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Advocates</span>
            </h2>
          </div>
          
          <div className="text-right md:w-1/3">
            <p className="font-mono text-[11px] leading-loose text-white/40 uppercase tracking-widest text-left md:text-right">
              Network populated with independently verified legal counsel. Credentials authenticated via state databases.
            </p>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-10"
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest mr-4">
            <Filter className="w-3.5 h-3.5" />
            Sort Parameters:
          </div>
          {specializationsDesc.map(spec => (
            <button
              key={spec}
              onClick={() => setFilter(spec)}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all ${
                filter === spec 
                ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50' 
                : 'bg-white/[0.02] text-white/40 border border-white/10 hover:border-white/30'
              }`}
            >
              {spec}
            </button>
          ))}
        </motion.div>

        {/* Grid Output */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {counsels.map((counsel) => (
            <CounselCard key={counsel.id} lawyer={counsel} />
          ))}
        </motion.div>

        {/* System Expand action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', ...springConfig, delay: 0.4 }}
        >
          <Link to="/lawyers" className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02] font-mono text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-all">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Expand Network Scope
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default LawyerMarketplace;
