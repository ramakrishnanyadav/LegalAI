// src/pages/Lawyers.tsx - UPDATED to load from Firestore
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  MessageSquare,
  BadgeCheck,
  Globe,
  Building2,
  Clock,
  User,
  X,
  Send,
  Scale,
  LogOut,
  Menu as MenuIcon,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '@/components/AnimatedButton';
import TiltCard from '@/components/TiltCard';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { getUserCases, CaseRecord } from '@/lib/storage';

interface Lawyer {
  id?: string;
  name: string;
  barNumber: string;
  yearsOfPractice: number;
  location: string;
  city: string;
  state: string;
  practiceAreas: string[];
  courts: string[];
  languages: string[];
  consultationFee: string;
  feeMin: number;
  feeMax: number;
  availability: string;
  image: string;
  verified: boolean;
  active: boolean;
  email: string;
  phone: string;
  rating?: number;
  totalCases?: number;
  successRate?: number;
  bio?: string;
  education?: string;
  barCouncil?: string;
}

interface ConsultationRequest {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  lawyerName: string;
  lawyerBarNumber: string;
  caseId?: string;
  caseType?: string;
  preferredDate: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

const Lawyers = () => {
  const { user, signOut, isLawyer } = useAuth();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userCases, setUserCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState<'experience' | 'rating' | 'fee'>('experience');

  // Form state
  const [selectedCase, setSelectedCase] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'video' | 'phone'>('video');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [caseSubject, setCaseSubject] = useState('');
  const [message, setMessage] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  useEffect(() => {
    loadLawyers();
    if (user) {
      loadUserCases();
    }
  }, [user]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // ✅ LOAD LAWYERS FROM FIRESTORE
  const loadLawyers = async () => {
    setLoading(true);
    try {
      // Query only active lawyers
      const q = query(
        collection(db, 'lawyers'),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const lawyersData: Lawyer[] = [];
      querySnapshot.forEach((doc) => {
        lawyersData.push({ id: doc.id, ...doc.data() } as Lawyer);
      });
      setLawyers(lawyersData);
    } catch (error) {
      console.error('Error loading lawyers:', error);
      toast.error('Failed to load lawyers');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCases = async () => {
    if (!user) return;
    try {
      const cases = await getUserCases(user.uid);
      setUserCases(cases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleRequestConsultation = (lawyer: Lawyer) => {
    if (!user) {
      toast.error('Please sign in to request consultation');
      navigate('/login');
      return;
    }
    setSelectedLawyer(lawyer);
    setShowModal(true);
    setRequestSent(false);
    setModalStep(1);
  };

  // Filter and sort lawyers safely
  const filteredLawyers = lawyers
    .filter((lawyer) => {
      // Safe fallback for potentially undefined fields from Firestore
      const safeName = lawyer.name || '';
      const safePracticeAreas = lawyer.practiceAreas || [];
      const safeCity = lawyer.city || '';

      const nameMatch = safeName.toLowerCase().includes(searchQuery.toLowerCase());
      const areaMatch = safePracticeAreas.some(area => 
        (area || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesSearch = nameMatch || areaMatch;
      const matchesPracticeArea = selectedPracticeArea === 'all' || 
        safePracticeAreas.includes(selectedPracticeArea);
      const matchesCity = selectedCity === 'all' || safeCity === selectedCity;
      
      return matchesSearch && matchesPracticeArea && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return (b.yearsOfPractice || 0) - (a.yearsOfPractice || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'fee') return (a.feeMin || 0) - (b.feeMin || 0);
      return 0;
    });

  // Get unique practice areas and cities for filters securely
  const practiceAreas = Array.from(new Set(lawyers.flatMap(l => l.practiceAreas || []))).filter(Boolean);
  const cities = Array.from(new Set(lawyers.map(l => l.city).filter(Boolean)));

  const handleSubmitRequest = async () => {
    if (!selectedLawyer || !user) return;

    if (!preferredDate || !preferredTime || !caseSubject.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const selectedCaseData = userCases.find(c => c.id === selectedCase);

      const consultationRequest: any = {
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        lawyerId: selectedLawyer.id || selectedLawyer.barNumber,
        lawyerName: selectedLawyer.name,
        lawyerBarNumber: selectedLawyer.barNumber,
        
        // Case Information
        caseType: selectedCaseData?.caseType || 'General Consultation',
        caseSubject,
        message,
        specificQuestions: specificQuestions || null,
        
        // Consultation Details
        preferredDate,
        preferredTime,
        consultationType,
        urgencyLevel,
        
        // Metadata
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      if (selectedCase) {
        consultationRequest.caseId = selectedCase;
      }

      await addDoc(collection(db, 'consultationRequests'), consultationRequest);

      setRequestSent(true);
      toast.success('Consultation request sent successfully!', {
        description: 'Check your dashboard for case updates and premium insights',
        duration: 4000,
      });

      setTimeout(() => {
        setShowModal(false);
        setSelectedCase('');
        setPreferredDate('');
        setPreferredTime('');
        setMessage('');
        setCaseSubject('');
        setSpecificQuestions('');
        // Navigate to dashboard to see consultation
        navigate('/dashboard');
      }, 2500);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to send request. Please try again.');
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl flex-shrink-0">
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
              <Link to="/lawyers" className="text-foreground font-medium">
                Lawyers
              </Link>
              {isLawyer && (
                <Link to="/lawyer/dashboard" className="ml-4 px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-medium flex items-center gap-2 hover:bg-primary/30 transition-colors">
                  <Briefcase className="w-4 h-4" />
                  Advocate Portal
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/profile">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/5"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{user.email?.split('@')[0]}</span>
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
                </>
              ) : (
                <>
                  <Link to="/login">
                    <AnimatedButton variant="ghost" size="sm">Sign In</AnimatedButton>
                  </Link>
                  <Link to="/register">
                    <AnimatedButton variant="primary" size="sm">Get Started</AnimatedButton>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                <nav className="flex flex-col gap-2">
                  <Link to="/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/5">
                    Dashboard
                  </Link>
                  <Link to="/analyze" className="px-4 py-2 rounded-lg hover:bg-white/5">
                    Analyze
                  </Link>
                  {user && (
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 rounded-lg hover:bg-white/5 text-left text-red-400"
                    >
                      Sign Out
                    </button>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full overflow-y-auto">
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple/20 border border-primary/30 mb-4">
            <BadgeCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">All Lawyers Verified by Bar Council</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Find Your Perfect Legal Expert</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Connect with top-rated advocates. Book consultations instantly. Get expert legal guidance.
          </p>
          
          {/* Trust Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{lawyers.length}+</div>
              <div className="text-xs text-muted-foreground">Verified Lawyers</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">98%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-xs text-muted-foreground">Support</div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 glass rounded-2xl p-6 border border-white/10"
        >
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, practice area, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-base"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Practice Area
              </label>
              <select
                value={selectedPracticeArea}
                onChange={(e) => setSelectedPracticeArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none [&>option]:bg-gray-900"
              >
                <option value="all">All Areas</option>
                {practiceAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none [&>option]:bg-gray-900"
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none [&>option]:bg-gray-900"
              >
                <option value="experience">Most Experienced</option>
                <option value="rating">Highest Rated</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredLawyers.length}</span> of <span className="font-semibold text-foreground">{lawyers.length}</span> lawyers
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading lawyers...</p>
            </div>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No lawyers available</h3>
            <p className="text-muted-foreground">Please check back later</p>
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No lawyers found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <AnimatedButton
              onClick={() => {
                setSearchQuery('');
                setSelectedPracticeArea('all');
                setSelectedCity('all');
              }}
              variant="secondary"
            >
              Clear Filters
            </AnimatedButton>
          </div>
        ) : (
          /* Lawyer Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLawyers.map((lawyer, index) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TiltCard>
                  <div className="glass rounded-2xl p-6 h-full border border-white/10 hover:border-primary/30 transition-all group">
                    {/* Top Badge */}
                    {lawyer.rating && lawyer.rating >= 4.5 && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
                        ⭐ Top Rated
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={lawyer.image}
                          alt={lawyer.name}
                          className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all"
                        />
                        {lawyer.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-background">
                            <BadgeCheck className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                          {lawyer.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono mb-2">
                          Bar No: {lawyer.barNumber}
                        </p>
                        
                        {/* Rating & Stats */}
                        <div className="flex items-center gap-3 mb-2">
                          {lawyer.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400 font-bold">{lawyer.rating}</span>
                              <span className="text-yellow-400">★</span>
                            </div>
                          )}
                          {lawyer.totalCases && (
                            <span className="text-xs text-muted-foreground">
                              {lawyer.totalCases}+ cases
                            </span>
                          )}
                          {lawyer.successRate && (
                            <span className="text-xs text-green-400 font-semibold">
                              {lawyer.successRate}% success
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {lawyer.yearsOfPractice}+ years
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {lawyer.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Practice Areas */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Practice Areas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {lawyer.practiceAreas.map((area) => (
                          <span
                            key={area}
                            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Courts */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Courts
                      </p>
                      <div className="space-y-1">
                        {lawyer.courts.map((court) => (
                          <div key={court} className="flex items-center gap-2 text-sm">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-foreground/80">{court}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{lawyer.languages.join(', ')}</span>
                      </div>
                    </div>

                    {/* Fee & Availability */}
                    <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-xs text-muted-foreground">Consultation Fee</p>
                        <p className="text-sm font-medium">{lawyer.consultationFee}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Clock className="w-3 h-3" />
                          <span>{lawyer.availability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <AnimatedButton
                      onClick={() => handleRequestConsultation(lawyer)}
                      variant="primary"
                      className="w-full"
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      Request Consultation
                    </AnimatedButton>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Consultation Request Modal */}
      <AnimatePresence>
        {showModal && selectedLawyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !requestSent && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 border border-white/10"
            >
              {requestSent ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border-2 border-green-500/50"
                  >
                    <Check className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 gradient-text">Request Sent!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your consultation request has been sent to <span className="font-semibold text-foreground">{selectedLawyer.name}</span>.
                  </p>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4">
                    <p className="text-sm text-foreground/90">
                      ✨ <strong>Premium Tip:</strong> Check your dashboard for AI-powered case insights, victory predictions, and cost estimates!
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to dashboard...
                  </p>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">Book Consultation</h3>
                      <p className="text-sm text-muted-foreground">Step {modalStep} of 3</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-lg hover:bg-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${modalStep >= 1 ? 'bg-primary' : 'bg-white/10'}`}></div>
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${modalStep >= 2 ? 'bg-primary' : 'bg-white/10'}`}></div>
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${modalStep >= 3 ? 'bg-primary' : 'bg-white/10'}`}></div>
                  </div>

                  {/* Lawyer Info Card */}
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple/10 border border-primary/30">
                    <img
                      src={selectedLawyer.image}
                      alt={selectedLawyer.name}
                      className="w-14 h-14 rounded-full ring-2 ring-primary/50"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-base">{selectedLawyer.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{selectedLawyer.consultationFee}</span>
                        {selectedLawyer.rating && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-yellow-400">★ {selectedLawyer.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={modalStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* STEP 1: Case & Urgency */}
                      {modalStep === 1 && (
                        <>
                          <h4 className="font-bold text-lg mb-4">📋 Tell us about your case</h4>
                          
                          {userCases.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Link to Existing Case (Optional)
                              </label>
                              <select
                                value={selectedCase}
                                onChange={(e) => setSelectedCase(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-white"
                              >
                                <option value="" className="bg-gray-900 text-white">New consultation</option>
                                {userCases.map((c) => {
                                  let dateStr = 'Unknown Date';
                                  if (c.createdAt) {
                                    if (typeof c.createdAt.toDate === 'function') {
                                      dateStr = c.createdAt.toDate().toLocaleDateString();
                                    } else if ((c.createdAt as any).seconds) {
                                      dateStr = new Date((c.createdAt as any).seconds * 1000).toLocaleDateString();
                                    } else {
                                      dateStr = new Date(c.createdAt as any).toLocaleDateString();
                                    }
                                  }
                                  return (
                                    <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                                      {c.caseType} - {dateStr}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Case Subject / Topic *
                            </label>
                            <input
                              type="text"
                              value={caseSubject}
                              onChange={(e) => setCaseSubject(e.target.value)}
                              placeholder="e.g., Property Dispute, Cybercrime Complaint, Contract Review"
                              className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              How urgent is this matter? *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { value: 'low', label: 'Low Priority', desc: '1-2 weeks', color: 'blue' },
                                { value: 'medium', label: 'Medium', desc: 'This week', color: 'yellow' },
                                { value: 'high', label: 'High Priority', desc: '2-3 days', color: 'orange' },
                                { value: 'urgent', label: 'Urgent', desc: '24 hours', color: 'red' },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => setUrgencyLevel(option.value as any)}
                                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    urgencyLevel === option.value
                                      ? `border-${option.color}-500 bg-${option.color}-500/10`
                                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  <div className="font-semibold mb-1">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <AnimatedButton
                              onClick={() => setModalStep(2)}
                              variant="primary"
                              className="flex-1"
                              disabled={!caseSubject.trim()}
                            >
                              Next: Scheduling →
                            </AnimatedButton>
                          </div>
                        </>
                      )}

                      {/* STEP 2: Schedule & Mode */}
                      {modalStep === 2 && (
                        <>
                          <h4 className="font-bold text-lg mb-4">📅 Schedule your consultation</h4>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Consultation Mode *
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setConsultationType('video')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  consultationType === 'video'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                <div className="text-2xl mb-1">📹</div>
                                <div className="text-xs font-medium">Video Call</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConsultationType('phone')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  consultationType === 'phone'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                <div className="text-2xl mb-1">📞</div>
                                <div className="text-xs font-medium">Phone</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConsultationType('in-person')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  consultationType === 'in-person'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                <div className="text-2xl mb-1">🏢</div>
                                <div className="text-xs font-medium">In-Person</div>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Preferred Date *
                              </label>
                              <input
                                type="date"
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Preferred Time *
                              </label>
                              <select
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-white"
                                required
                              >
                                <option value="" className="bg-gray-900 text-white">Select time</option>
                                <option value="09:00-10:00" className="bg-gray-900 text-white">09:00 - 10:00 AM</option>
                                <option value="10:00-11:00" className="bg-gray-900 text-white">10:00 - 11:00 AM</option>
                                <option value="11:00-12:00" className="bg-gray-900 text-white">11:00 - 12:00 PM</option>
                                <option value="12:00-13:00" className="bg-gray-900 text-white">12:00 - 01:00 PM</option>
                                <option value="14:00-15:00" className="bg-gray-900 text-white">02:00 - 03:00 PM</option>
                                <option value="15:00-16:00" className="bg-gray-900 text-white">03:00 - 04:00 PM</option>
                                <option value="16:00-17:00" className="bg-gray-900 text-white">04:00 - 05:00 PM</option>
                                <option value="17:00-18:00" className="bg-gray-900 text-white">05:00 - 06:00 PM</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <AnimatedButton
                              onClick={() => setModalStep(1)}
                              variant="secondary"
                              className="flex-1"
                            >
                              ← Back
                            </AnimatedButton>
                            <AnimatedButton
                              onClick={() => setModalStep(3)}
                              variant="primary"
                              className="flex-1"
                              disabled={!preferredDate || !preferredTime}
                            >
                              Next: Details →
                            </AnimatedButton>
                          </div>
                        </>
                      )}

                      {/* STEP 3: Details & Submit */}
                      {modalStep === 3 && (
                        <>
                          <h4 className="font-bold text-lg mb-4">✍️ Provide case details</h4>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Case Description *
                            </label>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Describe your legal matter in detail. Include key facts, dates, parties involved, and any relevant background information..."
                              rows={5}
                              className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none resize-none"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              💡 Be specific - this helps the lawyer prepare for your consultation
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Specific Questions (Optional)
                            </label>
                            <textarea
                              value={specificQuestions}
                              onChange={(e) => setSpecificQuestions(e.target.value)}
                              placeholder="Any specific legal questions you want answered?&#10;e.g.,&#10;- What are my legal options?&#10;- How long will this process take?&#10;- What documents do I need?"
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none resize-none"
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <AnimatedButton
                              onClick={() => setModalStep(2)}
                              variant="secondary"
                              className="flex-1"
                            >
                              ← Back
                            </AnimatedButton>
                            <AnimatedButton
                              onClick={handleSubmitRequest}
                              loading={loading}
                              variant="primary"
                              className="flex-1"
                              icon={<Send className="w-4 h-4" />}
                              disabled={!message.trim()}
                            >
                              Send Request
                            </AnimatedButton>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lawyers;