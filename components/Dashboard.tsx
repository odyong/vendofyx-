import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { Profile, FeedbackRequest } from '../types';
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
  FileText,
  Lock,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ShieldCheck,
  CreditCard,
  Crown,
  Timer,
  ChevronRight,
  X,
  Zap,
  Activity
} from 'lucide-react';

interface Props {
  profile: Profile | null;
  onProfileUpdate: (id: string) => void;
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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  // Profile settings state
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');
  const [termsUrl, setTermsUrl] = useState(profile?.terms_url || '');
  const [privacyUrl, setPrivacyUrl] = useState(profile?.privacy_url || '');
  const [refundUrl, setRefundUrl] = useState(profile?.refund_url || '');

  const isDemo = !!localStorage.getItem('vendofyx_mock_user');
  const isPro = profile?.paddle_sub_status === 'active' || profile?.paddle_sub_status === 'active_annual';

  const mockRequests: FeedbackRequest[] = [
    { id: '1', user_id: profile?.id || 'demo', customer_name: 'Alice Johnson', status: 'rated', rating: 5, feedback_text: "Absolutely loved the service!", created_at: new Date().toISOString() },
    { id: '2', user_id: profile?.id || 'demo', customer_name: 'Bob Peterson', status: 'rated', rating: 2, feedback_text: 'Issues: Speed, Service. Server forgot my drink and it took 40 minutes for the check.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', user_id: profile?.id || 'demo', customer_name: 'Catherine Reed', status: 'clicked', rating: null, feedback_text: null, created_at: new Date(Date.now() - 7200000).toISOString() }
  ];

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
      setGoogleUrl(profile.google_review_url || '');
      setTermsUrl(profile.terms_url || '');
      setPrivacyUrl(profile.privacy_url || '');
      setRefundUrl(profile.refund_url || '');
      fetchRequests();
    }
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    
    if (isDemo) {
      if (requests.length === 0) setRequests(mockRequests as any);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      setRequests(data || []);
    } catch (e) { 
      console.warn("Could not fetch requests:", e);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    
    const updates = { 
      business_name: businessName, 
      google_review_url: googleUrl,
      terms_url: termsUrl,
      privacy_url: privacyUrl,
      refund_url: refundUrl
    };

    if (isDemo) {
      onProfileUpdate(profile.id);
      setEditingProfile(false);
    } else {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) {
        alert(error.message);
      } else {
        onProfileUpdate(profile.id);
        setEditingProfile(false);
      }
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    // Simulate payment gateway delay
    await new Promise(r => setTimeout(r, 2000));
    
    const status = selectedPlan === 'yearly' ? 'active_annual' : 'active';

    if (isDemo) {
      alert(`${selectedPlan === 'yearly' ? '$299 Pro Annual' : '$29 Pro Monthly'} plan activated in Sandbox Mode!`);
      setShowUpgradeModal(false);
      onProfileUpdate(profile?.id || 'demo');
    } else if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ paddle_sub_status: status })
        .eq('id', profile.id);
      
      if (!error) {
        alert("Welcome to Vendofyx Pro! Your professional tools are now unlocked.");
        setShowUpgradeModal(false);
        onProfileUpdate(profile.id);
      }
    }
    setUpgrading(false);
  };

  const triggerSuccessAnimation = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const generateLink = async () => {
    if (!customerName.trim() || !profile) return;
    
    if (!profile.google_review_url && !isDemo) {
      setShowConfigError(true);
      return;
    }

    // Force subscription
    if (!isPro && !isDemo) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setShowSuccess(false);
    setCopied(false);
    
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1200));
        const mockId = 'demo-' + Math.random().toString(36).substr(2, 9);
        const url = `${window.location.origin}${window.location.pathname}#/rate/${mockId}`;
        setNewLink(url);
        setRequests([{ 
          id: mockId, 
          user_id: profile.id, 
          customer_name: customerName, 
          status: 'pending', 
          rating: null, 
          feedback_text: null, 
          created_at: new Date().toISOString() 
        }, ...requests]);
        setCustomerName('');
        triggerSuccessAnimation();
      } else {
        const { data, error } = await supabase
          .from('feedback_requests')
          .insert({ user_id: profile.id, customer_name: customerName, status: 'pending' })
          .select()
          .single();
        
        if (error) throw error;
        
        const url = `${window.location.origin}${window.location.pathname}#/rate/${data.id}`;
        setNewLink(url);
        setCustomerName('');
        await fetchRequests();
        triggerSuccessAnimation();
      }
    } catch (error: any) {
      alert(error.message || "Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const getSharingUrls = () => {
    if (!newLink) return { sms: '', whatsapp: '', facebook: '', twitter: '', linkedin: '' };
    const shareText = `Hi! Could you leave us a quick review for ${profile?.business_name}? ${newLink}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedLink = encodeURIComponent(newLink);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return {
      sms: `sms:${isIOS ? '&' : '?'}body=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`
    };
  };

  const copyAndToast = () => {
    if (!newLink) return;
    navigator.clipboard.writeText(newLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    copyAndToast();
    alert("Magic Link copied! Open Instagram and paste it in a Direct Message to your customer.");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-charcoal-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-charcoal-900 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-charcoal-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <div className="text-center mb-10">
              <div className="bg-blue-50 dark:bg-blue-950/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Crown size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-black text-charcoal-900 dark:text-white mb-2 tracking-tighter uppercase">Activate Pro Suite</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">Protect and scale your professional reputation instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => setSelectedPlan('monthly')}
                className={`p-6 rounded-[2rem] border-4 transition-all text-left relative group ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-charcoal-800 hover:border-slate-200'}`}
              >
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Billing</div>
                <div className="text-3xl font-black text-charcoal-900 dark:text-white">$29<span className="text-sm font-bold opacity-50">/mo</span></div>
                {selectedPlan === 'monthly' && <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1"><Check size={14} /></div>}
              </button>

              <button 
                onClick={() => setSelectedPlan('yearly')}
                className={`p-6 rounded-[2rem] border-4 transition-all text-left relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-charcoal-800 hover:border-slate-200'}`}
              >
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Saves $49/yr</div>
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Yearly Billing</div>
                <div className="text-3xl font-black text-charcoal-900 dark:text-white">$299<span className="text-sm font-bold opacity-50">/yr</span></div>
                {selectedPlan === 'yearly' && <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1"><Check size={14} /></div>}
              </button>
            </div>

            <div className="space-y-6">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  "Unlimited Links",
                  "Private Feed Inbox",
                  "Pro-Grade Analytics",
                  "7-Day Refund Policy",
                  "Wall of Love Access",
                  "Native SMS Sharing"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <CheckCircle2 size={16} className="text-blue-500" /> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-charcoal-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group shadow-xl"
              >
                {upgrading ? <RefreshCcw size={24} className="animate-spin" /> : <><Sparkles size={24} /> Get Full Access</>}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Checkout • Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config Error Modal */}
      {showConfigError && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center relative border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-charcoal-900 dark:text-white mb-3 tracking-tight">Configuration Needed</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              We need your Google Review URL to enable the smart funneling logic.
            </p>
            <button 
              onClick={() => { setShowConfigError(false); setEditingProfile(true); }} 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Settings size={20} /> Set URL Now
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white dark:bg-charcoal-900 p-4 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
             <Activity className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-charcoal-900 dark:text-white tracking-tighter transition-colors uppercase">Console</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isDemo ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`}></div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                {isDemo ? 'Sandbox Instance' : 'Live Cloud Connected'}
              </p>
            </div>
          </div>
          
          {/* Enhanced Subscription Status Badge */}
          <div className="flex items-center gap-2">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border ${
               profile?.paddle_sub_status === 'active_annual' 
                 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                 : isPro 
                   ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                   : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
             }`}>
               {isPro ? <><Crown size={12} /> {profile?.paddle_sub_status === 'active_annual' ? 'Pro Annual' : 'Pro Monthly'}</> : <><AlertCircle size={12} /> Payment Required</>}
             </div>
             {profile?.paddle_sub_status === 'active_annual' && (
                <div className="hidden md:flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded-md text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Best Value Tier</div>
             )}
          </div>
        </div>
        
        <div className="flex gap-3">
          {!isPro && (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-amber-500 text-white font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:bg-amber-600 hover:-translate-y-0.5"
            >
              <Zap size={18} className="fill-current" />
              Get Pro Access
            </button>
          )}
          <button 
            onClick={() => setEditingProfile(!editingProfile)} 
            className={`font-black px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${editingProfile ? 'bg-charcoal-900 dark:bg-blue-600 text-white shadow-xl' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 hover:text-charcoal-900'}`}
          >
            <Settings size={18} /> {editingProfile ? 'Hide Config' : 'Configuration'}
          </button>
        </div>
      </div>

      {editingProfile && (
        <div className="bg-white dark:bg-charcoal-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 animate-in slide-in-from-top-6 duration-300 transition-colors">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-charcoal-800 pb-6">
            <h2 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
              <DatabaseIcon className="text-blue-600" size={24} /> 
              Deployment Details
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Tier</p>
                <p className={`text-sm font-black transition-colors ${isPro ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                  {profile?.paddle_sub_status?.replace('_', ' ') || 'Inactive'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isPro ? 'bg-blue-50 dark:bg-blue-950' : 'bg-red-50 dark:bg-red-950'}`}>
                {isPro ? <ShieldCheck className="text-blue-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Star size={14} className="text-amber-500" /> Professional Identity
                </label>
                <input 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full px-6 py-4 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-charcoal-900 dark:text-white" 
                  placeholder="e.g. The Coffee Nook"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Send size={14} className="text-blue-500" /> Redirect Destination (Google)
                </label>
                <input 
                  value={googleUrl} 
                  onChange={(e) => setGoogleUrl(e.target.value)} 
                  className={`w-full px-6 py-4 border-2 rounded-2xl outline-none transition-all font-bold ${!googleUrl ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10' : 'border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 focus:border-blue-500 dark:focus:border-blue-500'} text-charcoal-900 dark:text-white`} 
                  placeholder="https://g.page/r/your-id/review" 
                />
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 bg-slate-50 dark:bg-charcoal-950/40 rounded-[2.5rem] border border-slate-100 dark:border-charcoal-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                     <CreditCard size={100} className="rotate-12" />
                  </div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Summary</p>
                      <h4 className="text-2xl font-black text-charcoal-900 dark:text-white">
                        {isPro ? (profile?.paddle_sub_status === 'active_annual' ? 'Pro Yearly' : 'Pro Monthly') : 'No Active Subscription'}
                      </h4>
                    </div>
                    <div className={`p-3 rounded-2xl ${isPro ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'} shadow-lg`}>
                       {isPro ? <Crown size={24} /> : <AlertCircle size={24} />}
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {isPro 
                        ? 'Full-suite access unlocked. Your reputation funnel is active and routing feedback in real-time.' 
                        : 'Generate magic links and capture insights by activating your professional plan today.'}
                    </p>
                    
                    {isPro ? (
                       <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest mt-4">
                          <CheckCircle2 size={16} /> Subscription Active & Protected
                       </div>
                    ) : (
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full py-4 bg-charcoal-900 dark:bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl"
                      >
                        <Zap size={14} className="fill-current" /> Activate Pro Tools
                      </button>
                    )}
                  </div>
               </div>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end">
            <button 
              onClick={handleUpdateProfile} 
              disabled={loading} 
              className="bg-charcoal-900 dark:bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-charcoal-950 dark:hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl flex items-center gap-3 text-lg uppercase tracking-tight"
            >
              {loading ? 'Processing...' : <><Check size={24} /> Deploy Configuration</>}
            </button>
          </div>
        </div>
      )}

      {/* Persistent Paywall Banner */}
      {!isPro && !isDemo && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
             <Crown size={180} />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md">
              <Sparkles size={40} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-1">Scale Your Reputation</h3>
              <p className="text-blue-50 font-medium text-lg">Activate Pro to generate links and catch negative reviews privately.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="whitespace-nowrap bg-white text-blue-600 px-10 py-5 rounded-[1.5rem] font-black text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all active:scale-95 flex items-center gap-3 relative z-10 shadow-lg"
          >
            <Crown size={24} />
            Subscribe Now
          </button>
        </div>
      )}

      {/* Main Link Generator Tool */}
      <div className={`bg-charcoal-900 dark:bg-charcoal-950 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800 transition-all duration-500 ${!isPro && !isDemo ? 'opacity-40 grayscale-[0.3] pointer-events-none' : ''}`}>
        {!isPro && !isDemo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[4px] pointer-events-auto">
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-charcoal-900 px-10 py-5 rounded-[1.5rem] font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all uppercase tracking-tight"
            >
              Subscribe to Unlock Generator
            </button>
          </div>
        )}

        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Star size={300} className="animate-spin-slow fill-white" />
        </div>
        
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-lg animate-in fade-in duration-500"></div>
            <div className="relative flex items-center justify-center">
              {[...Array(16)].map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const dist = 200;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                return (
                  <div 
                    key={i} 
                    className="absolute animate-star-burst pointer-events-none"
                    style={{ '--tw-translate-x': `${x}px`, '--tw-translate-y': `${y}px` } as any}
                  >
                    {i % 2 === 0 ? <Star className="text-blue-300 fill-blue-300" size={20} /> : <div className="w-4 h-4 bg-white rounded-full"></div>}
                  </div>
                );
              })}
              <div className="relative bg-white text-charcoal-900 px-16 py-10 rounded-[3rem] font-black text-3xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-in zoom-in slide-in-from-bottom-12 duration-700 flex flex-col items-center gap-6">
                <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 animate-bounce">
                  <CheckCircle2 size={60} />
                </div>
                <span className="tracking-tighter uppercase">Magic Sequence Active!</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-12 relative z-10 text-center">
          <div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter leading-tight uppercase">Sequence Generator</h2>
            <p className="text-slate-400 font-bold text-lg tracking-tight">Deploy a professional feedback funnel for your customer</p>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <input 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Customer Full Name..." 
                className="w-full px-10 py-6 rounded-[2rem] text-slate-900 focus:ring-[12px] focus:ring-blue-500/10 outline-none text-3xl font-black transition-all shadow-inner text-center placeholder:text-slate-200 dark:placeholder:text-charcoal-800" 
              />
              {customerName && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse">
                  <Sparkles size={32} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <button 
                onClick={generateLink} 
                disabled={loading || !customerName} 
                className={`w-full py-6 rounded-[2rem] font-black text-3xl transition-all duration-500 transform flex items-center justify-center gap-4 active:scale-95 ${customerName ? 'bg-white text-charcoal-900 hover:bg-blue-50 hover:text-blue-700 hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] hover:-translate-y-2' : 'bg-white/10 text-white/10 cursor-not-allowed'}`}
              >
                {loading ? <div className="animate-spin h-10 w-10 border-4 border-charcoal-900 border-t-transparent rounded-full" /> : <Share2 size={36} />}
                {loading ? 'Scaling Platform...' : 'Deploy Magic Link'}
              </button>

              {loading && (
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden animate-in fade-in duration-300">
                  <div className="h-full bg-blue-500 animate-progress-bar rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
                </div>
              )}
            </div>
          </div>

          {newLink && !showSuccess && (
            <div className="bg-charcoal-950/60 p-10 rounded-[3rem] border border-charcoal-800 animate-in fade-in slide-in-from-bottom-6 shadow-2xl space-y-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 group/link">
                  <input readOnly value={newLink} className="flex-1 bg-charcoal-950 border-2 border-charcoal-700 rounded-2xl px-6 py-5 text-sm text-blue-300 font-bold shadow-inner" />
                  <button onClick={copyAndToast} className={`p-5 rounded-2xl transition-all active:scale-90 shadow-lg ${copied ? 'bg-emerald-600' : 'bg-charcoal-800 hover:bg-blue-600'} text-white`}>
                    {copied ? <Check size={28} /> : <Clipboard size={28} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <a href={getSharingUrls().sms} className="flex flex-col items-center justify-center gap-3 bg-white text-charcoal-900 py-8 rounded-[2.5rem] font-black hover:bg-blue-50 transition-all transform hover:-translate-y-2 shadow-2xl">
                    <MessageSquare size={44} className="text-blue-600" />
                    <span className="text-lg">Send via SMS</span>
                  </a>
                  <a href={getSharingUrls().whatsapp} target="_blank" className="flex flex-col items-center justify-center gap-3 bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black hover:bg-emerald-500 transition-all transform hover:-translate-y-2 shadow-2xl">
                    <Send size={44} />
                    <span className="text-lg">WhatsApp</span>
                  </a>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Multi-Channel Outreach</p>
                  <div className="grid grid-cols-4 gap-4">
                    <a href={getSharingUrls().facebook} target="_blank" className="bg-[#1877F2] text-white p-5 rounded-2xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all shadow-xl"><Facebook size={28} /></a>
                    <a href={getSharingUrls().twitter} target="_blank" className="bg-black dark:bg-charcoal-800 text-white p-5 rounded-2xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all shadow-xl"><Twitter size={28} /></a>
                    <a href={getSharingUrls().linkedin} target="_blank" className="bg-[#0077B5] text-white p-5 rounded-2xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all shadow-xl"><Linkedin size={28} /></a>
                    <button onClick={handleInstagramShare} className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white p-5 rounded-2xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all shadow-xl"><Instagram size={28} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Private Inbox Section */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors">
        <div className="px-12 py-10 border-b border-slate-50 dark:border-charcoal-800 flex justify-between items-center bg-slate-50/40 dark:bg-charcoal-950/30">
          <div>
            <h3 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight uppercase">Professional Feed</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Real-time engagement telemetry</p>
          </div>
          <button onClick={fetchRequests} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-charcoal-800 rounded-2xl transition-all active:scale-90 group">
            <RefreshCcw size={24} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
        <div className="overflow-x-auto p-8">
          {requests.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <div className="bg-slate-50 dark:bg-charcoal-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Star size={40} className="text-slate-200 dark:text-charcoal-700" />
              </div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Telemetry stream awaiting data</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Participant</th>
                  <th className="px-8 py-5">Engagement State</th>
                  <th className="px-8 py-5">Sentiment Analysis</th>
                  <th className="px-8 py-5">Telemetry Insight</th>
                  <th className="px-8 py-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="bg-slate-50/50 dark:bg-charcoal-950/30 hover:bg-slate-50 dark:hover:bg-charcoal-950/50 transition-all group">
                    <td className="px-8 py-8 border-y border-l border-slate-50 dark:border-charcoal-800 rounded-l-[2rem] font-black text-charcoal-900 dark:text-white text-lg">{req.customer_name}</td>
                    <td className="px-8 py-8 border-y border-slate-50 dark:border-charcoal-800">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        req.status === 'rated' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 
                        req.status === 'clicked' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                        'bg-slate-50 dark:bg-charcoal-800 text-slate-400 dark:text-slate-500'
                      }`}>{req.status}</span>
                    </td>
                    <td className="px-8 py-8 border-y border-slate-50 dark:border-charcoal-800">
                      {req.rating ? <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < req.rating! ? 'fill-amber-400 drop-shadow-sm' : 'text-slate-100 dark:text-charcoal-800'} />)}
                      </div> : <span className="text-slate-200 dark:text-charcoal-800">—</span>}
                    </td>
                    <td className="px-8 py-8 border-y border-slate-50 dark:border-charcoal-800 text-sm italic text-slate-500 dark:text-slate-400 max-w-xs transition-colors">
                      {req.rating && req.rating <= 3 ? (req.feedback_text || 'Negative sentiment captured') : (req.rating ? 'Funneled to Public Network' : 'Awaiting participant input')}
                    </td>
                    <td className="px-8 py-8 border-y border-r border-slate-50 dark:border-charcoal-800 rounded-r-[2rem] text-right text-[10px] font-black text-slate-400 dark:text-slate-600">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
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