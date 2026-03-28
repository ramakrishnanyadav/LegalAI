// src/pages/AnalyzeResults.tsx - Enhanced Results Page with Action Plan & Documents

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Users,
  Download,
  Share2,
  CheckCircle2,
  Target,
  BookOpen,
  Briefcase,
  MapPin,
  BadgeCheck,
  MessageSquare,
  Star
} from 'lucide-react';
import ActionPlanCard from '@/components/ActionPlanCard';
import DocumentViewer from '@/components/DocumentViewer';
import AnimatedButton from '@/components/AnimatedButton';
import { PremiumFeatureCards } from '@/components/PremiumFeatureCards';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { matchLawyers, getMatchPercentage, type Lawyer, type MatchedLawyer } from '@/lib/lawyerMatcher';
import { toast } from 'sonner';

interface Section {
  code: string;
  name: string;
  description: string;
  punishment: string;
  bailable: boolean;
  cognizable: boolean;
  confidence: number;
  isPrimary: boolean;
  reasoning: string;
  matchedKeywords: string[];
}

interface AnalysisResults {
  sections: Section[];
  severity: string;
  maxPunishment: string;
  punishmentNote: string;
  bail: string;
  bailProbability: number;
  overallConfidence: number;
  summary: string;
  nextSteps: string[];
  actionPlan?: any;
  documents?: any;
}

const AnalyzeResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results: AnalysisResults = location.state?.results;

  // 🔍 DEBUG: Log what we received on this page
  console.log('📄 AnalyzeResults Page Loaded:', {
    hasResults: !!results,
    hasActionPlan: !!results?.actionPlan,
    hasDocuments: !!results?.documents,
    resultsKeys: results ? Object.keys(results) : [],
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'action-plan' | 'documents'>('overview');
  const [recommendedLawyers, setRecommendedLawyers] = useState<MatchedLawyer[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [userLocation, setUserLocation] = useState<string>(''); // ✨ NEW: Location filter
  const [allLawyers, setAllLawyers] = useState<Lawyer[]>([]); // ✨ Store all lawyers

  // ✨ Load all lawyers once
  useEffect(() => {
    if (results?.sections) {
      loadAllLawyers();
    }
  }, [results]);

  const loadAllLawyers = async () => {
    try {
      setLoadingLawyers(true);
      
      // Fetch all active lawyers from Firestore
      const q = query(
        collection(db, 'lawyers'),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const lawyers: Lawyer[] = [];
      querySnapshot.forEach((doc) => {
        lawyers.push({ id: doc.id, ...doc.data() } as Lawyer);
      });

      setAllLawyers(lawyers);
    } catch (error) {
      console.error('Error loading lawyers:', error);
      toast.error('Failed to load lawyers');
    } finally {
      setLoadingLawyers(false);
    }
  };

  // ✨ Re-match lawyers when location changes
  useEffect(() => {
    if (allLawyers.length === 0 || !results?.sections) return;

    // Match lawyers based on case sections, type, and location
    const matched = matchLawyers(
      allLawyers,
      results.sections,
      location.state?.caseType,
      { 
        limit: 3, 
        minScore: 20,
        userLocation: userLocation || undefined // ✨ Pass user location for proximity bonus
      }
    );

    setRecommendedLawyers(matched);
  }, [allLawyers, results?.sections, location.state?.caseType, userLocation]);

  if (!results) {
    navigate('/analyze');
    return null;
  }

  const normalizeConfidence = (conf: number) => {
    if (conf < 1) return Math.round(conf * 100);
    return Math.min(Math.max(Math.round(conf), 0), 100);
  };

  const primarySection = results.sections.find(s => s.isPrimary) || results.sections[0];
  const relatedSections = results.sections.filter(s => !s.isPrimary);

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
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="font-bold">Analysis Complete</span>
          </div>
          <div className="w-32" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border-2 border-green-500/50">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-3"
          >
            <span className="gradient-text">Analysis Complete!</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            AI-powered legal analysis with {results.sections.length} applicable sections and personalized insights
          </motion.p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-2 mb-6 flex gap-2 border border-white/10"
        >
          <motion.button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/50'
                : 'hover:bg-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Legal Analysis</span>
              <span className="sm:hidden">Analysis</span>
            </div>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('action-plan')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all relative ${
              activeTab === 'action-plan'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/50'
                : 'hover:bg-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              <span className="hidden sm:inline">Action Plan</span>
              <span className="sm:hidden">Plan</span>
              {results.actionPlan && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
                />
              )}
            </div>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/50'
                : 'hover:bg-white/5'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Premium Features Banner - Show at top if available */}
        {results.actionPlan ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <PremiumFeatureCards actionPlan={results.actionPlan} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 glass rounded-2xl p-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  🔒 Premium Features Available
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                    FREE
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Login to unlock Victory Prediction, Duration Estimate, Cost Analysis, and more!
                </p>
                <div className="flex gap-3">
                  <AnimatedButton
                    onClick={() => navigate('/login', { state: { returnTo: location.pathname, results } })}
                    variant="primary"
                    size="sm"
                  >
                    Login Now
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => navigate('/register', { state: { returnTo: location.pathname, results } })}
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid - IPC Sections Highlighted */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 text-center border-2 border-primary/30"
              >
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Overall Confidence</p>
                <div className="text-5xl font-bold gradient-text mb-1">
                  {normalizeConfidence(results.overallConfidence)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Statutory Match
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 text-center border-2 border-blue-500/30"
              >
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">IPC Sections</p>
                <div className="text-5xl font-bold text-blue-400 mb-1">
                  {results.sections.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applicable Laws
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 text-center border-2 border-yellow-500/30"
              >
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Severity</p>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {results.severity}
                </div>
                <p className="text-xs text-muted-foreground">
                  Case Level
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 text-center border-2 border-green-500/30"
              >
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Bail Status</p>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {results.bail}
                </div>
                <p className="text-xs text-muted-foreground">
                  Eligibility
                </p>
              </motion.div>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Case Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed">{results.summary}</p>
            </motion.div>

            {/* Primary Section - Professional Card Layout */}
            {primarySection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl overflow-hidden border border-white/10"
              >
                {/* Header Section with Icon, Title and Confidence */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-primary/30 flex items-center justify-center flex-shrink-0 border border-primary/50">
                        <FileText className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2 text-left">
                          Primary Section
                        </p>
                        <h3 className="text-3xl font-bold mb-2 text-foreground text-left">
                          {primarySection.code}
                        </h3>
                        <p className="text-xl font-medium text-foreground/90 text-left">
                          {primarySection.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-4xl font-bold gradient-text mb-1">
                        {normalizeConfidence(primarySection.confidence)}%
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Confidence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Details Grid */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Description
                    </h4>
                    <p className="text-base leading-relaxed text-foreground/90">
                      {primarySection.description}
                    </p>
                  </div>

                  {/* Punishment and Bail Status - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Punishment
                      </h4>
                      <p className="text-base font-semibold text-foreground">
                        {primarySection.punishment}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Bail Status
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${primarySection.bailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <p className={`text-base font-semibold ${primarySection.bailable ? 'text-green-400' : 'text-red-400'}`}>
                          {primarySection.bailable ? 'Bailable' : 'Non-Bailable'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      AI Reasoning
                    </h4>
                    <p className="text-base leading-relaxed text-foreground/90 italic">
                      {primarySection.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Related Sections - Professional Layout */}
            {relatedSections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Related Sections
                </h3>
                <div className="space-y-4">
                  {relatedSections.map((section, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className="text-lg font-mono font-bold text-foreground mb-1">
                            {section.code}
                          </p>
                          <p className="text-base font-medium text-foreground/80">
                            {section.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-primary">
                            {normalizeConfidence(section.confidence)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Punishment</p>
                          <p className="text-sm font-medium">{section.punishment}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Bail Status</p>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${section.bailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <p className={`text-sm font-medium ${section.bailable ? 'text-green-400' : 'text-red-400'}`}>
                              {section.bailable ? 'Bailable' : 'Non-Bailable'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommended Lawyers */}
            {recommendedLawyers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Recommended Lawyers
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 text-left">
                      Based on your case analysis, these specialists can help
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* ✨ NEW: Location Filter */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <select
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="bg-transparent focus:outline-none text-sm cursor-pointer"
                      >
                        <option value="" className="bg-gray-900">All Locations</option>
                        <option value="Delhi" className="bg-gray-900">Delhi</option>
                        <option value="Mumbai" className="bg-gray-900">Mumbai</option>
                        <option value="Bangalore" className="bg-gray-900">Bangalore</option>
                        <option value="Chennai" className="bg-gray-900">Chennai</option>
                        <option value="Kolkata" className="bg-gray-900">Kolkata</option>
                        <option value="Hyderabad" className="bg-gray-900">Hyderabad</option>
                        <option value="Pune" className="bg-gray-900">Pune</option>
                        <option value="Ahmedabad" className="bg-gray-900">Ahmedabad</option>
                        <option value="Jaipur" className="bg-gray-900">Jaipur</option>
                        <option value="Chandigarh" className="bg-gray-900">Chandigarh</option>
                      </select>
                    </div>
                    
                    <AnimatedButton
                      onClick={() => navigate('/lawyers')}
                      variant="ghost"
                      size="sm"
                    >
                      View All
                    </AnimatedButton>
                  </div>
                </div>

                {/* ✨ Location filter active indicator */}
                {userLocation && (
                  <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Showing lawyers in <strong>{userLocation}</strong></span>
                    </div>
                    <button
                      onClick={() => setUserLocation('')}
                      className="text-xs text-primary hover:text-primary/80 underline"
                    >
                      Clear filter
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedLawyers.map((lawyer, index) => (
                    <motion.div
                      key={lawyer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-primary/30 cursor-pointer group"
                      onClick={() => navigate('/lawyers')}
                    >
                      {/* Match Score Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <img
                              src={lawyer.image}
                              alt={lawyer.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                            />
                            {lawyer.verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {getMatchPercentage(lawyer.matchScore)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>

                      {/* Lawyer Info */}
                      <h4 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
                        {lawyer.name}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        Bar: {lawyer.barNumber}
                      </p>

                      {/* Match Reason */}
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {lawyer.matchReason}
                      </p>

                      {/* Relevant Areas */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lawyer.relevantAreas.slice(0, 2).map((area) => (
                          <span
                            key={area}
                            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {area}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {lawyer.yearsOfPractice}+ yrs
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lawyer.city}
                        </span>
                        {lawyer.rating && (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {lawyer.rating}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <p className="text-sm text-foreground/80 mb-3">
                    Ready to consult with a specialist?
                  </p>
                  <AnimatedButton
                    onClick={() => navigate('/lawyers')}
                    variant="primary"
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Request Consultation
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <AnimatedButton
                onClick={() => setActiveTab('action-plan')}
                variant="primary"
                className="flex-1"
                icon={<Target className="w-5 h-5" />}
              >
                View Action Plan
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setActiveTab('documents')}
                variant="secondary"
                className="flex-1"
                icon={<Download className="w-5 h-5" />}
              >
                Download Documents
              </AnimatedButton>
              <AnimatedButton
                onClick={() => navigate('/lawyers')}
                variant="secondary"
                className="flex-1"
                icon={<Users className="w-5 h-5" />}
              >
                Find Lawyers
              </AnimatedButton>
            </motion.div>
          </div>
        )}

        {activeTab === 'action-plan' && results.actionPlan && (
          <ActionPlanCard actionPlan={results.actionPlan} />
        )}

        {activeTab === 'documents' && (
          <>
            {results.documents ? (
              <DocumentViewer documents={results.documents} />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-12 text-center border-2 border-primary/30 relative overflow-hidden"
              >
                {/* Premium Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold uppercase">
                  Premium Documents
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple/20 rounded-full blur-3xl opacity-50"></div>
                  <FileText className="w-20 h-20 mx-auto mb-6 text-primary relative" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 gradient-text">Unlock Legal Documents</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Get professionally drafted legal documents tailored to your case - ready to file.
                </p>
                
                {/* Document Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-2">FIR Draft</div>
                    <p className="text-sm text-muted-foreground">Ready-to-file police complaint</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30">
                    <div className="text-2xl font-bold text-indigo-400 mb-2">Written Complaint</div>
                    <p className="text-sm text-muted-foreground">Court-ready complaint format</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">Evidence Checklist</div>
                    <p className="text-sm text-muted-foreground">Complete documentation guide</p>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <AnimatedButton
                    onClick={() => navigate('/login', { state: { returnTo: '/analyze-results', results } })}
                    variant="primary"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Login to Download
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => navigate('/register', { state: { returnTo: '/analyze-results', results } })}
                    variant="secondary"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Create Account
                  </AnimatedButton>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  100% Free • Professional Templates • Instant Download
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* No Action Plan Message - Enhanced Premium Prompt */}
        {activeTab === 'action-plan' && !results.actionPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center border-2 border-primary/30 relative overflow-hidden"
          >
            {/* Premium Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold uppercase">
              Premium Feature
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple/20 rounded-full blur-3xl opacity-50"></div>
              <Target className="w-20 h-20 mx-auto mb-6 text-primary relative" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3 gradient-text">Unlock Premium Action Plan</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get personalized legal action plans with AI-powered insights, cost estimates, victory predictions, and case duration analysis.
            </p>
            
            {/* Premium Features List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30">
                <div className="text-3xl font-bold text-green-400 mb-2">Victory %</div>
                <p className="text-sm text-muted-foreground">AI-powered win probability analysis</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400 mb-2">Timeline</div>
                <p className="text-sm text-muted-foreground">Detailed case duration estimates</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30">
                <div className="text-3xl font-bold text-emerald-400 mb-2">Costs</div>
                <p className="text-sm text-muted-foreground">Comprehensive legal fee breakdown</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <AnimatedButton
                onClick={() => navigate('/login', { state: { returnTo: '/analyze-results', results } })}
                variant="primary"
                size="lg"
                className="min-w-[200px]"
              >
                Login to Unlock
              </AnimatedButton>
              <AnimatedButton
                onClick={() => navigate('/register', { state: { returnTo: '/analyze-results', results } })}
                variant="secondary"
                size="lg"
                className="min-w-[200px]"
              >
                Create Account
              </AnimatedButton>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              100% Free • No Credit Card Required • Instant Access
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AnalyzeResults;