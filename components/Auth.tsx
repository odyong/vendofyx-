import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase.ts';
import { Mail, Lock, ShieldCheck, Star, Zap, Smartphone, ArrowLeft, Loader2, UserPlus, LogIn, CheckCircle2, Inbox, ExternalLink } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: any) => void;
}

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [isLogin, setIsLogin] = useState(queryParams.get('mode') !== 'signup');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Database connection is not configured yet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Database connection is not configured yet.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user);
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { business_name: 'My New Business' } }
        });
        if (error) throw error;
        
        if (data.session) {
          onAuthSuccess(data.user);
          navigate('/dashboard');
        } else {
          setIsEmailSent(true);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-charcoal-900 p-12 rounded-[3.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 text-center space-y-8">
          <div className="bg-blue-50 dark:bg-blue-950/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Inbox size={48} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-charcoal-900 dark:text-white uppercase tracking-tight">Verify Inbox</h2>
            <p className="text-slate-500 font-medium">We sent a link to <br/><span className="text-charcoal-900 dark:text-white font-bold break-all">{email}</span></p>
          </div>
          <div className="pt-4 flex flex-col gap-4">
             <button onClick={() => window.location.reload()} className="interactive-element w-full bg-charcoal-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl border-transparent shadow-xl">I've Verified My Email</button>
             <button onClick={() => setIsEmailSent(false)} className="interactive-element text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-colors border-transparent py-2">Back to Edit Email</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <div className="hidden md:block space-y-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-black text-charcoal-900 dark:text-white tracking-tighter leading-[0.85]">
              Scale Trust <br />
              <span className="text-blue-600">On Autopilot.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Join 500+ businesses filtering their feedback and building public trust with every customer visit.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-charcoal-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <Star className="text-amber-400 fill-amber-400 mb-4" size={24} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest leading-tight">Filter 1-3 Star Complaints</p>
            </div>
            <div className="p-6 bg-white dark:bg-charcoal-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <Zap className="text-blue-500 fill-blue-500 mb-4" size={24} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest leading-tight">Boost 5 Star Public Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 relative">
          <button onClick={() => navigate('/')} className="interactive-element absolute -top-12 left-0 text-slate-400 hover:text-blue-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors border-transparent py-2 px-4 rounded-xl">
            <ArrowLeft size={16} /> Back Home
          </button>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight uppercase">
              {isLogin ? 'Portal Login' : 'Create Account'}
            </h1>
            <p className="text-slate-500 font-bold mt-2">
              {isLogin ? "Manage your reputation" : "Start filtering today"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button onClick={handleGoogleLogin} disabled={loading} className="interactive-element w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-charcoal-950 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-charcoal-700 dark:text-white shadow-sm">
              <GoogleLogo /> Continue with Google
            </button>
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-start gap-3 text-red-600 text-xs font-bold">
                <ShieldCheck size={18} className="flex-shrink-0" />
                <div className="leading-tight uppercase tracking-widest">{error}</div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="interactive-element w-full px-6 py-4 bg-slate-50 dark:bg-charcoal-950 border-slate-100 dark:border-charcoal-800 rounded-2xl outline-none font-bold text-charcoal-900 dark:text-white" placeholder="name@business.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secure Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="interactive-element w-full px-6 py-4 bg-slate-50 dark:bg-charcoal-950 border-slate-100 dark:border-charcoal-800 rounded-2xl outline-none font-bold text-charcoal-900 dark:text-white" placeholder="••••••••" />
            </div>
            <button disabled={loading} className="interactive-element w-full bg-charcoal-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl border-transparent shadow-xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Get Started</>)}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 dark:border-charcoal-800 text-center">
            <p className="text-sm font-bold text-slate-400">
              {isLogin ? "New to Vendofyx?" : "Already a partner?"}
              <button onClick={() => setIsLogin(!isLogin)} className="interactive-element ml-2 text-blue-600 font-black border-transparent px-2 py-1 rounded-lg">
                {isLogin ? 'Join Free' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;