import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase';
import { Mail, Lock, ShieldCheck, Star, Zap, Smartphone, ArrowLeft, Loader2, UserPlus, LogIn } from 'lucide-react';

interface Props {
  onAuthSuccess: (user: any, isDemo: boolean) => void;
}

const DemoTourPreview = () => (
  <div className="relative w-full h-64 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden mb-6 group/demo shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 to-black opacity-50"></div>
    <div className="relative p-6 space-y-4 z-10">
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/3 h-2 bg-slate-700 rounded-full"></div>
        <div className="google-score text-[10px] font-black tracking-tighter text-amber-500">5.0 ★</div>
      </div>
      <div className="relative w-full h-10 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 flex items-center overflow-hidden shadow-sm">
        <span className="text-xs text-slate-900 dark:text-white font-bold animate-type-text">Happy Customer Experience</span>
        <div className="w-[1px] h-4 bg-blue-500 animate-pulse ml-0.5"></div>
      </div>
      <div className="w-full h-10 bg-blue-600 rounded-xl flex items-center justify-center gap-2 shadow-lg">
        <div className="w-24 h-2 bg-white/40 rounded-full"></div>
      </div>
      <div className="animate-reveal-card bg-charcoal-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={14} className="text-blue-400" />
          <div className="w-32 h-2 bg-slate-600 rounded-full"></div>
        </div>
        <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
      </div>
    </div>
  </div>
);

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [isLogin, setIsLogin] = useState(queryParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSandboxLogin = () => {
    setLoading(true);
    const mockUser = {
      id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
      email: 'demo@vendofyx.com',
      user_metadata: { full_name: 'Demo User' }
    };
    localStorage.setItem('vendofyx_mock_user', JSON.stringify(mockUser));
    setTimeout(() => {
      onAuthSuccess(mockUser, true);
      navigate('/dashboard');
    }, 1000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Database connection is not configured yet. Please use Sandbox Mode.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user, false);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { business_name: 'My New Business' } }
        });
        if (error) throw error;
        alert("Verification email sent! Please check your inbox.");
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

          <DemoTourPreview />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Star className="text-amber-400 fill-amber-400 mb-2" size={20} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Filter 1-3 Stars</p>
            </div>
            <div className="p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Zap className="text-blue-500 fill-blue-500 mb-2" size={20} />
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Boost 5 Stars</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-charcoal-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative">
          <button onClick={() => navigate('/')} className="absolute -top-12 left-0 text-slate-400 hover:text-blue-600 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back Home
          </button>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? "Enter your credentials to manage your inbox" : "Create your account and start filtering today"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                {error}
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-charcoal-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-300 bg-white dark:bg-charcoal-900 px-4">Instant Preview</div>
            </div>

            <button 
              onClick={handleSandboxLogin}
              className="w-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-100 transition-all group"
            >
              <Zap size={18} className="fill-current group-hover:scale-125 transition-transform" />
              Quick Sandbox Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;