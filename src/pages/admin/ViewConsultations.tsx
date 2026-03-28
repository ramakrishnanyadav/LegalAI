// src/pages/admin/ViewConsultations.tsx - WITH WORKING VIEW DETAILS MODAL
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Scale,
  Search,
  Calendar,
  User,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';
import { collection, query, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Consultation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lawyerName: string;
  lawyerBarNumber: string;
  caseId?: string;
  caseType: string;
  preferredDate: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return 'Unknown Date';
  if (typeof dateVal === 'string') return new Date(dateVal).toLocaleDateString();
  if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
  if (dateVal instanceof Date) return dateVal.toLocaleDateString();
  return 'Unknown Date';
};

const ViewConsultations = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false); // ✅ ADDED

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'consultationRequests'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const consultationsData: Consultation[] = [];
      snapshot.forEach((doc) => {
        consultationsData.push({ id: doc.id, ...doc.data() } as Consultation);
      });
      setConsultations(consultationsData);
      setFilteredConsultations(consultationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading consultations:', error);
      toast.error('Failed to sync consultations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...consultations];

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lawyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    setFilteredConsultations(filtered);
  }, [searchQuery, filterStatus, consultations]);

  const updateStatus = async (consultationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'consultationRequests', consultationId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Consultation ${newStatus}`);
      setShowModal(false); // ✅ Close modal after update
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // ✅ ADDED: Handle view details
  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === filteredConsultations.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(filteredConsultations.map(c => c.id)));
      setSelectAll(true);
    }
  };

  const bulkUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    if (selectedIds.size === 0) {
      toast.error('No consultations selected');
      return;
    }
    try {
      const updates = Array.from(selectedIds).map(id =>
        updateDoc(doc(db, 'consultationRequests', id), { status: newStatus })
      );
      await Promise.all(updates);
      toast.success(`${selectedIds.size} consultation(s) ${newStatus}`);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (error) {
      toast.error('Failed to update consultations');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const stats = [
    {
      label: 'Total',
      value: consultations.length,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Pending',
      value: consultations.filter(c => c.status === 'pending').length,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    {
      label: 'Accepted',
      value: consultations.filter(c => c.status === 'accepted').length,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Rejected',
      value: consultations.filter(c => c.status === 'rejected').length,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
    },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-white/10 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">Admin Panel</span>
            </Link>
            <h1 className="text-lg font-semibold">Consultation Requests</h1>
          </div>
        </div>
      </header>

      {/* Main - Scrollable Container */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 pb-20">
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

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 border border-primary/30 mb-6"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {selectedIds.size} consultation(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkUpdateStatus('accepted')}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Selected
                </button>
                <button
                  onClick={() => bulkUpdateStatus('rejected')}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Selected
                </button>
                <button
                  onClick={() => { setSelectedIds(new Set()); setSelectAll(false); }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {filteredConsultations.length > 0 && (
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl glass border border-white/10 cursor-pointer hover:border-primary/30 transition-colors">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded border-2 border-primary bg-transparent checked:bg-primary cursor-pointer"
              />
              <span className="text-sm font-medium">Select All ({filteredConsultations.length})</span>
            </label>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, lawyer, or case type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none bg-background text-foreground"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all" className="bg-background text-foreground">All Status</option>
            <option value="pending" className="bg-background text-foreground">Pending</option>
            <option value="accepted" className="bg-background text-foreground">Accepted</option>
            <option value="rejected" className="bg-background text-foreground">Rejected</option>
          </select>
        </div>

        {/* Consultations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No consultations found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'No consultation requests yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConsultations.map((consultation) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-xl p-4 lg:p-6 border transition-all ${
                  selectedIds.has(consultation.id) 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-white/10 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {/* Checkbox */}
                  <label className="flex items-center pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(consultation.id)}
                      onChange={() => toggleSelect(consultation.id)}
                      className="w-5 h-5 rounded border-2 border-primary bg-transparent checked:bg-primary cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>

                  <div className="flex-1 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{consultation.userName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(consultation.status)}`}>
                          {getStatusIcon(consultation.status)}
                          {consultation.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{consultation.userEmail}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="flex items-center gap-1 justify-end">
                        <Calendar className="w-4 h-4" />
                        {safeFormatDate(consultation.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-lg bg-white/5">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Lawyer
                    </p>
                    <p className="text-sm font-medium">{consultation.lawyerName}</p>
                    <p className="text-xs text-muted-foreground">{consultation.lawyerBarNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Case Type</p>
                    <p className="text-sm font-medium">{consultation.caseType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Preferred Date</p>
                    <p className="text-sm font-medium">{consultation.preferredDate}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Message</p>
                  <p className="text-sm bg-white/5 p-3 rounded-lg line-clamp-2">{consultation.message}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(consultation)}
                    className="px-4 py-2 rounded-lg glass hover:bg-white/5 text-sm flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {consultation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(consultation.id, 'accepted')}
                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(consultation.id, 'rejected')}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm flex items-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </main>

      {/* ✅ VIEW DETAILS MODAL */}
      <AnimatePresence>
        {showModal && selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass rounded-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Consultation Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(selectedConsultation.status)}`}>
                  {getStatusIcon(selectedConsultation.status)}
                  {selectedConsultation.status.toUpperCase()}
                </span>
              </div>

              {/* User Details */}
              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  User Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{selectedConsultation.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{selectedConsultation.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Lawyer Details */}
              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Lawyer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{selectedConsultation.lawyerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Bar Number:</span>
                    <span className="text-sm font-medium">{selectedConsultation.lawyerBarNumber}</span>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Consultation Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Case Type:</p>
                    <p className="text-sm font-medium">{selectedConsultation.caseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Preferred Date:
                    </p>
                    <p className="text-sm font-medium">{selectedConsultation.preferredDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Requested On:
                    </p>
                    <p className="text-sm font-medium">
                      {safeFormatDate(selectedConsultation.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Message:</p>
                    <p className="text-sm bg-white/5 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedConsultation.message}
                    </p>
                  </div>
                  {selectedConsultation.caseId && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Case ID:</p>
                      <p className="text-xs font-mono bg-white/5 px-2 py-1 rounded inline-block">
                        {selectedConsultation.caseId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedConsultation.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => updateStatus(selectedConsultation.id, 'accepted')}
                    className="flex-1 px-6 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept Consultation
                  </button>
                  <button
                    onClick={() => updateStatus(selectedConsultation.id, 'rejected')}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Consultation
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewConsultations;