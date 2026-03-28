import { useState, useCallback, useEffect } from 'react';
import { Scale, Menu, X, ChevronDown, LogOut, LayoutDashboard, User, FileText } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Situation Assessment', href: '#analyzer', hash: true },
  { label: 'Procedural Steps',     href: '#timeline',  hash: true },
  { label: 'Legal Assistance',     href: '/lawyers',   hash: false },
  { label: 'Resources',            href: '/resources', hash: false },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleHashNav = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
    setMobileOpen(false);
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Sign-out failed');
    }
  };

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        paddingTop:   scrolled ? '10px' : '16px',
        paddingBottom: scrolled ? '10px' : '16px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="relative flex items-center justify-between rounded-xl px-5 py-3"
          style={{
            background: scrolled
              ? 'rgba(8, 13, 20, 0.96)'
              : 'rgba(8, 13, 20, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
            transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(221 89% 60%) 0%, hsl(238 72% 58%) 100%)',
                boxShadow: '0 2px 8px hsl(221 89% 60% / 0.35)',
              }}
            >
              <Scale className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[15px] font-semibold tracking-tight text-white">Lumina</span>
              <span
                className="text-[15px] font-semibold tracking-tight"
                style={{ color: 'hsl(221 89% 60%)' }}
              >
                Legal
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link =>
              link.hash ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => handleHashNav(e, link.href)}
                  className="px-3 py-1.5 text-[13.5px] font-medium text-[hsl(220_14%_60%)] hover:text-white rounded-lg hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-3 py-1.5 text-[13.5px] font-medium text-[hsl(220_14%_60%)] hover:text-white rounded-lg hover:bg-white/[0.05] transition-all duration-200"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: 'hsl(221 89% 60%)' }}
                  >
                    {initial}
                  </div>
                  <span className="text-[13px] font-medium text-white/70 max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-white/40 transition-transform duration-200"
                    style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22,1,0.36,1] }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl z-50 overflow-hidden"
                        style={{
                          background: 'hsl(220 22% 10%)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                      >
                        <div className="px-3 py-2.5 border-b border-white/[0.06]">
                          <p className="text-[12px] font-medium text-white truncate">{user.email}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">Free Plan</p>
                        </div>
                        <div className="py-1.5 px-1.5 space-y-0.5">
                          {[
                            { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                            { icon: FileText,        label: 'BNS Analysis', to: '/bns-analysis' },
                            { icon: User,            label: 'Profile',    to: '/profile' },
                          ].map(item => (
                            <Link key={item.label} to={item.to} onClick={() => setUserMenuOpen(false)}>
                              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-150 cursor-pointer">
                                <item.icon className="w-3.5 h-3.5" />
                                {item.label}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-white/[0.06] py-1.5 px-1.5">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-red-400/80 hover:text-red-400 hover:bg-red-400/[0.08] transition-all duration-150"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-[13.5px] font-medium text-white/60 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-[13.5px] font-semibold text-white rounded-lg transition-all duration-200"
                  style={{
                    background: 'hsl(221 89% 60%)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 3px 10px hsl(221 89% 60% / 0.3)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 16px hsl(221 89% 60% / 0.4)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,255,255,0.15) inset, 0 3px 10px hsl(221 89% 60% / 0.3)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
              className="md:hidden overflow-hidden mt-2 rounded-xl"
              style={{
                background: 'rgba(8, 13, 20, 0.97)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div className="px-2 py-2 space-y-0.5">
                {NAV_LINKS.map(link =>
                  link.hash ? (
                    <a key={link.label} href={link.href}
                      onClick={e => handleHashNav(e, link.href)}
                      className="block px-3 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-150 cursor-pointer"
                    >{link.label}</a>
                  ) : (
                    <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-150"
                    >{link.label}</Link>
                  )
                )}
              </div>
              <div className="border-t border-white/[0.06] px-2 py-2 space-y-0.5">
                {user ? (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-[13px] font-medium text-white">{user.email}</p>
                      <p className="text-[11px] text-white/40">Free Plan</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                    ><LayoutDashboard className="w-4 h-4" />Dashboard</Link>
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[14px] text-red-400/80 hover:text-red-400 hover:bg-red-400/[0.06] rounded-lg transition-all text-left"
                    ><LogOut className="w-4 h-4" />Sign Out</button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1 py-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="text-center py-2.5 text-[14px] font-medium text-white/70 hover:text-white border border-white/[0.08] rounded-lg hover:bg-white/[0.04] transition-all"
                    >Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="text-center py-2.5 text-[14px] font-semibold text-white rounded-lg transition-all"
                      style={{ background: 'hsl(221 89% 60%)' }}
                    >Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;