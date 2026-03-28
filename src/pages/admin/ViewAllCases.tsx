// src/pages/admin/ViewAllCases.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Scale,
  Search,
  FileText,
  User,
  Calendar,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface CaseData {
  id: string;
  userId: string;
  userName: string;
  caseType: string;
  status: string;
  description: string;
  isUrgent: boolean;
  createdAt: any;
  analysisResults?: {
    overallConfidence: number;
    severity: string;
    sections: Array<{
      code: string;
      name: string;
      isPrimary: boolean;
    }>;
  };
}

const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return 'Unknown Date';
  if (typeof dateVal === 'string') return new Date(dateVal).toLocaleDateString();
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
  if (dateVal instanceof Date) return dateVal.toLocaleDateString();
  return 'Unknown Date';
};

const ViewAllCases = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'closed'>('all');

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    let filtered = [...cases];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    setFilteredCases(filtered);
  }, [searchQuery, filterStatus, cases]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'cases'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const casesData: CaseData[] = [];
      querySnapshot.forEach((doc) => {
        casesData.push({ id: doc.id, ...doc.data() } as CaseData);
      });
      setCases(casesData);
      setFilteredCases(casesData);
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'submitted':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'closed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <AlertCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const normalizeConfidence = (conf: number) => {
    if (conf > 0 && conf <= 1) return Math.round(conf * 100);
    return Math.min(Math.max(Math.round(conf), 0), 100);
  };

  const stats = [
    {
      label: 'Total Cases',
      value: cases.length,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Draft',
      value: cases.filter(c => c.status === 'draft').length,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    {
      label: 'Submitted',
      value: cases.filter(c => c.status === 'submitted').length,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Closed',
      value: cases.filter(c => c.status === 'closed').length,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">Admin Panel</span>
            </Link>
            <h1 className="text-lg font-semibold">All Cases</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-4 border border-white/10"
            >
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, case type, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No cases found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'No cases submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(caseItem.status)}`}>
                        {getStatusIcon(caseItem.status)}
                        {caseItem.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {caseItem.caseType}
                      </span>
                      {caseItem.isUrgent && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {caseItem.userName}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="flex items-center gap-1 justify-end">
                      <Calendar className="w-4 h-4" />
                      {safeFormatDate(caseItem.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.description}</p>
                </div>

                {caseItem.analysisResults && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-sm font-semibold text-primary">
                        {normalizeConfidence(caseItem.analysisResults.overallConfidence)}%
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground mb-1">Primary Section</p>
                      <p className="text-sm font-semibold">
                        {caseItem.analysisResults.sections.find(s => s.isPrimary)?.code || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground mb-1">Severity</p>
                      <p className="text-sm font-semibold text-yellow-400">
                        {caseItem.analysisResults.severity}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground mb-1">Sections</p>
                      <p className="text-sm font-semibold">
                        {caseItem.analysisResults.sections.length}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewAllCases;