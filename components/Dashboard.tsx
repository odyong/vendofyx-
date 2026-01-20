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
  Instagram
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
  
  // Profile settings state
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');
  const [termsUrl, setTermsUrl] = useState(profile?.terms_url || '');
  const [privacyUrl, setPrivacyUrl] = useState(profile?.privacy_url || '');
  const [refundUrl, setRefundUrl] = useState(profile?.refund_url || '');

  const isDemo = !!localStorage.getItem('vendofyx_mock_user');

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
      {/* Config Error Modal */}
      {showConfigError && (
        <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center relative border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-charcoal-900 dark:text-white mb-3 tracking-tight">Setup Required</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              We need your Google Review link to know where to send your happy customers.
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-charcoal-900 dark:text-white tracking-tight transition-colors">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-2 h-2 rounded-full ${isDemo ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`}></div>
             <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
               {isDemo ? 'Demo Mode' : 'Live Database Connected'}
             </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setEditingProfile(!editingProfile)} 
            className={`font-black px-6 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${editingProfile ? 'bg-charcoal-900 dark:bg-blue-600 text-white shadow-lg' : 'bg-blue-50 dark:bg-charcoal-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100'}`}
          >
            <Settings size={18} /> {editingProfile ? 'Close Settings' : 'Settings'}
          </button>
        </div>
      </div>

      {editingProfile && (
        <div className="bg-white dark:bg-charcoal-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4 duration-300 transition-colors">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-charcoal-800 pb-4">
            <h2 className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
              <DatabaseIcon className="text-blue-600" size={20} /> 
              Business Configuration
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Star size={12} className="text-blue-500" /> Business Name
                </label>
                <input 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full px-5 py-3 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-charcoal-900 dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Send size={12} className="text-green-500" /> Google Review URL
                </label>
                <input 
                  value={googleUrl} 
                  onChange={(e) => setGoogleUrl(e.target.value)} 
                  className={`w-full px-5 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${!googleUrl ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10' : 'border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 focus:border-blue-500 dark:focus:border-blue-500'} text-charcoal-900 dark:text-white`} 
                  placeholder="https://g.page/r/your-id/review" 
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileText size={12} className="text-indigo-500" /> Terms of service
                </label>
                <input 
                  value={termsUrl} 
                  onChange={(e) => setTermsUrl(e.target.value)} 
                  className="w-full px-5 py-3 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-charcoal-900 dark:text-white" 
                  placeholder="https://website.com/terms-and-conditions"
                />
                <p className="text-[10px] text-slate-400 font-bold px-1 italic">URL must include a path, e.g. website.com/terms-and-conditions</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-purple-500" /> Privacy policy
                </label>
                <input 
                  value={privacyUrl} 
                  onChange={(e) => setPrivacyUrl(e.target.value)} 
                  className="w-full px-5 py-3 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-charcoal-900 dark:text-white" 
                  placeholder="Leave this blank if it's included in your Terms of service"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <RotateCcw size={12} className="text-rose-500" /> Refund policy
                </label>
                <input 
                  value={refundUrl} 
                  onChange={(e) => setRefundUrl(e.target.value)} 
                  className="w-full px-5 py-3 border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-bold text-charcoal-900 dark:text-white" 
                  placeholder="Leave this blank if it's included in your Terms of service"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleUpdateProfile} 
              disabled={loading} 
              className="bg-charcoal-900 dark:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-charcoal-950 dark:hover:bg-blue-500 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl flex items-center gap-2"
            >
              {loading ? 'Saving Changes...' : <><Check size={20} /> Save Configuration</>}
            </button>
          </div>
        </div>
      )}

      <div className="bg-charcoal-900 dark:bg-charcoal-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800 transition-colors">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Star size={240} className="animate-spin-slow fill-white" />
        </div>
        
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-md animate-in fade-in duration-300"></div>
            <div className="relative flex items-center justify-center">
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const dist = 160;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                return (
                  <div 
                    key={i} 
                    className="absolute animate-star-burst pointer-events-none"
                    style={{ '--tw-translate-x': `${x}px`, '--tw-translate-y': `${y}px` } as any}
                  >
                    {i % 2 === 0 ? <Star className="text-blue-400 fill-blue-400" size={16} /> : <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                );
              })}
              <div className="relative bg-white text-charcoal-900 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col items-center gap-3">
                <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <span className="tracking-tighter">Magic Link Ready!</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-xl mx-auto space-y-8 relative z-10 text-center">
          <div>
            <h2 className="text-4xl font-black mb-3 tracking-tight leading-tight">Generate magic link</h2>
            <p className="text-slate-400 font-bold tracking-tight">Captured negative reviews will appear in your private inbox below</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Customer Name..." 
                className="w-full px-8 py-5 rounded-3xl text-slate-900 focus:ring-8 focus:ring-blue-500/20 outline-none text-2xl font-black transition-all shadow-inner text-center placeholder:text-slate-200 dark:placeholder:text-charcoal-800" 
              />
              {customerName && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse">
                  <Sparkles size={24} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button 
                onClick={generateLink} 
                disabled={loading || !customerName} 
                className={`w-full py-5 rounded-3xl font-black text-2xl transition-all duration-300 transform flex items-center justify-center gap-3 active:scale-95 ${customerName ? 'bg-white text-charcoal-900 hover:bg-blue-50 hover:text-blue-700 hover:shadow-2xl hover:-translate-y-1' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
              >
                {loading ? <div className="animate-spin h-8 w-8 border-4 border-charcoal-900 border-t-transparent rounded-full" /> : <Share2 size={28} />}
                {loading ? 'Creating Magic...' : 'Generate Link'}
              </button>

              {/* Animated Progress Bar during Link Generation */}
              {loading && (
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden animate-in fade-in duration-300">
                  <div className="h-full bg-blue-500 animate-progress-bar rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                </div>
              )}
            </div>
          </div>

          {newLink && !showSuccess && (
            <div className="bg-charcoal-950/60 p-8 rounded-[2rem] border border-charcoal-800 animate-in fade-in slide-in-from-bottom-4 shadow-2xl space-y-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 group/link">
                  <input readOnly value={newLink} className="flex-1 bg-charcoal-950 border border-charcoal-700 rounded-2xl px-5 py-4 text-sm text-blue-200 font-bold" />
                  <button onClick={copyAndToast} className={`p-4 rounded-2xl transition-all active:scale-90 ${copied ? 'bg-green-600' : 'bg-charcoal-800 hover:bg-blue-600'} text-white`}>
                    {copied ? <Check size={24} /> : <Clipboard size={24} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <a href={getSharingUrls().sms} className="flex flex-col items-center justify-center gap-2 bg-white text-charcoal-900 py-6 rounded-3xl font-black hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-xl">
                    <MessageSquare size={36} className="text-blue-600" />
                    <span>Text SMS</span>
                  </a>
                  <a href={getSharingUrls().whatsapp} target="_blank" className="flex flex-col items-center justify-center gap-2 bg-green-600 text-white py-6 rounded-3xl font-black hover:bg-green-500 transition-all transform hover:-translate-y-1 shadow-xl">
                    <Send size={36} />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Direct Social Outreach</p>
                  <div className="grid grid-cols-4 gap-3">
                    <a 
                      href={getSharingUrls().facebook} 
                      target="_blank" 
                      title="Share on Facebook"
                      className="bg-[#1877F2] text-white p-4 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg"
                    >
                      <Facebook size={24} />
                    </a>
                    <a 
                      href={getSharingUrls().twitter} 
                      target="_blank" 
                      title="Share on X (Twitter)"
                      className="bg-black dark:bg-charcoal-800 text-white p-4 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg"
                    >
                      <Twitter size={24} />
                    </a>
                    <a 
                      href={getSharingUrls().linkedin} 
                      target="_blank" 
                      title="Share on LinkedIn"
                      className="bg-[#0077B5] text-white p-4 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg"
                    >
                      <Linkedin size={24} />
                    </a>
                    <button 
                      onClick={handleInstagramShare} 
                      title="Copy for Instagram DM"
                      className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white p-4 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg"
                    >
                      <Instagram size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-colors">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-charcoal-800 flex justify-between items-center bg-slate-50/30 dark:bg-charcoal-950/20">
          <div>
            <h3 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">Private Feedback Inbox</h3>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Real-time customer responses</p>
          </div>
          <button onClick={fetchRequests} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-charcoal-800 rounded-2xl transition-all active:scale-90">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="overflow-x-auto p-6">
          {requests.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="bg-slate-50 dark:bg-charcoal-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Star size={32} className="text-slate-200 dark:text-charcoal-700" />
              </div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Your feedback will appear here</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="bg-slate-50/50 dark:bg-charcoal-950/30 hover:bg-slate-50 dark:hover:bg-charcoal-950/50 transition-colors group">
                    <td className="px-6 py-6 border-y border-l border-slate-50 dark:border-charcoal-800 rounded-l-3xl font-black text-charcoal-900 dark:text-white transition-colors">{req.customer_name}</td>
                    <td className="px-6 py-6 border-y border-slate-50 dark:border-charcoal-800 transition-colors">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        req.status === 'rated' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                        req.status === 'clicked' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        'bg-slate-50 dark:bg-charcoal-800 text-slate-400 dark:text-slate-500'
                      }`}>{req.status}</span>
                    </td>
                    <td className="px-6 py-6 border-y border-slate-50 dark:border-charcoal-800 transition-colors">
                      {req.rating ? <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < req.rating! ? 'fill-amber-400' : 'text-slate-100 dark:text-charcoal-800'} />)}
                      </div> : '—'}
                    </td>
                    <td className="px-6 py-6 border-y border-slate-50 dark:border-charcoal-800 text-xs italic text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs transition-colors">
                      {req.rating && req.rating <= 3 ? (req.feedback_text || 'No comment provided') : (req.rating ? '—' : 'No feedback yet')}
                    </td>
                    <td className="px-6 py-6 border-y border-r border-slate-50 dark:border-charcoal-800 rounded-r-3xl text-right text-[10px] font-black text-slate-400 dark:text-slate-600 transition-colors">
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