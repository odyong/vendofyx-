import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './supabase';
import { Profile } from './types';
import Dashboard from './components/Dashboard';
import RatePage from './components/RatePage';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Refund from './components/Refund';
import { LogOut, LayoutDashboard, Star, Sun, Moon } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="route-transition-wrapper"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC<{
  session: any;
  profile: Profile | null;
  loading: boolean;
  isDark: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
  loadProfile: (id: string, isDemo: boolean) => void;
  handleAuthSuccess: (user: any, isDemo: boolean) => void;
}> = ({ session, profile, loading, isDark, toggleDarkMode, handleLogout, loadProfile, handleAuthSuccess }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  const Navbar = () => (
    <nav className="bg-white dark:bg-charcoal-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="logo-container relative flex items-center gap-4 font-black text-charcoal-900 dark:text-white text-2xl group transition-all duration-300 py-3 px-2">
          <div className="relative z-10">
            <Star className={`main-star transition-all duration-500 ${isDark ? 'fill-blue-500' : 'fill-charcoal-900'} text-transparent`} size={32} />
          </div>
          <div className="relative">
            <span className="logo-text transition-all duration-300 text-3xl tracking-tighter relative z-10">Vendofyx</span>
            <Star className="surround-star star-1 text-blue-500 fill-blue-500" size={10} />
            <Star className="surround-star star-2 text-amber-500 fill-amber-500" size={12} />
            <Star className="surround-star star-3 text-indigo-400 fill-indigo-400" size={8} />
            <Star className="surround-star star-4 text-purple-500 fill-purple-500" size={11} />
            <Star className="surround-star star-5 text-emerald-500 fill-emerald-500" size={9} />
            <Star className="surround-star star-6 text-rose-500 fill-rose-500" size={10} />
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={toggleDarkMode}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-amber-400 shadow-sm overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {session ? (
            <>
              <Link to="/dashboard" className={`flex items-center gap-1 font-bold transition-all hover:text-blue-600 ${location.pathname === '/dashboard' ? 'text-blue-600 scale-105 underline decoration-2 underline-offset-4' : 'text-slate-600 dark:text-slate-400'}`}>
                <LayoutDashboard size={20} /> <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all hover:scale-105"
              >
                <LogOut size={20} /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <Link 
              to="/auth?mode=login" 
              className={`transition-all duration-500 px-8 py-3 rounded-2xl ${isAuthPage ? 'bg-charcoal-900 dark:bg-blue-600 text-white font-black scale-110 shadow-xl -translate-y-1' : 'text-slate-900 dark:text-white font-black text-lg hover:text-blue-600 hover:scale-110 active:scale-95'}`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-950">
      <div className="flex flex-col items-center gap-4">
        <Star className="w-16 h-16 text-charcoal-900 dark:text-blue-500 animate-spin fill-current" size={64} />
        <p className="text-charcoal-900 dark:text-white font-black text-2xl animate-pulse tracking-widest uppercase">Vendofyx</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow dark:bg-charcoal-950 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/auth" element={<PageWrapper>{!session ? <Auth onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/dashboard" />}</PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper>{session ? <Dashboard profile={profile} onProfileUpdate={(id) => loadProfile(id, !!localStorage.getItem('vendofyx_mock_user'))} /> : <Navigate to="/auth" />}</PageWrapper>} />
            <Route path="/rate/:id" element={<PageWrapper><RatePage /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
            <Route path="/refund" element={<PageWrapper><Refund /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <footer className="bg-charcoal-900 dark:bg-charcoal-950 text-slate-400 py-16 px-4 border-t border-slate-800 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 font-black text-white text-2xl mb-6"><Star className="fill-blue-500 text-blue-500" size={28} />Vendofyx</div>
            <p className="text-slate-400 leading-relaxed font-medium text-sm">Join elite businesses protecting their brand and scaling their public trust with smart feedback logic.</p>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/terms" className="hover:text-blue-300 transition-all">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-300 transition-all">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-blue-300 transition-all">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/auth?mode=signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Support</h4>
            <a href="mailto:support@vendofyx.com" className="text-sm font-medium hover:text-blue-400 transition-colors">support@vendofyx.com</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 dark:border-slate-900 text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Vendofyx. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('vendofyx_theme') === 'dark' || (!localStorage.getItem('vendofyx_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('vendofyx_theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('vendofyx_theme', 'light'); }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const loadProfile = async (userId: string, isDemo: boolean) => {
    if (isDemo) {
      setProfile({ id: userId, business_name: 'Vendofyx Demo Store', google_review_url: 'https://google.com', terms_url: '', privacy_url: '', refund_url: '', paddle_sub_status: 'active', created_at: new Date().toISOString() });
      return;
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        const newProfile = { id: userId, business_name: 'My Business', google_review_url: '', terms_url: '', privacy_url: '', refund_url: '', paddle_sub_status: 'inactive' };
        await supabase.from('profiles').insert(newProfile);
        setProfile(newProfile as any);
      } else {
        setProfile(data);
      }
    } catch (e) { console.warn("Profile load failed", e); }
  };

  const handleAuthSuccess = async (user: any, isDemo: boolean) => {
    setSession({ user });
    await loadProfile(user.id, isDemo);
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      const mockUserStr = localStorage.getItem('vendofyx_mock_user');
      if (mockUserStr) {
        try { handleAuthSuccess(JSON.parse(mockUserStr), true); return; } 
        catch (e) { localStorage.removeItem('vendofyx_mock_user'); }
      }

      if (isSupabaseConfigured) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) await handleAuthSuccess(currentSession.user, false);
          else setLoading(false);
        } catch (e) { setLoading(false); }
      } else { setLoading(false); }
    };
    initSession();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('vendofyx_mock_user');
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    window.location.hash = '#/';
  };

  return (
    <HashRouter>
      <AppContent session={session} profile={profile} loading={loading} isDark={isDark} toggleDarkMode={toggleDarkMode} handleLogout={handleLogout} loadProfile={loadProfile} handleAuthSuccess={handleAuthSuccess} />
    </HashRouter>
  );
};

export default App;