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
  const logContainerRef = useRef<HTMLDivElement>(null);

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
    addLog("🔍 Starting System Diagnostics...", "info");
    if (window.Paddle) {
      addLog("✅ Paddle SDK detected on global window", "success");
      addLog(`🔑 Client Token active: ${PADDLE_CLIENT_TOKEN.substring(0, 8)}...`, "info");
      addLog("🌍 Environment: Production", "info");
      setPaddleStatus('ready');
    } else {
      addLog("❌ Paddle SDK missing from environment", "error");
      setPaddleStatus('error');
    }
    if (profile) addLog(`👤 User Profile authenticated: ${profile.id}`, "success");
  };

  useEffect(() => {
    const initPaddle = () => {
      if (window.Paddle) {
        addLog("💳 Initializing Paddle Payment Bridge...", "info");
        window.Paddle.Initialize({ 
          token: PADDLE_CLIENT_TOKEN,
          environment: 'production', 
          eventCallback: (event: any) => {
            addLog(`🎯 Paddle Event: ${event.name}`, event.name === 'error' ? 'error' : 'info');
            if (event.name === 'checkout.completed') {
               addLog("🎉 Transaction verified! Upgrading account...", "success");
               handleLocalUpgradeSuccess();
            }
            if (event.name === 'checkout.closed') {
               setUpgrading(false);
               addLog("ℹ️ Checkout overlay closed by user", "info");
            }
          }
        });
        setPaddleStatus('ready');
        addLog("✅ Paddle Gateway Online", "success");
      } else {
        addLog("⌛ Waiting for Paddle SDK to mount...", "warning");
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
      addLog("Profile synchronized with Paddle Subscription", "success");
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
      addLog("📥 Syncing platform telemetry...", "info");
      const { data, error } = await supabase.from('feedback_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setRequests(data || []);
      addLog(`✅ Successfully synced ${data?.length || 0} events`, "success");
    } catch (e: any) { 
      addLog(`❌ Sync Error: ${e.message}`, "error");
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    addLog(`Deploying new configuration for ${businessName}...`, "info");
    const updates = { business_name: businessName, google_review_url: googleUrl };
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) { addLog(`Deployment failed: ${error.message}`, "error"); } else { onProfileUpdate(profile.id); setEditingProfile(false); addLog("Live deployment successful", "success"); }
    setLoading(false);
  };

  const handleUpgradeCheckout = async () => {
    if (!window.Paddle) {
      setPaddleStatus('error');
      addLog("Critical: Paddle SDK not available", "error");
      setShowDiagnostics(true);
      return;
    }

    setUpgrading(true);
    const priceId = selectedPlan === 'yearly' ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY;
    addLog(`Initiating Checkout Sequence: ${priceId}`, "info");

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
      addLog(`Generating secure magic link for ${customerName}...`, "info");
      const { data, error } = await supabase.from('feedback_requests').insert({ user_id: profile.id, customer_name: customerName, status: 'pending' }).select().single();
      if (error) throw error;
      setNewLink(`${window.location.origin}${window.location.pathname}#/rate/${data.id}`);
      setCustomerName(''); await fetchRequests(); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2500);
      addLog("Production link deployed", "success");
    } catch (error: any) { addLog(`Link generation error: ${error.message}`, "error"); } finally { setLoading(false); }
  };

  const copyAndToast = () => { if (!newLink) return; navigator.clipboard.writeText(newLink); setCopied(true); setTimeout(() => setCopied(false), 2000); addLog("Link copied to clipboard", "info"); };

  const getSharingUrls = () => {
    const shareText = `Hi! Could you leave us a quick review for ${profile?.business_name}? ${newLink}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return {
      sms: `sms:${isIOS ? '&' : '?'}body=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Diagnostics Console Modal */}
      <AnimatePresence>
        {showDiagnostics && (
          <div className="fixed inset-0 bg-charcoal-950/95 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-charcoal-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-charcoal-950">
                <div className="flex items-center gap-3">
                  <Terminal className="text-blue-500" size={24} />
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">System Diagnostics Console</h3>
                </div>
                <button onClick={() => setShowDiagnostics(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-xs bg-black" ref={logContainerRef}>
                {logs.length === 0 && <p className="text-slate-600 italic">No telemetry data recorded yet...</p>}
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 border-b border-white/5 pb-2">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }>
                      {log.type.toUpperCase()}: {log.message}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-charcoal-950 border-t border-slate-800 flex flex-wrap gap-4">
                <button onClick={runDiagnostics} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all">
                  <Search size={14} /> Re-Scan Environment
                </button>
                <div className="flex-1"></div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> SDK Loaded</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> API Pulse</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

              <div className="mb-8 flex justify-center">
                <button 
                  onClick={() => setShowDiagnostics(true)}
                  className={`px-4 py-2 rounded-full border flex items-center gap-3 transition-all duration-500 hover:scale-105 ${
                  paddleStatus === 'ready' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 text-emerald-600' : 
                  paddleStatus === 'error' ? 'bg-red-50 dark:bg-red-950/30 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${paddleStatus === 'ready' ? 'bg-emerald-500 animate-pulse' : paddleStatus === 'error' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {paddleStatus === 'ready' ? 'Secure Payment Engine: Ready (Check Live)' : 
                     paddleStatus === 'error' ? 'Payment Engine: Connection Error' : 'Initializing Engine...'}
                  </span>
                </button>
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
                  {upgrading ? <RefreshCcw size={24} className="animate-spin" /> : <><CreditCard size={24} /> {paddleStatus === 'error' ? 'Connection Error' : 'Subscribe with Paddle'}</>}
                </button>
                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><Shield size={14} className="text-blue-500" /> Checkout by Paddle.com</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white dark:bg-charcoal-900 p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800"><Activity className="text-blue-600" size={32} /></div>
          <div>
            <h1 className="text-4xl font-black text-charcoal-900 dark:text-white tracking-tighter uppercase">Console</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Live Production Active</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border transition-all duration-500 hover:scale-105 group relative ${
                isPro ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
            }`}>
              {isPro ? <><Crown size={14} /> Pro Core Enabled</> : <><AlertCircle size={14} /> Activate Account</>}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-900 text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">View Plans</span>
            </button>

            <button 
              onClick={() => setShowDiagnostics(true)}
              className="bg-slate-100 dark:bg-charcoal-800 p-2 rounded-full text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center relative group"
            >
              <PulseIcon size={18} className="animate-pulse" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-900 text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">System Health</span>
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          {!isPro && <button onClick={() => setShowUpgradeModal(true)} className="bg-amber-500 text-white font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 shadow-xl hover:bg-amber-600"><Zap size={18} className="fill-current" /> Upgrade Now</button>}
          <button onClick={() => setEditingProfile(!editingProfile)} className={`font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${editingProfile ? 'bg-charcoal-900 dark:bg-blue-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}><Settings size={18} /> {editingProfile ? 'Hide Config' : 'Configuration'}</button>
        </div>
      </div>

      <AnimatePresence>
        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 mb-8 transition-colors">
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-charcoal-800 pb-6">
                <h2 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-3 uppercase"><DatabaseIcon className="text-blue-600" size={24} /> Deployment Details</h2>
                <button onClick={() => setShowDiagnostics(true)} className="flex items-center gap-2 bg-slate-50 dark:bg-charcoal-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all">
                  <Terminal size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Open Terminal Log</span>
                </button>
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
                    <div className="flex items-center gap-3 mb-6"><ShieldCheck className="text-emerald-500" size={24} /><h4 className="text-lg font-black text-charcoal-900 dark:text-white uppercase tracking-tight">Legal Assets</h4></div>
                    <div className="space-y-3">
                       {legalLinks.map((link) => (
                         <div key={link.path} className="flex items-center justify-between p-4 bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-100 dark:border-charcoal-800 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-3"><span className="text-slate-400">{link.icon}</span><span className="text-xs font-black text-charcoal-800 dark:text-slate-300 uppercase tracking-widest">{link.name}</span></div>
                            <button onClick={() => handleCopyLegal(link.path, link.name)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${copyStatus === link.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>{copyStatus === link.name ? <Check size={12} /> : <Copy size={12} />}{copyStatus === link.name ? 'Copied' : 'Copy'}</button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={handleUpdateProfile} disabled={loading} className="bg-charcoal-900 dark:bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-charcoal-950 transition-all active:scale-95 shadow-2xl flex items-center gap-3 text-lg uppercase tracking-tight">{loading ? 'Processing...' : <><Check size={24} /> Deploy Configuration</>}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-charcoal-900 dark:bg-charcoal-950 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border border-slate-800 transition-all duration-500 ${!isPro ? 'opacity-40 grayscale-[0.3] pointer-events-none' : ''}`}>
        {!isPro && <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[4px] pointer-events-auto"><button onClick={() => setShowUpgradeModal(true)} className="bg-white text-charcoal-900 px-10 py-5 rounded-[1.5rem] font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase">Subscribe to Unlock</button></div>}
        
        <div className="max-w-2xl mx-auto space-y-12 relative z-10 text-center">
          <div><h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">Sequence Generator</h2><p className="text-slate-400 font-bold text-lg">Deploy a professional feedback funnel for your customer</p></div>
          <div className="space-y-6">
            <div className="relative">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name..." className="w-full px-10 py-6 rounded-[2rem] text-slate-900 focus:ring-[12px] focus:ring-blue-500/10 outline-none text-3xl font-black transition-all shadow-inner text-center placeholder:text-slate-200" />
              {customerName && <div className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse"><Sparkles size={32} /></div>}
            </div>
            <button onClick={generateLink} disabled={loading || !customerName} className={`w-full py-6 rounded-[2rem] font-black text-3xl transition-all duration-500 transform flex items-center justify-center gap-4 active:scale-95 ${customerName ? 'bg-white text-charcoal-900 hover:bg-blue-50 hover:-translate-y-2' : 'bg-white/10 text-white/10 cursor-not-allowed'}`}>{loading ? <div className="animate-spin h-10 w-10 border-4 border-charcoal-900 border-t-transparent rounded-full" /> : <Share2 size={36} />}{loading ? 'Processing...' : 'Deploy Magic Link'}</button>
          </div>
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="relative"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200 }} className="bg-emerald-500 text-white p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]"><Check size={40} strokeWidth={4} /></motion.div>{[...Array(6)].map((_, i) => (<motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.5], x: Math.cos(i * 60 * Math.PI / 180) * 60, y: Math.sin(i * 60 * Math.PI / 180) * 60 }} transition={{ duration: 0.8, delay: 0.1 }} className="absolute top-1/2 left-1/2 text-amber-400"><Sparkles size={20} fill="currentColor" /></motion.div>))}</div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Sequence Deployed</motion.p>
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
          <div><h3 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight uppercase">Platform Feed</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time engagement telemetry</p></div>
          <button onClick={fetchRequests} className="p-4 text-slate-400 hover:text-blue-600 transition-all group"><RefreshCcw size={24} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} /></button>
        </div>
        <div className="overflow-x-auto p-8">
          {requests.length === 0 ? (
            <div className="py-24 text-center space-y-6"><div className="bg-slate-50 dark:bg-charcoal-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner"><Star size={40} className="text-slate-200" /></div><p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Telemetry stream awaiting data</p></div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead><tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest"><th className="px-8 py-5">Participant</th><th className="px-8 py-5">Engagement State</th><th className="px-8 py-5">Sentiment Analysis</th><th className="px-8 py-5 text-right">Timestamp</th></tr></thead>
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