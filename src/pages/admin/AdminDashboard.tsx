// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Scale,
  LogOut,
  UserPlus,
  Eye,
  Settings,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return 'Unknown Date';
  if (typeof dateVal === 'string') return new Date(dateVal).toLocaleDateString();
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
  if (dateVal instanceof Date) return dateVal.toLocaleDateString();
  return 'Unknown Date';
};

const AdminDashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLawyers: 0,
    activeLawyers: 0,
    totalConsultations: 0,
    pendingConsultations: 0,
    totalCases: 0,
    totalUsers: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);

    const unsubLawyers = onSnapshot(collection(db, 'lawyers'), (snap) => {
      const activeLawyers = snap.docs.filter(doc => doc.data().active).length;
      setStats(prev => ({ ...prev, totalLawyers: snap.size, activeLawyers }));
    }, (err) => console.error(err));

    const unsubConsultations = onSnapshot(collection(db, 'consultationRequests'), (snap) => {
      const pendingConsultations = snap.docs.filter(doc => doc.data().status === 'pending').length;
      setStats(prev => ({ ...prev, totalConsultations: snap.size, pendingConsultations }));
    }, (err) => console.error(err));

    const recentQuery = query(collection(db, 'consultationRequests'), orderBy('createdAt', 'desc'), limit(5));
    const unsubRecent = onSnapshot(recentQuery, (snap) => {
      setRecentConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const unsubCases = onSnapshot(collection(db, 'cases'), (snap) => {
      setStats(prev => ({ ...prev, totalCases: snap.size }));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => {
      unsubLawyers();
      unsubConsultations();
      unsubRecent();
      unsubCases();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const statCards = [
    {
      title: 'Total Lawyers',
      value: stats.totalLawyers,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      link: '/admin/lawyers'
    },
    {
      title: 'Active Lawyers',
      value: stats.activeLawyers,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      link: '/admin/lawyers'
    },
    {
      title: 'Consultations',
      value: stats.totalConsultations,
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      link: '/admin/consultations'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingConsultations,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      link: '/admin/consultations'
    },
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: FileText,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      link: '/admin/cases'
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    }
  ];

  const quickActions = [
    {
      title: 'Add Lawyer',
      icon: UserPlus,
      color: 'from-blue-500/20 to-cyan-500/20',
      link: '/admin/lawyers/new'
    },
    {
      title: 'View Lawyers',
      icon: Users,
      color: 'from-green-500/20 to-emerald-500/20',
      link: '/admin/lawyers'
    },
    {
      title: 'Consultations',
      icon: MessageSquare,
      color: 'from-purple-500/20 to-pink-500/20',
      link: '/admin/consultations'
    },
    {
      title: 'All Cases',
      icon: Eye,
      color: 'from-orange-500/20 to-red-500/20',
      link: '/admin/cases'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">LegalAI Admin</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/admin" className="text-foreground font-medium">
                Dashboard
              </Link>
              <Link to="/admin/lawyers" className="text-muted-foreground hover:text-foreground transition-colors">
                Lawyers
              </Link>
              <Link to="/admin/consultations" className="text-muted-foreground hover:text-foreground transition-colors">
                Consultations
              </Link>
              <Link to="/admin/cases" className="text-muted-foreground hover:text-foreground transition-colors">
                Cases
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Admin: {user?.email?.split('@')[0]}
              </span>
              <motion.button
                onClick={handleSignOut}
                className="p-2 rounded-xl glass hover:bg-white/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage lawyers, consultations, and platform data</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={stat.link || '#'}>
                <div className="glass rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} to={action.link}>
                <motion.div
                  className={`glass rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all group`}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold">{action.title}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Consultations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Consultation Requests</h2>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {recentConsultations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No consultation requests yet
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{consultation.userName}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            consultation.status === 'pending' 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : consultation.status === 'accepted'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {consultation.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lawyer: {consultation.lawyerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Case: {consultation.caseType}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{safeFormatDate(consultation.createdAt)}</p>
                        <p>{consultation.preferredDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;