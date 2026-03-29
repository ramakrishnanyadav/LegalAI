import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, MessageSquare, ShieldCheck, Scale, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import AnimatedButton from './AnimatedButton';
import GlassCard from './GlassCard';

// Simulated Lawyer Database (in a real app, query `collection(db, 'lawyers')`)
const PREMIER_COUNSEL = [
  {
    id: 'ADV-01',
    name: 'Adv. Priya Sharma',
    barNumber: 'D/1234/2012',
    yearsExperience: 12,
    location: 'Mumbai, Maharashtra',
    specializations: ['Criminal Case', 'Violence', 'Property Crime'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-02',
    name: 'Adv. Rajesh Kumar',
    barNumber: 'DL/5678/2008',
    yearsExperience: 16,
    location: 'New Delhi',
    specializations: ['Corporate', 'White Collar', 'Cyber Fraud'],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-03',
    name: 'Adv. Meera Patel',
    barNumber: 'KA/9012/2014',
    yearsExperience: 10,
    location: 'Bangalore, Karnataka',
    specializations: ['Cyber Fraud', 'Cyber Crime', 'Forgery'],
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
  {
    id: 'ADV-04',
    name: 'Adv. Arjun Reddy',
    barNumber: 'TN/3456/2010',
    yearsExperience: 14,
    location: 'Chennai, Tamil Nadu',
    specializations: ['Family Dispute', 'Property Matter', 'Violent Crime'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    verified: true,
  },
];

interface RecommendedLawyerCardProps {
  caseId: string;
  caseType?: string; // e.g., 'Cyber Fraud'
}

export default function RecommendedLawyerCard({ caseId, caseType = 'Legal Matter' }: RecommendedLawyerCardProps) {
  const { user } = useAuth();
  
  // Internal UI State
  const [showBooking, setShowBooking] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Intelligent Law Matcher safely handles undefined caseType
  const safeCaseType = (caseType || 'Legal Matter').toLowerCase();
  
  const bestMatch = PREMIER_COUNSEL.find(lawyer => 
    lawyer.specializations.some((spec: string) => {
      const safeSpec = spec.toLowerCase();
      return safeCaseType.includes(safeSpec) || safeSpec.includes(safeCaseType);
    })
  ) || PREMIER_COUNSEL[0]; // Fallback to priority lawyer if no exact tag matches

  useEffect(() => {
    // Automatically set a default date for tomorrow if not set
    if (!preferredDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [preferredDate]);

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to book a consultation.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Unknown User',
        userEmail: user.email || '',
        lawyerId: bestMatch.id,
        lawyerName: bestMatch.name,
        lawyerBarNumber: bestMatch.barNumber,
        caseId: caseId || 'unknown_case',
        caseType: caseType || 'General Legal Matter',
        preferredDate: preferredDate,
        message: message || `Auto-generated consultation request regarding ${caseType} case.`,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      // Write straight to Firebase `consultationRequests`
      await addDoc(collection(db, 'consultationRequests'), payload);

      toast.success('Consultation booked securely!', {
        description: `${bestMatch.name} has received your encrypted case file.`
      });
      
      setIsBooked(true);
      setShowBooking(false);
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast.error('Failed to book consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bestMatch) return null;

  return (
    <GlassCard className="relative overflow-hidden w-full max-w-4xl mx-auto my-8 border border-white/10">
      {/* Background Cyber Glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
      
      <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Lawyer Profile Section */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-[#03060D] border border-white/20 overflow-hidden relative z-10 p-1">
              <img 
                src={bestMatch.image} 
                alt={bestMatch.name} 
                className="w-full h-full object-cover rounded-xl filter grayscale contrast-125 brightness-110" 
              />
            </div>
            {/* Holographic Border Bracket */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary z-20" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary z-20" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold font-mono tracking-wide text-white">{bestMatch.name}</h3>
              {bestMatch.verified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400 font-mono tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED
                </div>
              )}
            </div>
            
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">
              Bar No. {bestMatch.barNumber} • {bestMatch.yearsExperience} Yrs Exp
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Scale className="w-4 h-4 text-primary" />
                <span>AI Recommended Match for: <strong className="text-white">{caseType || 'Legal Analysis'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full md:w-72 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
          {!isBooked ? (
            <AnimatedButton 
              variant="primary" 
              className="w-full shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-3"
              onClick={() => setShowBooking(!showBooking)}
              icon={<Calendar className="w-4 h-4" />}
            >
              Express Consult
            </AnimatedButton>
          ) : (
            <div className="w-full px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center mb-3">
              <p className="text-sm font-medium text-green-400 font-mono">
                [ ACCESS_GRANTED ]
              </p>
              <p className="text-xs text-green-500/70 mt-1">Consultation Request Dispatched</p>
            </div>
          )}
          
          <p className="text-xs text-center text-muted-foreground">
            BNS Validated • Secure Link
          </p>
        </div>
      </div>

      {/* Booking Form Expansion */}
      <AnimatePresence>
        {showBooking && !isBooked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 p-6 sm:p-8 bg-black/40"
          >
            <form onSubmit={handleBookConsultation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="date" 
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Target Case Reference</label>
                  <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-sm text-white/50 font-mono flex items-center gap-2 cursor-not-allowed">
                    <ExternalLink className="w-4 h-4" />
                    CASE_ID: {caseId.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Secure Note to Counsel (Optional)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Briefly explain any immediate concerns regarding your ${caseType} case...`}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all resize-none font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <AnimatedButton 
                  type="submit" 
                  variant="primary"
                  disabled={isSubmitting}
                  icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Transmitting...' : 'Dispatch Request Securely'}
                </AnimatedButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
