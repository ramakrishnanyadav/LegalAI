// src/pages/CaseDetail.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Scale,
  FileText,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Shield,
  Calendar,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Loader2,
  Edit3,
  Sparkles,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCaseById, CaseRecord, FIRData } from '@/lib/storage';
import { toast } from 'sonner';
import AnimatedButton from '@/components/AnimatedButton';
import EvidenceManager from '@/components/EvidenceManager';
import { PremiumFeatureCards } from '@/components/PremiumFeatureCards';
import ActionPlanCard from '@/components/ActionPlanCard';

// ✅ Moved OUTSIDE CaseDetail — stable reference, no remount on every keystroke
const EditableField = ({
  label,
  value,
  field,
  multiline = false,
  editMode,
  onFieldChange,
}: {
  label: string;
  value: string;
  field: keyof FIRData;
  multiline?: boolean;
  editMode: boolean;
  onFieldChange: (field: keyof FIRData, value: any) => void;
}) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    {editMode ? (
      multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onFieldChange(field, e.target.value)}
          className="w-full px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary/50 focus:outline-none text-sm resize-none"
          rows={3}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onFieldChange(field, e.target.value)}
          className="w-full px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary/50 focus:outline-none text-sm"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )
    ) : (
      <p className={value ? '' : 'italic text-muted-foreground'}>
        {value || '[Not filled]'}
      </p>
    )}
  </div>
);

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [firFormData, setFirFormData] = useState<FIRData | null>(null);

  useEffect(() => {
    loadCase();
  }, [id]);

  useEffect(() => {
    if (caseData?.firData) {
      setFirFormData(caseData.firData);
    }
  }, [caseData]);

  const loadCase = async () => {
    if (!id) {
      toast.error('Invalid case ID');
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const data = await getCaseById(id);
      if (data) {
        if (data.userId !== user?.uid) {
          toast.error('Access denied');
          navigate('/dashboard');
          return;
        }
        setCaseData(data);
      } else {
        toast.error('Case not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading case:', error);
      toast.error('Failed to load case');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const normalizeConfidence = (conf: number) => {
    if (conf > 0 && conf <= 1) return Math.round(conf * 100);
    return Math.min(Math.max(Math.round(conf), 0), 100);
  };

  // ✅ Wrapped in useCallback so the reference stays stable across renders
  const handleFirFieldChange = (field: keyof FIRData, value: any) => {
    setFirFormData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSaveFir = async () => {
    if (!id || !firFormData) return;
    
    try {
      const { updateFIRData } = await import('@/lib/storage');
      await updateFIRData(id, firFormData);
      toast.success('FIR template updated successfully!');
      setEditMode(false);
      await loadCase();
    } catch (error) {
      console.error('Error saving FIR:', error);
      toast.error('Failed to save FIR changes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'submitted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'closed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading case details...</p>
        </motion.div>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">LegalAI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/analyze" className="text-muted-foreground hover:text-foreground transition-colors">
                Analyze
              </Link>
              <Link to="/lawyers" className="text-muted-foreground hover:text-foreground transition-colors">
                Lawyers
              </Link>
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/profile">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.email?.split('@')[0]}</span>
                </motion.button>
              </Link>
              
              <motion.button
                onClick={handleSignOut}
                className="p-2 rounded-xl glass hover:bg-white/5 text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Case Details</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(caseData.status)}`}>
                  {caseData.status}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {caseData.caseType}
                </span>
                {caseData.isUrgent && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    Urgent
                  </span>
                )}
              </div>
            </div>
            <AnimatedButton variant="secondary" icon={<Download className="w-4 h-4" />}>
              Download FIR
            </AnimatedButton>
          </div>

          {/* Description */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Case Description
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{caseData.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {new Date(caseData.createdAt.toDate()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* AI Analysis */}
          {caseData.analysisResults && (
            <>
              {/* Confidence Score */}
              <div className="glass rounded-2xl p-6 text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Analysis Confidence</p>
                <div className="text-5xl font-bold gradient-text mb-2">
                  {normalizeConfidence(caseData.analysisResults.overallConfidence)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on statutory match and case information
                </p>
              </div>

              {/* Primary Section */}
              {caseData.analysisResults.sections.filter(s => s.isPrimary).map((section) => (
                <div key={section.code} className="glass rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Primary Section</p>
                      <h3 className="text-xl font-bold mb-1">{section.code}</h3>
                      <p className="text-foreground">{section.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {normalizeConfidence(section.confidence)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground border-t border-white/10 pt-4">
                      {section.description}
                    </p>
                  )}
                </div>
              ))}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass rounded-xl p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p className="font-semibold text-sm">{caseData.analysisResults.severity}</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-xs text-muted-foreground mb-1">Punishment</p>
                  <p className="font-semibold text-sm">{caseData.analysisResults.maxPunishment}</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <p className="text-xs text-muted-foreground mb-1">Bail</p>
                  <p className="font-semibold text-sm">{caseData.analysisResults.bail}</p>
                </div>
              </div>

              {/* Related Sections */}
              {caseData.analysisResults.sections.filter(s => !s.isPrimary).length > 0 && (
                <div className="glass rounded-2xl p-6 mb-6">
                  <h3 className="font-bold mb-4">Related Sections</h3>
                  <div className="space-y-3">
                    {caseData.analysisResults.sections.filter(s => !s.isPrimary).map((section) => (
                      <div
                        key={section.code}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                      >
                        <div>
                          <p className="font-mono font-semibold">{section.code}</p>
                          <p className="text-sm text-muted-foreground">{section.name}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {normalizeConfidence(section.confidence)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FIR Template Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                FIR Draft Template
              </h2>
              <div className="flex items-center gap-2">
                <AnimatedButton
                  variant={editMode ? "primary" : "secondary"}
                  size="sm"
                  icon={editMode ? <CheckCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  onClick={editMode ? handleSaveFir : () => setEditMode(true)}
                >
                  {editMode ? 'Save Changes' : 'Edit Fields'}
                </AnimatedButton>
                
                {editMode && (
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditMode(false);
                      setFirFormData(caseData.firData);
                    }}
                  >
                    Cancel
                  </AnimatedButton>
                )}
                
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    import('@/lib/firPdfGenerator').then(({ generateFIRPDF }) => {
                      generateFIRPDF(firFormData || caseData.firData);
                      toast.success('FIR PDF downloaded successfully!');
                    });
                  }}
                >
                  Download PDF
                </AnimatedButton>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
              <p className="text-sm text-yellow-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>This is a reference template. Verify all details with police before submission.</span>
              </p>
            </div>

            {/* FIR Preview/Edit Form */}
            {firFormData && (
              <div className="space-y-4 text-sm">
                {/* Header */}
                <div className="text-center py-4 border-b border-white/10">
                  <h3 className="text-lg font-bold mb-1">FIRST INFORMATION REPORT</h3>
                  <p className="text-xs text-muted-foreground">(Under Section 154 Cr.P.C.)</p>
                  <p className="text-xs text-muted-foreground">Draft Date: {firFormData.generatedDate}</p>
                </div>

                {/* Complainant Details */}
                <div>
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    COMPLAINANT DETAILS
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <EditableField 
                      label="Full Name" 
                      value={firFormData.complainantName} 
                      field="complainantName"
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                    <EditableField 
                      label="Contact Number" 
                      value={firFormData.complainantPhone} 
                      field="complainantPhone"
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                    <div className="col-span-2">
                      <EditableField 
                        label="Email" 
                        value={firFormData.complainantEmail} 
                        field="complainantEmail"
                        editMode={editMode}
                        onFieldChange={handleFirFieldChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <EditableField 
                        label="Address" 
                        value={firFormData.complainantAddress} 
                        field="complainantAddress"
                        multiline
                        editMode={editMode}
                        onFieldChange={handleFirFieldChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Incident Details */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    INCIDENT DETAILS
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <EditableField 
                      label="Date" 
                      value={firFormData.incidentDate} 
                      field="incidentDate"
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                    <EditableField 
                      label="Time" 
                      value={firFormData.incidentTime} 
                      field="incidentTime"
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                    <EditableField 
                      label="Place" 
                      value={firFormData.incidentPlace} 
                      field="incidentPlace"
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    DESCRIPTION OF INCIDENT
                  </h4>
                  <EditableField 
                    label="Detailed Description" 
                    value={firFormData.description} 
                    field="description"
                    multiline
                    editMode={editMode}
                    onFieldChange={handleFirFieldChange}
                  />
                </div>

                {/* Legal Sections */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    APPLICABLE LEGAL SECTIONS
                  </h4>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="font-semibold">{firFormData.primarySection.code}</p>
                    <p className="text-sm text-muted-foreground">{firFormData.primarySection.name}</p>
                  </div>
                  {firFormData.relatedSections.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {firFormData.relatedSections.map((section) => (
                        <div key={section.code} className="p-2 rounded-lg bg-white/5 text-sm">
                          <span className="font-semibold">{section.code}</span> - {section.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accused & Witness */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-primary mb-3">ACCUSED DETAILS</h4>
                    <EditableField 
                      label="Accused Information" 
                      value={firFormData.accusedDetails} 
                      field="accusedDetails"
                      multiline
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary mb-3">WITNESS DETAILS</h4>
                    <EditableField 
                      label="Witness Information" 
                      value={firFormData.witnessDetails} 
                      field="witnessDetails"
                      multiline
                      editMode={editMode}
                      onFieldChange={handleFirFieldChange}
                    />
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-sm font-semibold mb-8">SIGNATURE OF COMPLAINANT</p>
                  <div className="w-64 mx-auto border-b-2 border-white/20 mb-2"></div>
                  <p className="text-xs text-muted-foreground italic">[To be signed at police station]</p>
                </div>
              </div>
            )}
          </div>

          {/* Premium Features Section */}
          {caseData.analysisResults?.actionPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Premium AI Analysis</h2>
                  <p className="text-sm text-muted-foreground">Personalized insights and predictions</p>
                </div>
              </div>
              
              {/* Premium Feature Cards */}
              <PremiumFeatureCards actionPlan={caseData.analysisResults.actionPlan} />
              
              {/* Full Action Plan */}
              <div className="glass rounded-2xl overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-primary/10 to-purple/10 p-4 border-b border-white/10">
                  <h3 className="font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Detailed Action Plan
                  </h3>
                </div>
                <div className="p-6">
                  <ActionPlanCard actionPlan={caseData.analysisResults.actionPlan} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Evidence Management Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <EvidenceManager
              caseId={id!}
              existingEvidence={caseData.evidenceFiles}
              onUpdate={(updatedEvidence) => {
                setCaseData({ ...caseData, evidenceFiles: updatedEvidence });
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link to="/lawyers" className="flex-1">
              <AnimatedButton variant="primary" className="w-full" icon={<Users className="w-4 h-4" />}>
                Find Lawyers
              </AnimatedButton>
            </Link>
            <AnimatedButton
              variant="secondary"
              className="flex-1"
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                import('@/lib/firPdfGenerator').then(({ generateFIRPDF }) => {
                  generateFIRPDF(firFormData || caseData.firData);
                  toast.success('FIR PDF downloaded!');
                });
              }}
            >
              Download FIR PDF
            </AnimatedButton>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CaseDetail;