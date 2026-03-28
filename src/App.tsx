// src/App.tsx - UPDATED VERSION with Admin Login Route
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SectionSkeleton } from "@/components/PerformanceWrapper";
import { queryCacheConfig } from "@/lib/performance";
import Resources from '@/pages/Resources';
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/hooks/useI18n";
import { analytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import LawyerRoute from "@/components/LawyerRoute";

// Lazy load public pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Lazy load user pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analyze = lazy(() => import("./pages/Analyze"));
const AnalyzeResults = lazy(() => import("./pages/AnalyzeResults")); // ✅ ADDED for premium features
const Lawyers = lazy(() => import("./pages/Lawyers"));
const Profile = lazy(() => import("./pages/Profile"));
const CaseDetail = lazy(() => import("./pages/CaseDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BNSAnalyze = lazy(() => import("./pages/BNSAnalyze")); // ✅ BNS AI Streaming Analysis
const CaseResult = lazy(() => import("./pages/CaseResult")); // ✅ Case result hub

// ✅ Lazy load admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin")); // ✅ ADDED
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageLawyers = lazy(() => import("./pages/admin/ManageLawyers"));
const ViewConsultations = lazy(() => import("./pages/admin/ViewConsultations"));
const ViewAllCases = lazy(() => import("./pages/admin/ViewAllCases"));

// ✅ Lazy load lawyer pages
const LawyerDashboard = lazy(() => import("./pages/lawyer/LawyerDashboard"));

// Optimized query client with SWR-like caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...queryCacheConfig,
    },
  },
});

// Page loading skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <SectionSkeleton className="pt-20" rows={5} />
  </div>
);

// Route preloader hook
const useRoutePreload = () => {
  useEffect(() => {
    // Preload pages on idle
    const preloadPages = () => {
      import("./pages/Index");
      import("./pages/Dashboard");
      import("./pages/NotFound");
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadPages);
    } else {
      setTimeout(preloadPages, 200);
    }
  }, []);
};

// Global error handler
const handleGlobalError = (error: Error) => {
  analytics.trackError(error, { location: 'global' });
};

const App = () => {
  useRoutePreload();

  // Initialize analytics
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <ErrorBoundary
      onError={handleGlobalError}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <ErrorFallback
            error={null}
            title="Application Error"
            message="Something went wrong with the application. Please refresh the page."
            onRetry={() => window.location.reload()}
          />
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    {/* ============================================ */}
                    {/* PUBLIC ROUTES */}
                    {/* ============================================ */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/resources" element={<Resources />} />
                    
                    {/* ✅ ADMIN LOGIN (Separate from regular login) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* ============================================ */}
                    {/* USER PROTECTED ROUTES */}
                    {/* ============================================ */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analyze" 
                      element={
                        <ProtectedRoute>
                          <Analyze />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analyze-results" 
                      element={
                        <ProtectedRoute>
                          <AnalyzeResults />
                        </ProtectedRoute>
                      } 
                    />
                    {/* ✅ BNS AI Streaming Analysis */}
                    <Route 
                      path="/bns-analysis" 
                      element={
                        <ProtectedRoute>
                          <BNSAnalyze />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Redirect legacy /bns route */}
                    <Route path="/bns" element={<Navigate to="/bns-analysis" replace />} />
                    {/* ✅ Case Result Hub */}
                    <Route 
                      path="/case/:id" 
                      element={
                        <ProtectedRoute>
                          <CaseResult />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/lawyers" 
                      element={
                        <ProtectedRoute>
                          <Lawyers />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cases/:id" 
                      element={
                        <ProtectedRoute>
                          <CaseDetail />
                        </ProtectedRoute>
                      } 
                    />

                    {/* ============================================ */}
                    {/* ✅ ADMIN ROUTES */}
                    {/* ============================================ */}
                    
                    {/* Admin Dashboard */}
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } 
                    />
                    
                    {/* Manage Lawyers */}
                    <Route 
                      path="/admin/lawyers" 
                      element={
                        <AdminRoute>
                          <ManageLawyers />
                        </AdminRoute>
                      } 
                    />
                    
                    {/* Add New Lawyer */}
                    <Route 
                      path="/admin/lawyers/new" 
                      element={
                        <AdminRoute>
                          <ManageLawyers />
                        </AdminRoute>
                      } 
                    />
                    
                    {/* View Consultations */}
                    <Route 
                      path="/admin/consultations" 
                      element={
                        <AdminRoute>
                          <ViewConsultations />
                        </AdminRoute>
                      } 
                    />
                    
                    {/* View All Cases */}
                    <Route 
                      path="/admin/cases" 
                      element={
                        <AdminRoute>
                          <ViewAllCases />
                        </AdminRoute>
                      } 
                    />

                    {/* ============================================ */}
                    {/* ✅ LAWYER ROUTES */}
                    {/* ============================================ */}
                    
                    <Route 
                      path="/lawyer/dashboard" 
                      element={
                        <LawyerRoute>
                          <LawyerDashboard />
                        </LawyerRoute>
                      } 
                    />

                    {/* ============================================ */}
                    {/* FUTURE ROUTES (Commented for now) */}
                    {/* ============================================ */}
                    {/* 
                    <Route 
                      path="/chat" 
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cases" 
                      element={
                        <ProtectedRoute>
                          <Cases />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/advocates" 
                      element={
                        <ProtectedRoute>
                          <Advocates />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    */}

                    {/* ============================================ */}
                    {/* 404 - NOT FOUND (Keep this last) */}
                    {/* ============================================ */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;