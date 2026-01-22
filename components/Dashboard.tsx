import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase.ts';
import { Profile, FeedbackRequest } from '../types.ts';
import { 
  MessageSquare, 
  Star, 
  Check, 
  Settings, 
  RefreshCcw,
  CreditCard,
  Crown,
  X,
  Activity,
  Copy,
  Shield,
  Send
} from 'lucide-react';

const Dashboard: React.FC<{ profile: Profile | null; onProfileUpdate: (id: string) => void; }> = ({ profile, onProfileUpdate }) => {
  const [customerName, setCustomerName] = useState('');
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');

  const isPro = profile?.paddle_sub_status === 'active' || profile?.paddle_sub_status === 'active_annual';

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
              <button onClick={() => setShowUpgradeModal(false)} className="interactive-element absolute top-8 right-8 p-3 rounded-full border-transparent text-slate-400 transition-colors">
                <X size={24} />
              </button>
              <div className="text-center mb-10">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Crown size={40} className="text-indigo-600" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Activate Professional Suite</h3>
                <p className="text-slate-500 font-bold mt-2">Scale your trust and capture negative feedback privately.</p>
              </div>
              <button className="interactive-element w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl border-transparent shadow-xl shadow-indigo-500/30">
                Upgrade Now
              </button>
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
            <h1 className="text-4xl font-black uppercase tracking-tighter">Business Portal</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reputation Dashboard</p>
          </div>
        </div>
        <button onClick={() => setEditingProfile(!editingProfile)} className={`interactive-element px-6 py-3 rounded-2xl font-black flex items-center gap-2 ${editingProfile ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400'} border-transparent shadow-sm`}><Settings size={18} /> Settings</button>
      </div>

      <AnimatePresence>
        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 space-y-8 shadow-xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Business Name" className="interactive-element w-full px-6 py-4 rounded-2xl border-slate-100 bg-slate-50 outline-none font-bold" />
                <input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} placeholder="Google Review URL" className="interactive-element w-full px-6 py-4 rounded-2xl border-slate-100 bg-slate-50 outline-none font-bold" />
              </div>
              <button onClick={handleUpdateProfile} className="interactive-element bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase border-transparent">Save Settings</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`bg-charcoal-900 dark:bg-charcoal-950 rounded-[3.5rem] p-10 md:p-16 text-white border-2 border-slate-800 shadow-2xl relative ${!isPro ? 'opacity-40 grayscale-[0.3]' : ''}`}>
        {!isPro && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <button onClick={() => setShowUpgradeModal(true)} className="interactive-element bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black uppercase border-transparent text-xl shadow-2xl">Subscribe to Activate</button>
          </div>
        )}
        <div className="max-w-2xl mx-auto space-y-12 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter">New Review Link</h2>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter Customer Name..." className="interactive-element w-full px-10 py-6 rounded-[2rem] text-slate-900 text-3xl font-black border-slate-200 outline-none focus:ring-8 focus:ring-indigo-500/20 text-center" />
          <button onClick={generateLink} className="interactive-element w-full py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-3xl border-transparent">Generate Link</button>
          
          <AnimatePresence>
            {newLink && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-charcoal-800/50 rounded-[2.5rem] border-2 border-slate-700 space-y-8">
                <div className="flex items-center gap-4 bg-charcoal-950 p-4 rounded-2xl border border-slate-800 overflow-hidden">
                  <span className="text-sm font-bold text-indigo-400 truncate flex-1 text-left">{newLink}</span>
                  <button onClick={copyAndToast} className={`interactive-element p-4 rounded-xl border-transparent ${copied ? 'bg-emerald-600' : 'bg-white text-indigo-600'}`}>{copied ? <Check /> : <Copy />}</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <a href={`sms:?body=Hi! Leave us a quick review at ${newLink}`} className="interactive-element flex flex-col items-center justify-center gap-3 bg-white text-charcoal-900 py-8 rounded-[2rem] font-black border-transparent"><MessageSquare size={32} /> SMS</a>
                  <a href={`https://wa.me/?text=Hi! Leave us a quick review at ${newLink}`} target="_blank" className="interactive-element flex flex-col items-center justify-center gap-3 bg-emerald-600 text-white py-8 rounded-[2rem] font-black border-transparent"><Send size={32} /> WhatsApp</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-charcoal-800 flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase tracking-tight">Recent Activity</h3>
          <button onClick={fetchRequests} className="interactive-element p-3 text-slate-400 border-transparent rounded-xl"><RefreshCcw size={24} /></button>
        </div>
        <div className="p-8">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead><tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest"><th className="px-8 py-2">Customer</th><th className="px-8 py-2">Status</th><th className="px-8 py-2">Rating</th><th className="px-8 py-2 text-right">Date</th></tr></thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="bg-slate-50/50 dark:bg-charcoal-950/30 group transition-all duration-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.3)] cursor-default">
                  <td className="px-8 py-8 rounded-l-[2rem] font-black text-charcoal-900 dark:text-white text-lg transition-colors group-hover:text-violet-600">{req.customer_name}</td>
                  <td className="px-8 py-8"><span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'rated' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{req.status}</span></td>
                  <td className="px-8 py-8">{req.rating ? <Star className="fill-amber-400 text-amber-400" size={16} /> : '-'}</td>
                  <td className="px-8 py-8 rounded-r-[2rem] text-right text-[10px] font-black text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;