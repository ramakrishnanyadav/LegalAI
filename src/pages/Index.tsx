// src/pages/Index.tsx - COMPLETE WORKING VERSION
import { Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import HeroSection from '@/components/HeroSection';
import ScrollReveal from '@/components/ScrollReveal';

// Lazy load heavy components
const ProceduralTimeline = lazy(() => import('@/components/ProceduralTimeline'));

// Import LawyerMarketplace directly (not lazy) so it shows immediately
import LawyerMarketplace from '@/components/LawyerMarketplace';

// Background gradient component
const BackgroundGradient = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
    <div 
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 100% 60% at 20% 30%, rgba(0, 217, 255, 0.04) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 80% 20%, rgba(123, 47, 247, 0.03) 0%, transparent 45%),
          radial-gradient(ellipse 60% 40% at 50% 90%, rgba(0, 217, 255, 0.02) 0%, transparent 40%)
        `,
      }}
    />
  </div>
);

// Simplified loading skeleton
const SectionSkeleton = () => (
  <div className="py-24 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-white/5 rounded w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { user, isLawyer } = useAuth();
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Background Effects */}
      <BackgroundGradient />
      
      {/* Scroll Progress */}
      <ScrollProgress />
      
      {/* Navigation */}
      <header role="banner">
        <Navbar />
      </header>
      
      {/* Main Content */}
      <main id="main-content" role="main" className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Timeline Section */}
        <section id="timeline" aria-label="Legal timeline">
          <ScrollReveal type="slide">
            <Suspense fallback={<SectionSkeleton />}>
              <ProceduralTimeline />
            </Suspense>
          </ScrollReveal>
        </section>
        
        {/* Lawyer Marketplace Section - NOT LAZY LOADED */}
        <section id="lawyers" aria-label="Lawyer marketplace">
          <ScrollReveal type="scale">
            <LawyerMarketplace />
          </ScrollReveal>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;