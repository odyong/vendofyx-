import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase.ts';
import { Profile, FeedbackRequest } from '../types.ts';
import { 
  Send, 
  MessageSquare, 
  Share2, 
  Clipboard, 
  Star, 
  CheckCircle2, 
  Check, 
  Settings, 
  Database as DatabaseIcon,
  RefreshCcw,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Crown,
  X,
  Activity,
  Zap,
  Timer,
  FileText,
  Copy,
  Link as LinkIcon,
  Globe,
  History,
  Shield,
  Terminal,
  Search,
  Cpu,
  Activity as PulseIcon
} from 'lucide-react';

// LIVE PADDLE CONFIGURATION
const PADDLE_CLIENT_TOKEN = 'live_50dc092cb26ffc7be82d26603f7'; 
const PRICE_ID_MONTHLY = 'pri_01hks96z1z7vzrj00p0m0h1z1'; 
const PRICE_ID_ANNUAL = 'pri_01hks97r5z7vzrj00p0m0h2z2'; 

declare global {
  interface Window {
    Paddle: any;
  }
}

interface Props {
  profile: Profile | null;
  onProfileUpdate: (id: string) => void;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const Dashboard: React.FC<Props> = ({ profile, onProfileUpdate }) => {
  const [customerName, setCustomerName] = useState('');
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [paddleStatus, setPaddleStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');

  const isPro = profile?.paddle_sub_status === 'active' || profile?.paddle_sub_status === 'active_annual';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 50));
  };

  const baseUrl = window.location.origin + window.location.pathname;
  const legalLinks = [
    { name: 'Terms of Service', path: '#/terms', icon: <FileText size={16} /> },
    { name: 'Privacy Policy', path: '#/privacy', icon: <ShieldCheck size={16} /> },
    { name: 'Refund Policy', path: '#/refund', icon: <History size={16} /> }
  ];

  const handleCopyLegal = (path: string, name: string) => {
    const fullUrl = `${baseUrl}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopyStatus(name);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const runDiagnostics = () => {
    addLog("Checking environment...", "info");
    if (window.Paddle) {
      setPaddleStatus('ready');
    } else {
      setPaddleStatus('error');
    }
  };

  useEffect(() => {
    const initPaddle = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({ 
          token: PADDLE_CLIENT_TOKEN,
          environment: 'production', 
          eventCallback: (event: any) => {
            if (event.name === 'checkout.completed') {
               handleLocalUpgradeSuccess();
            }
            if (event.name === 'checkout.closed') {
               setUpgrading(false);
            }
          }
        });
        setPaddleStatus('ready');
      } else {
        setTimeout(initPaddle, 1500);
      }
    };

    initPaddle();
    runDiagnostics();
  }, []);

  const handleLocalUpgradeSuccess = async () => {
    if (profile) {
      onProfileUpdate(profile.id);
      setShowUpgradeModal(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
      setGoogleUrl(profile.google_review_url || '');
      fetchRequests();
    }
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('feedback_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setRequests(data || []);
    } catch (e: any) { 
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    const updates = { business_name: businessName, google_review_url: googleUrl };
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) { console.error(error); } else { onProfileUpdate(profile.id); setEditingProfile(false); }
    setLoading(false);
  };

  const handleUpgradeCheckout = async () => {
    if (!window.Paddle) {
      setPaddleStatus('error');
      return;
    }

    setUpgrading(true);
    const priceId = selectedPlan === 'yearly' ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY;

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: profile?.id },
      customData: { userId: profile?.id },
      settings: { displayMode: 'overlay', theme: 'light', locale: 'en' }
    });
  };

  const generateLink = async () => {
    if (!customerName.trim() || !profile) return;
    if (!profile.google_review_url) { setShowConfigError(true); return; }
    if (!isPro) { setShowUpgradeModal(true); return; }
    
    setLoading(true);
    setShowSuccess(false);
    try {
      const { data, error } = await supabase.from('feedback_requests').insert({ user_id: profile.id, customer_name: customerName, status: 'pending' }).select().single();
      if (error) throw error;
      setNewLink(`${window.location.origin}${window.location.pathname}#/rate/${data.id}`);
      setCustomerName(''); await fetchRequests(); 
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) { console.error(error); } finally { setLoading(false); }
  };

  const copyAndToast = () => { if (!newLink) return; navigator.clipboard.writeText(newLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getSharingUrls = () => {
    const shareText = `Hi! Could you leave us a quick review for ${profile?.business_name}? ${newLink}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return {
      sms: `sms:${isIOS ? '&' : '?'}body=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    };
  };

  const confettiColors = ['#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-charcoal-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-charcoal-900 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <button onClick={() => setShowUpgradeModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-charcoal-900 dark:hover:text-white"><X size={24} /></button>
              <div className="text-center mb-10">
                <div className="bg-blue-50 dark:bg-blue-950/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"><Crown size={32} className="text-blue-600 dark:text-blue-400" /></div>
                <h3 className="text-3xl font-black text-charcoal-900 dark:text-white mb-2 tracking-tighter uppercase">Scale Your Growth</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">Active subscription required to generate professional magic links.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <button onClick={() => setSelectedPlan('monthly')} className={`p-6 rounded-[2rem] border-4 transition-all text-left relative group ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-charcoal-800 hover:border-slate-200'}`}>
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Billing</div>
                  <div className="text-3xl font-black text-charcoal-900 dark:text-white">$29<span className="text-sm font-bold opacity-50">/mo</span></div>
                  {selectedPlan === 'monthly' && <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1"><Check size={14} /></div>}
                </button>
                <button onClick={() => setSelectedPlan('yearly')} className={`p-6 rounded-[2rem] border-4 transition-all text-left relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-charcoal-800 hover:border-slate-200'}`}>
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Saves $49/yr</div>
                  <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Yearly Billing</div>
                  <div className="text-3xl font-black text-charcoal-900 dark:text-white">$299<span className="text-sm font-bold opacity-50">/yr</span></div>
                  {selectedPlan === 'yearly' && <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1"><Check size={14} /></div>}
                </button>
              </div>
              <div className="space-y-6">
                <button onClick={handleUpgradeCheckout} disabled={upgrading || paddleStatus === 'loading'} className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl ${
                    paddleStatus === 'error' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-charcoal-900 dark:bg-blue-600 text-white hover:shadow-2xl'
                  }`}>
                  {upgrading ? <RefreshCcw size={24} className="animate-spin" /> : <><CreditCard size={24} /> {paddleStatus === 'error' ? 'Payment Error' : 'Subscribe Now'}</>}
                </button>
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><Shield size={14} className="text-blue-500" /> Secure Checkout by Paddle</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white dark:bg-charcoal-900 p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800"><Activity className="text-blue-600" size={32} /></div>
          <div>
            <h1 className="text-4xl font-black text-charcoal-900 dark:text-white tracking-tighter uppercase">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Active & Secure</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border transition-all duration-500 hover:scale-105 group relative ${
                isPro ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
            }`}>
              {isPro ? <><Crown size={14} /> Professional Plan</> : <><AlertCircle size={14} /> Basic Account</>}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          {!isPro && <button onClick={() => setShowUpgradeModal(true)} className="bg-amber-500 text-white font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 shadow-xl hover:bg-amber-600"><Zap size={18} className="fill-current" /> Upgrade</button>}
          <button onClick={() => setEditingProfile(!editingProfile)} className={`font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${editingProfile ? 'bg-charcoal-900 dark:bg-blue-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}><Settings size={18} /> {editingProfile ? 'Close Settings' : 'Settings'}</button>
        </div>
      </div>

      <AnimatePresence>
        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 mb-8 transition-colors">
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-charcoal-800 pb-6">
                <h2 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-3 uppercase"><DatabaseIcon className="text-blue-600" size={24} /> Business Settings</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                    <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-6 py-4 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 outline-none font-bold text-charcoal-900 dark:text-white" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Review URL</label>
                    <input value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} className="w-full px-6 py-4 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 outline-none font-bold text-charcoal-900 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 dark:bg-charcoal-950/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6"><ShieldCheck className="text-emerald-500" size={24} /><h4 className="text-lg font-black text-charcoal-900 dark:text-white uppercase tracking-tight">Policies</h4></div>
                    <div className="space-y-3">
                       {legalLinks.map((link) => (
                         <div key={link.path} className="flex items-center justify-between p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-3"><span className="text-slate-400">{link.icon}</span><span className="text-xs font-black text-charcoal-800 dark:text-slate-300 uppercase tracking-widest">{link.name}</span></div>
                            <button onClick={() => handleCopyLegal(link.path, link.name)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${copyStatus === link.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>{copyStatus === link.name ? <Check size={12} /> : <Copy size={12} />}{copyStatus === link.name ? 'Copied' : 'Copy'}</button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={handleUpdateProfile} disabled={loading} className="bg-charcoal-900 dark:bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-charcoal-950 transition-all active:scale-95 shadow-2xl flex items-center gap-3 text-lg uppercase tracking-tight">{loading ? 'Saving...' : <><Check size={24} /> Save Settings</>}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-charcoal-900 dark:bg-charcoal-950 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border border-slate-800 transition-all duration-500 ${!isPro ? 'opacity-40 grayscale-[0.3] pointer-events-none' : ''}`}>
        {!isPro && <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[4px] pointer-events-auto"><button onClick={() => setShowUpgradeModal(true)} className="bg-white text-charcoal-900 px-10 py-5 rounded-[1.5rem] font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase">Subscribe to Unlock</button></div>}
        
        <div className="max-w-2xl mx-auto space-y-12 relative z-10 text-center">
          <div><h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">Generate Link</h2><p className="text-slate-400 font-bold text-lg">Send a review request to your customer</p></div>
          <div className="space-y-6">
            <div className="relative">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name..." className="w-full px-10 py-6 rounded-[2rem] text-slate-900 focus:ring-[12px] focus:ring-blue-500/10 outline-none text-3xl font-black transition-all shadow-inner text-center placeholder:text-slate-200" />
              {customerName && <div className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse"><Sparkles size={32} /></div>}
            </div>
            <button onClick={generateLink} disabled={loading || !customerName} className={`w-full py-6 rounded-[2rem] font-black text-3xl transition-all duration-500 transform flex items-center justify-center gap-4 active:scale-95 ${customerName ? 'bg-white text-charcoal-900 hover:bg-blue-50 hover:-translate-y-2' : 'bg-white/10 text-white/10 cursor-not-allowed'}`}>{loading ? <div className="animate-spin h-10 w-10 border-4 border-charcoal-900 border-t-transparent rounded-full" /> : <Share2 size={36} />}{loading ? 'Creating...' : 'Get Magic Link'}</button>
          </div>
          
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
              >
                <div className="relative flex flex-col items-center">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        scale: [0, 1, 0.5, 0], 
                        x: (Math.random() - 0.5) * 400, 
                        y: (Math.random() - 0.5) * 400,
                        rotate: Math.random() * 360
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute w-3 h-3 rounded-sm"
                      style={{ backgroundColor: confettiColors[i % confettiColors.length] }}
                    />
                  ))}
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 200 }}
                    className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.6)] relative z-10"
                  >
                    <Check size={80} strokeWidth={4} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {newLink && !showSuccess && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-charcoal-950/60 p-10 rounded-[3rem] border border-charcoal-800 shadow-2xl space-y-10">
              <div className="flex items-center gap-3">
                <input readOnly value={newLink} className="flex-1 bg-charcoal-950 border-2 border-charcoal-700 rounded-2xl px-6 py-5 text-sm text-blue-300 font-bold" />
                <button onClick={copyAndToast} className={`p-5 rounded-2xl transition-all active:scale-90 shadow-lg ${copied ? 'bg-emerald-600' : 'bg-charcoal-800 hover:bg-blue-600'} text-white`}>{copied ? <Check size={28} /> : <Clipboard size={28} />}</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <a href={getSharingUrls().sms} className="flex flex-col items-center justify-center gap-3 bg-white text-charcoal-900 py-8 rounded-[2.5rem] font-black hover:bg-blue-50 transition-all transform hover:-translate-y-2 shadow-2xl"><MessageSquare size={44} className="text-blue-600" /><span className="text-lg">Send via SMS</span></a>
                <a href={getSharingUrls().whatsapp} target="_blank" className="flex flex-col items-center justify-center gap-3 bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black hover:bg-emerald-500 transition-all transform hover:-translate-y-2 shadow-2xl"><Send size={44} /><span className="text-lg">WhatsApp</span></a>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-12 py-10 border-b border-slate-50 dark:border-charcoal-800 flex justify-between items-center bg-slate-50/40 dark:bg-charcoal-950/30">
          <div><h3 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight uppercase">Recent Activity</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Track your feedback requests</p></div>
          <button onClick={fetchRequests} className="p-4 text-slate-400 hover:text-blue-600 transition-all group"><RefreshCcw size={24} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /></button>
        </div>
        <div className="overflow-x-auto p-8">
          {requests.length === 0 ? (
            <div className="py-24 text-center space-y-6"><div className="bg-slate-50 dark:bg-charcoal-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner"><Star size={40} className="text-slate-200" /></div><p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No activity yet</p></div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead><tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest"><th className="px-8 py-5">Customer</th><th className="px-8 py-5">Status</th><th className="px-8 py-5">Rating</th><th className="px-8 py-5 text-right">Date</th></tr></thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="bg-slate-50/50 dark:bg-charcoal-950/30 hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-8 border-y border-l border-slate-50 dark:border-charcoal-800 rounded-l-[2rem] font-black text-charcoal-900 dark:text-white text-lg">{req.customer_name}</td>
                    <td className="px-8 py-8 border-y border-slate-50 dark:border-charcoal-800"><span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${req.status === 'rated' ? 'bg-emerald-50 text-emerald-600' : req.status === 'clicked' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>{req.status}</span></td>
                    <td className="px-8 py-8 border-y border-slate-50 dark:border-charcoal-800">{req.rating ? <div className="flex gap-1 text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < req.rating! ? 'fill-amber-400' : 'text-slate-100'} />)}</div> : <span className="text-slate-200">—</span>}</td>
                    <td className="px-8 py-8 border-y border-r border-slate-50 dark:border-charcoal-800 rounded-r-[2rem] text-right text-[10px] font-black text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;