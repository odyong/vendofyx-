import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './supabase.ts';
import { Profile } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import RatePage from './components/RatePage.tsx';
import Auth from './components/Auth.tsx';
import Landing from './components/Landing.tsx';
import Terms from './components/Terms.tsx';
import Privacy from './components/Privacy.tsx';
import Refund from './components/Refund.tsx';
import { LogOut, LayoutDashboard, Star, Sun, Moon, ShieldCheck, HelpCircle, FileText, Globe } from 'lucide-react';

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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('vendofyx_theme') === 'dark' || 
             (!localStorage.getItem('vendofyx_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) { return false; }
  });

  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('vendofyx_theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('vendofyx_theme', 'light'); }
  }, [isDark]);

  const loadProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      const newProfile = { id: userId, business_name: 'My Business', google_review_url: '', paddle_sub_status: 'inactive' };
      await supabase.from('profiles').insert(newProfile);
      setProfile(newProfile as any);
    } else { setProfile(data); }
  };

  const handleAuthSuccess = async (user: any) => {
    setSession({ user });
    await loadProfile(user.id);
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      if (isSupabaseConfigured) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) await handleAuthSuccess(currentSession.user);
        else setLoading(false);
      } else setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) await handleAuthSuccess(currentSession.user);
      else if (event === 'SIGNED_OUT') { setSession(null); setProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    window.location.href = '/';
  };

  const Navbar = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/auth';

    return (
      <nav className="bg-white dark:bg-charcoal-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="logo-container relative flex items-center gap-4 font-black text-charcoal-900 dark:text-white text-2xl group transition-all duration-300 py-3 px-2">
            <div className="relative z-10 transition-transform duration-1000 group-hover:rotate-[360deg]">
              <Star className={`main-star transition-all duration-500 ${isDark ? 'fill-indigo-500' : 'fill-charcoal-900'} group-hover:animate-pulse`} size={32} />
            </div>
            <div className="relative">
              <span className="logo-text transition-all duration-300 text-3xl tracking-tighter relative z-10 block hover-bounce">Vendofyx</span>
              <Star className="orbit-star text-indigo-500 fill-indigo-500" size={10} style={{'--start-angle': '0deg', '--distance': '75px', '--duration': '3s'} as any} />
              <Star className="orbit-star text-amber-500 fill-amber-500" size={12} style={{'--start-angle': '60deg', '--distance': '90px', '--duration': '2.5s'} as any} />
              <Star className="orbit-star text-indigo-400 fill-indigo-400" size={8} style={{'--start-angle': '120deg', '--distance': '80px', '--duration': '3.5s'} as any} />
              <Star className="orbit-star text-violet-500 fill-violet-500" size={11} style={{'--start-angle': '180deg', '--distance': '95px', '--duration': '2.8s'} as any} />
              <Star className="orbit-star text-emerald-500 fill-emerald-500" size={9} style={{'--start-angle': '240deg', '--distance': '85px', '--duration': '3.2s'} as any} />
              <Star className="orbit-star text-rose-500 fill-rose-500" size={10} style={{'--start-angle': '300deg', '--distance': '100px', '--duration': '2.7s'} as any} />
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              onClick={() => setIsDark(!isDark)}
              className="interactive-element p-3 rounded-2xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-amber-400 shadow-sm border-transparent"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {session ? (
              <>
                <Link to="/dashboard" className={`interactive-element flex items-center gap-1 font-bold px-4 py-2 rounded-xl transition-all border-transparent ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>
                  <LayoutDashboard size={20} /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="interactive-element flex items-center gap-1 font-bold px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all border-transparent">
                  <LogOut size={20} /> <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/auth?mode=login" className={`interactive-element transition-all duration-500 px-8 py-3 rounded-2xl border-transparent ${isAuthPage ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/30' : 'text-slate-900 dark:text-white font-black text-lg'}`}>
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-950">
      <Star className="w-16 h-16 text-indigo-500 animate-spin fill-current" />
    </div>
  );

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow dark:bg-charcoal-950 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/auth" element={<PageWrapper>{!session ? <Auth onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/dashboard" />}</PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper>{session ? <Dashboard profile={profile} onProfileUpdate={(id) => loadProfile(id)} /> : <Navigate to="/auth" />}</PageWrapper>} />
              <Route path="/rate/:id" element={<PageWrapper><RatePage /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
              <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
              <Route path="/refund" element={<PageWrapper><Refund /></PageWrapper>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        <footer className="bg-charcoal-900 dark:bg-charcoal-950 text-slate-400 py-24 px-6 border-t border-slate-800 dark:border-slate-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-black text-white text-3xl"><Star className="fill-indigo-500 text-indigo-500" size={32} />Vendofyx</div>
              <p className="text-slate-400 font-bold text-sm">Empowering brands to scale public trust with automated logic.</p>
            </div>
            <div>
              <h4 className="text-white font-black mb-8 uppercase tracking-widest text-[10px]">Legal</h4>
              <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
                <li><Link to="/terms" className="interactive-element px-2 py-1 rounded-md border-transparent hover:text-indigo-400">Terms</Link></li>
                <li><Link to="/privacy" className="interactive-element px-2 py-1 rounded-md border-transparent hover:text-indigo-400">Privacy</Link></li>
                <li><Link to="/refund" className="interactive-element px-2 py-1 rounded-md border-transparent hover:text-indigo-400">Refunds</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-8 uppercase tracking-widest text-[10px]">Account</h4>
              <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
                <li><Link to="/auth?mode=signup" className="interactive-element px-2 py-1 rounded-md border-transparent hover:text-indigo-400">Sign Up</Link></li>
                <li><Link to="/dashboard" className="interactive-element px-2 py-1 rounded-md border-transparent hover:text-indigo-400">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-8 uppercase tracking-widest text-[10px]">Support</h4>
              <a href="mailto:support@vendofyx.com" className="interactive-element px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest border-transparent shadow-xl shadow-indigo-500/20">Get Help</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;