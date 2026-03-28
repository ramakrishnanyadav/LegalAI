// src/pages/lawyer/LawyerDashboard.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  LogOut,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface Consultation {
  id: string;
  userName: string;
  userEmail: string;
  caseType: string;
  caseSubject: string;
  status: 'pending' | 'accepted' | 'rejected';
  preferredDate: string;
  preferredTime: string;
  message: string;
  createdAt: any;
}

const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return 'Unknown Date';
  if (typeof dateVal === 'string') return new Date(dateVal).toLocaleDateString();
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
  if (dateVal instanceof Date) return dateVal.toLocaleDateString();
  return 'Unknown Date';
};

const LawyerDashboard = () => {
  const { user, signOut } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lawyerData, setLawyerData] = useState<any>(null);

  useEffect(() => {
    if (!user?.email) return;

    const loadLawyerData = async () => {
      try {
        const q = query(collection(db, 'lawyers'), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const lData = snap.docs[0].data();
          setLawyerData(lData);
          
          // Setup real-time listener for this specific lawyer's consultations
          const consultationsQuery = query(
            collection(db, 'consultationRequests'),
            where('lawyerName', '==', lData.name)
          );
          
          const unsubscribe = onSnapshot(consultationsQuery, (snapshot) => {
            const data: Consultation[] = [];
            snapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() } as Consultation);
            });
            // Sort client-side since Firestore requires composite index for where + orderBy
            data.sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0;
              const bTime = b.createdAt?.seconds || 0;
              return bTime - aTime;
            });
            setConsultations(data);
            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load lawyer portal:', error);
        toast.error('Failed to load portal');
        setLoading(false);
      }
    };

    loadLawyerData();
  }, [user]);

  const updateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'consultationRequests', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Consultation ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const pendingCount = consultations.filter(c => c.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              Advocate Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, Advocate {lawyerData?.name}. You have {pendingCount} pending requests.
            </p>
          </div>
          
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <h3 className="text-2xl font-bold">{pendingCount}</h3>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted Consultations</p>
                <h3 className="text-2xl font-bold">{consultations.filter(c => c.status === 'accepted').length}</h3>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <h3 className="text-2xl font-bold">{consultations.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">Recent Consultation Requests</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            <AnimatePresence>
              {consultations.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No consultation requests found.
                </div>
              ) : (
                consultations.map((consultation, index) => (
                  <motion.div
                    key={consultation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      {/* Left: User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{consultation.userName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            consultation.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            consultation.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {consultation.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {consultation.userEmail}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-black/20">
                            <p className="text-xs text-muted-foreground mb-1">Subject</p>
                            <p className="text-sm font-medium">{consultation.caseSubject}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-black/20">
                            <p className="text-xs text-muted-foreground mb-1">Requested Timing</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-primary" />
                              {consultation.preferredDate} at {consultation.preferredTime}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/5">
                          <p className="text-xs text-muted-foreground mb-2">Client Message</p>
                          <p className="text-sm font-mono whitespace-pre-wrap">{consultation.message}</p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      {consultation.status === 'pending' && (
                        <div className="flex flex-row lg:flex-col gap-3 min-w-[140px]">
                          <button
                            onClick={() => updateStatus(consultation.id, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(consultation.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass border-red-500/30 hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LawyerDashboard;
