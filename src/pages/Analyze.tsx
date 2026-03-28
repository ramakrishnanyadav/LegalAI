// src/pages/Analyze.tsx - Professional Case Analysis Page
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Scale, 
  AlertTriangle,
  Clock,
  Check,
  Download,
  Users,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { analyzeCase, AnalyzeCaseResponse } from '@/lib/api';
import { saveCaseRecord, FIRData, EvidenceChecklistData } from '@/lib/storage';
import { removeUndefined } from '@/lib/firestoreUtils';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedDropdown from '@/components/AnimatedDropdown';
import UrgencyIndicator from '@/components/UrgencyIndicator';

const caseTypes = [
  { value: 'criminal', label: 'Criminal Case' },
  { value: 'civil', label: 'Civil Case' },
  { value: 'family', label: 'Family Dispute' },
  { value: 'property', label: 'Property Matter' },
  { value: 'cyber', label: 'Cyber Crime' },
];

type AnalysisStage = 'input' | 'analyzing' | 'results' | 'fir' | 'complete';

const Analyze = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stage, setStage] = useState<AnalysisStage>('input');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [results, setResults] = useState<AnalyzeCaseResponse | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error('Please describe your situation');
      return;
    }
    if (!caseType) {
      toast.error('Please select a case type');
      return;
    }

    setStage('analyzing');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await analyzeCase({
        description,
        role: 'victim',
        caseType,
        urgency: isUrgent,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResults(response);

      // 🔍 DEBUG: Log what we got from API
      console.log('✅ Analysis Complete:', {
        hasActionPlan: !!response.actionPlan,
        hasDocuments: !!response.documents,
        responseKeys: Object.keys(response),
      });

      // Save to Firestore
      await saveCase(response);

      // ✅ Navigate to AnalyzeResults page with premium features
      setTimeout(() => {
        navigate('/analyze-results', {
          state: {
            results: response,
            caseType: caseType,
            isUrgent: isUrgent,
            description: description,
            caseId: currentCaseId,
          }
        });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Analysis failed. Please try again.');
      setStage('input');
    }
  };

  const saveCase = async (analysisResults: AnalyzeCaseResponse): Promise<string | null> => {
    if (!user) return null;

    try {
      const primarySection = analysisResults.sections.find(s => s.isPrimary);
      const relatedSections = analysisResults.sections.filter(s => !s.isPrimary);

      const firData: FIRData = {
        complainantName: '',
        complainantAddress: '',
        complainantPhone: '',
        complainantEmail: user.email || '',
        incidentDate: '',
        incidentTime: '',
        incidentPlace: '',
        accusedDetails: '',
        witnessDetails: '',
        description: description,
        primarySection: {
          code: primarySection?.code || 'N/A',
          name: primarySection?.name || 'Not determined',
        },
        relatedSections: relatedSections.map(s => ({
          code: s.code || 'N/A',
          name: s.name || 'N/A',
        })),
        generatedDate: new Date().toISOString(),
      };

      const evidenceChecklist: EvidenceChecklistData = {
        items: [],
        checkedItemIds: [],
        completionPercentage: 0,
        lastUpdated: new Date().toISOString(),
      };

      const normalizeConfidence = (conf: number) => {
        if (conf > 0 && conf <= 1) return Math.round(conf * 100);
        return Math.min(Math.max(Math.round(conf), 0), 100);
      };

      const cleanAnalysisResults = {
        ...analysisResults,
        sections: analysisResults.sections.map(section => ({
          code: section.code || 'N/A',
          name: section.name || 'N/A',
          description: section.description || '',
          confidence: normalizeConfidence(section.confidence || 0),
          isPrimary: section.isPrimary || false,
          reasoning: section.reasoning || '',
          matchedKeywords: section.matchedKeywords || [],
          punishment: section.punishment || '',
          bailable: section.bailable || false,
          cognizable: section.cognizable || false,
        })),
        severity: analysisResults.severity || 'Unknown',
        maxPunishment: analysisResults.maxPunishment || 'To be determined',
        punishmentNote: analysisResults.punishmentNote || '',
        bail: analysisResults.bail || 'To be determined',
        bailProbability: normalizeConfidence(analysisResults.bailProbability || 50),
        overallConfidence: normalizeConfidence(analysisResults.overallConfidence || 50),
        next_steps: analysisResults.next_steps || [],
        // 🆕 PREMIUM FEATURES - Store in Firebase
        actionPlan: analysisResults.actionPlan || null,
        documents: analysisResults.documents || null,
        // Store individual premium features for easy access
        victoryPrediction: analysisResults.actionPlan?.victoryPrediction || null,
        durationEstimate: analysisResults.actionPlan?.durationEstimate || null,
        detailedCosts: analysisResults.actionPlan?.detailedCosts || null,
      };

      const caseData = removeUndefined({
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'User',
        caseType: caseType,
        isUrgent: isUrgent,
        description: description,
        analysisResults: cleanAnalysisResults,
        firData: firData,
        evidenceFiles: [],
        evidenceChecklist: evidenceChecklist,
        status: 'draft' as const,
      });

      const caseId = await saveCaseRecord(caseData);
      if (caseId) {
        setCurrentCaseId(caseId);
        toast.success('Case saved successfully');
        return caseId;
      }
      return null;
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error('Failed to save case');
      return null;
    }
  };

  const normalizeConfidence = (conf: number) => {
    if (conf > 0 && conf <= 1) return Math.round(conf * 100);
    return Math.min(Math.max(Math.round(conf), 0), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary" />
            <span className="font-bold">Case Analysis</span>
          </div>
          <div className="w-32" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Bar */}
      {stage === 'analyzing' && (
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <div className="flex-1">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Stage 1: Input */}
          {stage === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="gradient-text">Analyze Your Case</span>
                </h1>
                <p className="text-muted-foreground">
                  Describe your situation and get AI-powered legal analysis
                </p>
              </div>

              {/* Premium Features Teaser - Show only for guests */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 glass rounded-2xl p-5 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      ✨
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                        Unlock Premium Features - 100% FREE
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Login to get Victory Predictions, Cost Analysis, Duration Estimates, Legal Documents & more!
                      </p>
                      <div className="flex gap-2">
                        <AnimatedButton
                          onClick={() => navigate('/login', { state: { returnTo: '/analyze' } })}
                          variant="primary"
                          size="sm"
                        >
                          Login
                        </AnimatedButton>
                        <AnimatedButton
                          onClick={() => navigate('/register', { state: { returnTo: '/analyze' } })}
                          variant="secondary"
                          size="sm"
                        >
                          Sign Up Free
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Premium Features Available - Show for logged-in users */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 glass rounded-2xl p-4 border border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-400">Premium Features Enabled</p>
                      <p className="text-xs text-muted-foreground">
                        You'll receive Victory Predictions, Cost Estimates, Legal Documents & more after analysis
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="glass rounded-2xl p-6 space-y-6">
                {/* Case Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Case Type *</label>
                  <AnimatedDropdown
                    options={caseTypes}
                    value={caseType}
                    onChange={setCaseType}
                    placeholder="Select case type"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium mb-2">Urgency</label>
                  <UrgencyIndicator isUrgent={isUrgent} onToggle={setIsUrgent} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe Your Situation *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide detailed information about what happened, including dates, locations, and people involved..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {description.length} characters
                  </p>
                </div>

                {/* Submit */}
                <AnimatedButton
                  onClick={handleAnalyze}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<ChevronRight className="w-5 h-5" />}
                >
                  Analyze Case
                </AnimatedButton>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Analyzing */}
          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="glass rounded-2xl p-12 text-center max-w-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                >
                  <Scale className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Analyzing Your Case</h2>
                <p className="text-muted-foreground mb-6">
                  AI is reviewing your situation and identifying applicable legal sections...
                </p>
                <div className="space-y-2 text-left">
                  {[
                    'Identifying legal sections',
                    'Analyzing severity',
                    'Calculating confidence',
                    'Generating recommendations',
                  ].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: progress > i * 25 ? 1 : 0.3, x: 0 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      {progress > i * 25 ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 3: Results */}
          {stage === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Analysis Complete</h1>
                <p className="text-muted-foreground">
                  Here's what we found about your case
                </p>
              </div>

              {/* Overall Confidence */}
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Confidence</p>
                <div className="text-5xl font-bold gradient-text mb-2">
                  {normalizeConfidence(results.overallConfidence)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on statutory match and case information
                </p>
              </div>

              {/* Primary Section */}
              {results.sections.filter(s => s.isPrimary).map((section) => (
                <div key={section.code} className="glass rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
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
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p className="font-semibold text-sm">{results.severity}</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <p className="text-xs text-muted-foreground mb-1">Punishment</p>
                  <p className="font-semibold text-sm">{results.maxPunishment}</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <Scale className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <p className="text-xs text-muted-foreground mb-1">Bail</p>
                  <p className="font-semibold text-sm">{results.bail}</p>
                </div>
              </div>

              {/* Related Sections */}
              {results.sections.filter(s => !s.isPrimary).length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Related Sections</h3>
                  <div className="space-y-3">
                    {results.sections.filter(s => !s.isPrimary).map((section) => (
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

              {/* Actions */}
              <div className="flex gap-4">
                <AnimatedButton
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  className="flex-1"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Dashboard
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => navigate(`/cases/${currentCaseId}`)}
                  variant="primary"
                  className="flex-1"
                  icon={<FileText className="w-4 h-4" />}
                >
                  View Full Case
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => navigate('/lawyers')}
                  variant="primary"
                  className="flex-1"
                  icon={<Users className="w-4 h-4" />}
                >
                  Find Lawyers
                </AnimatedButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Analyze;