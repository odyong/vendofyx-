import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase.ts';
import { Profile, FeedbackRequest } from '../types.ts';
import { 
  Send, 
  MessageSquare, 
  Share2, 
  Star, 
  Check, 
  Settings, 
  RefreshCcw,
  CreditCard,
  Crown,
  X,
  Activity,
  Zap,
  Copy,
  Shield,
  FileText
} from 'lucide-react';

const PADDLE_CLIENT_TOKEN = 'live_50dc092cb26ffc7be82d26603f7'; 
const PRICE_ID_MONTHLY = 'pri_01hks96z1z7vzrj00p0m0h1z1'; 
const PRICE_ID_ANNUAL = 'pri_01hks97r5z7vzrj00p0m0h2z2'; 

declare global { interface Window { Paddle: any; } }

interface Props { profile: Profile | null; onProfileUpdate: (id: string) => void; }

const Dashboard: React.FC<Props> = ({ profile, onProfileUpdate }) => {
  const [customerName, setCustomerName] = useState('');
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');

  const isPro = profile?.paddle_sub_status === 'active' || profile?.paddle_sub_status === 'active_annual';

  useEffect(() => {
    const initPaddle = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({ 
          token: PADDLE_CLIENT_TOKEN, 
          environment: 'production', 
          eventCallback: (event: any) => { 
            if (event.name === 'checkout.completed') {
              if (profile) onProfileUpdate(profile.id);
              setShowUpgradeModal(false);
              setUpgrading(false);
            }
            if (event.name === 'checkout.closed') {
              setUpgrading(false);
            }
          }
        });
      } else { setTimeout(initPaddle, 1500); }
    };
    initPaddle();
  }, [profile, onProfileUpdate]);

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
      const { data } = await supabase.from('feedback_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
      setRequests(data || []);
    } finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    await supabase.from('profiles').update({ business_name: businessName, google_review_url: googleUrl }).eq('id', profile.id);
    onProfileUpdate(profile.id);
    setEditingProfile(false);
    setLoading(false);
  };

  const handleUpgradeCheckout = async () => {
    if (!window.Paddle || !profile) return;
    setUpgrading(true);
    const priceId = selectedPlan === 'yearly' ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY;
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: profile.id },
      customData: { userId: profile.id },
      settings: { displayMode: 'overlay', theme: 'light', locale: 'en' }
    });
  };

  const generateLink = async () => {
    if (!customerName.trim() || !profile) return;
    if (!isPro) { setShowUpgradeModal(true); return; }
    setLoading(true);
    const { data, error } = await supabase.from('feedback_requests').insert({ user_id: profile.id, customer_name: customerName, status: 'pending' }).select().single();
    if (!error && data) {
      setNewLink(`${window.location.origin}/rate/${data.id}`);
      setCustomerName(''); 
      fetchRequests(); 
    }
    setLoading(false);
  };

  const copyAndToast = () => {
    if (!newLink) return;
    navigator.clipboard.writeText(newLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-charcoal-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-charcoal-900 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full border-2 border-slate-100 dark:border-slate-800 relative shadow-2xl">
              <button onClick={() => setShowUpgradeModal(false)} className="interactive-element absolute top-8 right-8 p-3 rounded-full border-transparent text-slate-400 hover:text-charcoal-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="text-center mb-10">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Crown size={40} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-charcoal-900 dark:text-white">Activate Pro Suite</h3>
                <p className="text-slate-500 font-bold mt-2">Scale your trust and capture negative feedback privately.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setSelectedPlan('monthly')} className={`interactive-element p-6 rounded-[2rem] text-left border-2 transition-all ${selectedPlan === 'monthly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 dark:border-charcoal-800'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly</p>
                  <p className="text-2xl font-black text-charcoal-900 dark:text-white">$29<span className="text-sm opacity-50">/mo</span></p>
                </button>
                <button onClick={() => setSelectedPlan('yearly')} className={`interactive-element p-6 rounded-[2rem] text-left border-2 transition-all relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 dark:border-charcoal-800'}`}>
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase">Saves $49</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Annual</p>
                  <p className="text-2xl font-black text-charcoal-900 dark:text-white">$299<span className="text-sm opacity-50">/yr</span></p>
                </button>
              </div>
              <button onClick={handleUpgradeCheckout} disabled={upgrading} className="interactive-element w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl border-transparent flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30">
                {upgrading ? <RefreshCcw size={24} className="animate-spin" /> : <><CreditCard size={24} /> Upgrade Now</>}
              </button>
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6 flex items-center justify-center gap-2">
                <Shield size={14} className="text-indigo-500" /> Secure Checkout by Paddle
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-charcoal-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-lg">
            <Activity className="text-indigo-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-charcoal-900 dark:text-white">Business Portal</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reputation Dashboard</p>
          </div>
        </div>
        <button onClick={() => setEditingProfile(!editingProfile)} className={`interactive-element px-6 py-3 rounded-2xl font-black flex items-center gap-2 ${editingProfile ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400'} border-transparent shadow-sm`}><Settings size={18} /> {editingProfile ? 'Close Settings' : 'Business Settings'}</button>
      </div>

      <AnimatePresence>
        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 space-y-8 shadow-xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Business Name" className="interactive-element w-full px-6 py-4 rounded-2xl border-slate-100 dark:border-charcoal-800 bg-slate-50 dark:bg-charcoal-950 outline-none font-bold text-charcoal-900 dark:text-white" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Public Review Page</label>
                  <input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} placeholder="Google Review URL" className="interactive-element w-full px-6 py-4 rounded-2xl border-slate-100 dark:border-charcoal-800 bg-slate-50 dark:bg-charcoal-950 outline-none font-bold text-charcoal-900 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={handleUpdateProfile} disabled={loading} className="interactive-element bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase border-transparent shadow-lg flex items-center gap-3">
                  {loading ? <RefreshCcw size={20} className="animate-spin" /> : 'Save Settings'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-charcoal-900 dark:bg-charcoal-950 rounded-[3.5rem] p-10 md:p-16 text-white border-2 border-slate-800 shadow-2xl relative transition-all duration-500 ${!isPro ? 'opacity-40 grayscale-[0.3]' : ''}`}>
        {!isPro && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <button onClick={() => setShowUpgradeModal(true)} className="interactive-element bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black uppercase border-transparent text-xl shadow-2xl">Subscribe to Activate</button>
          </div>
        )}
        <div className="max-w-2xl mx-auto space-y-12 text-center relative z-10">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter">Send Review Request</h2>
            <p className="text-slate-400 font-bold mt-2">Generate a unique magic link for your customer</p>
          </div>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter Customer Name..." className="interactive-element w-full px-10 py-6 rounded-[2rem] text-slate-900 text-3xl font-black border-slate-200 outline-none focus:ring-8 focus:ring-indigo-500/20 transition-all text-center" />
          <button onClick={generateLink} disabled={loading || !customerName} className="interactive-element w-full py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-3xl border-transparent shadow-xl active:scale-95 disabled:opacity-50">
            {loading ? <RefreshCcw className="animate-spin mx-auto" /> : 'Generate Link'}
          </button>
          
          <AnimatePresence>
            {newLink && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-charcoal-800/50 rounded-[2.5rem] border-2 border-slate-700 space-y-8">
                <div className="flex items-center gap-4 bg-charcoal-950 p-4 rounded-2xl border border-slate-800 overflow-hidden">
                  <span className="text-sm font-bold text-indigo-400 truncate flex-1 text-left">{newLink}</span>
                  <button onClick={copyAndToast} className={`interactive-element p-4 rounded-xl border-transparent transition-all ${copied ? 'bg-emerald-600' : 'bg-white text-indigo-600'}`}>
                    {copied ? <Check size={24} /> : <Copy size={24} />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <a href={`sms:?body=Hi! Could you leave a quick review for ${businessName}? ${newLink}`} className="interactive-element flex flex-col items-center justify-center gap-3 bg-white text-charcoal-900 py-8 rounded-[2rem] font-black border-transparent hover:bg-indigo-50">
                    <MessageSquare size={32} className="text-indigo-600" />
                    <span className="uppercase text-xs tracking-widest">Send SMS</span>
                  </a>
                  <a href={`https://wa.me/?text=Hi! Could you leave a quick review for ${businessName}? ${newLink}`} target="_blank" className="interactive-element flex flex-col items-center justify-center gap-3 bg-emerald-600 text-white py-8 rounded-[2rem] font-black border-transparent">
                    <Send size={32} />
                    <span className="uppercase text-xs tracking-widest">WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-charcoal-800 flex justify-between items-center bg-slate-50/50 dark:bg-charcoal-950/20">
          <h3 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 dark:text-white">Recent Activity</h3>
          <button onClick={fetchRequests} className="interactive-element p-3 text-slate-400 hover:text-indigo-600 border-transparent rounded-xl"><RefreshCcw size={24} className={loading ? 'animate-spin' : ''} /></button>
        </div>
        <div className="p-8 overflow-x-auto">
          {requests.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No activity to show</div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead><tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest"><th className="px-8 py-2">Customer</th><th className="px-8 py-2">Status</th><th className="px-8 py-2">Result</th><th className="px-8 py-2 text-right">Date</th></tr></thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="bg-slate-50/50 dark:bg-charcoal-950/30 group transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:-translate-y-1 hover:shadow-lg cursor-default">
                    <td className="px-8 py-8 rounded-l-[2rem] font-black text-charcoal-900 dark:text-white text-lg transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{req.customer_name}</td>
                    <td className="px-8 py-8"><span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'rated' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{req.status}</span></td>
                    <td className="px-8 py-8">
                      {req.rating ? (
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(req.rating)].map((_, i) => <Star key={i} size={16} className="fill-amber-400" />)}
                        </div>
                      ) : <span className="opacity-20 uppercase font-black text-[10px] text-charcoal-900 dark:text-white">Pending</span>}
                    </td>
                    <td className="px-8 py-8 rounded-r-[2rem] text-right text-[10px] font-black text-slate-400 tracking-tighter">{new Date(req.created_at).toLocaleDateString()}</td>
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