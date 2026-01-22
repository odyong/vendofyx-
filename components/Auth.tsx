import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase.ts';
import { Mail, Lock, ShieldCheck, Star, Zap, Smartphone, ArrowLeft, Loader2, UserPlus, LogIn, CheckCircle2, Inbox } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: any) => void;
}

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Database connection is not configured yet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Point back to the current origin for a seamless return
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("OAuth Error:", err);
      // Specifically handle the case where Google provider is disabled in Supabase dashboard
      if (err.message?.includes('provider is not enabled')) {
        setError('Google sign-in is not enabled. Go to Supabase Dashboard > Authentication > Providers to enable it.');
      } else {
        setError(err.message || 'An error occurred during Google sign-in.');
      }
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
        <div className="max-w-md w-full bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-8 animate-in zoom-in duration-300">
          <div className="bg-blue-50 dark:bg-blue-950/30 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Inbox size={48} className="text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tighter uppercase">Check Your Inbox</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We've sent a verification link to <br/><span className="text-charcoal-900 dark:text-white font-bold break-all">{email}</span>.
            </p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-charcoal-950/50 rounded-2xl text-xs font-bold text-slate-400 text-left space-y-2">
            <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Click the link to activate your account.</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Once confirmed, return here to log in.</div>
          </div>
          <div className="pt-4 flex flex-col gap-3">
             <button onClick={() => window.location.reload()} className="w-full bg-charcoal-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl transition-all active:scale-95 shadow-lg">Verified? Log In Now</button>
             <button onClick={() => setIsEmailSent(false)} className="text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-colors">Wait, I used the wrong email</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-charcoal-900 dark:text-white tracking-tighter leading-tight">
              Reputation <br />
              <span className="text-blue-600">On Autopilot.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Join 500+ businesses filtering their feedback and building trust with every single customer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Star className="text-amber-400 fill-amber-400 mb-2" size={20} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Filter 1-3 Stars</p>
            </div>
            <div className="p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Zap className="text-blue-500 fill-blue-500 mb-2" size={20} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Boost 5 Stars</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative">
          <button onClick={() => navigate('/')} className="absolute -top-12 left-0 text-slate-400 hover:text-blue-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back Home
          </button>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? "Enter your credentials to manage your inbox" : "Create your account and start filtering today"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-all active:scale-95 group shadow-sm"
            >
              <GoogleLogo />
              Continue with Google
            </button>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-charcoal-950 border-2 border-slate-50 dark:border-charcoal-800 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-charcoal-950 border-2 border-slate-50 dark:border-charcoal-800 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-charcoal-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Create Account</>)}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-charcoal-800 text-center space-y-6">
            <p className="text-sm font-bold text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-black"
              >
                {isLogin ? 'Sign up for free' : 'Login now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;