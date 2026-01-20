import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { FeedbackWithProfile } from '../types';
import { Star, MessageSquare, Send, CheckCircle2, ChevronLeft, AlertCircle, ShieldCheck, Timer, Utensils, User, HelpCircle, ExternalLink } from 'lucide-react';

const RatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<FeedbackWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const EXPIRATION_DAYS = 7;
  const SEVEN_DAYS_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

  const categories = [
    { label: 'Service', icon: <User size={14} /> },
    { label: 'Speed', icon: <Timer size={14} /> },
    { label: 'Quality', icon: <Utensils size={14} /> },
    { label: 'Value', icon: <Star size={14} /> },
    { label: 'Atmosphere', icon: <HelpCircle size={14} /> }
  ];

  useEffect(() => {
    const fetchRequest = async () => {
      if (id?.startsWith('demo-')) {
        setRequest({
          id,
          user_id: 'demo-user',
          customer_name: 'Demo Customer',
          status: 'pending',
          rating: null,
          feedback_text: null,
          created_at: new Date().toISOString(),
          profiles: {
            business_name: 'Vendofyx Demo Store',
            google_review_url: 'https://google.com'
          }
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('feedback_requests')
        .select(`*, profiles (business_name, google_review_url)`)
        .eq('id', id)
        .single();

      if (error) console.error(error);
      else setRequest(data as any);
      setLoading(false);

      if (data && data.status === 'pending') {
        await supabase.from('feedback_requests').update({ status: 'clicked' }).eq('id', id);
      }
    };
    fetchRequest();
  }, [id]);

  const isExpired = (req: FeedbackWithProfile) => {
    if (req.status === 'rated') return false;
    const createdDate = new Date(req.created_at).getTime();
    return (Date.now() - createdDate) > SEVEN_DAYS_MS;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRating = async (r: number) => {
    setRating(r);
    if (r === 5) {
      if (!id?.startsWith('demo-')) {
        await supabase.from('feedback_requests').update({ rating: r, status: 'rated' }).eq('id', id);
      }
    }
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    const finalFeedback = [
      selectedTags.length > 0 ? `Issues: ${selectedTags.join(', ')}` : '',
      feedbackText
    ].filter(Boolean).join('. ');

    if (!id?.startsWith('demo-')) {
      const { error } = await supabase.from('feedback_requests').update({
        rating,
        feedback_text: finalFeedback,
        status: 'rated'
      }).eq('id', id);

      if (error) {
        alert(error.message);
        setSubmitting(false);
        return;
      }
    }

    if (id?.startsWith('demo-')) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (rating === 5 && request?.profiles?.google_review_url) {
      window.location.href = request.profiles.google_review_url;
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const skipToGoogle = () => {
    if (request?.profiles?.google_review_url) {
      window.location.href = request.profiles.google_review_url;
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal-800 dark:border-blue-500"></div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Loading experience...</p>
      </div>
    </div>
  );

  if (!request) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 text-center max-w-xs transition-colors">
        <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
        <div className="text-red-600 dark:text-red-400 mb-2 font-black text-2xl tracking-tight">Invalid Link</div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">This feedback link does not exist or has expired.</p>
      </div>
    </div>
  );

  if (isExpired(request)) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[3rem] border border-amber-100 dark:border-amber-900/30 text-center max-w-sm shadow-xl animate-in zoom-in duration-300 transition-colors">
        <div className="bg-amber-100 dark:bg-amber-800/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Timer className="text-amber-600 dark:text-amber-400 w-10 h-10" />
        </div>
        <div className="text-amber-700 dark:text-amber-400 mb-3 font-black text-3xl tracking-tight">Link Expired</div>
        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          For security and accuracy, feedback links expire after {EXPIRATION_DAYS} days. Please contact <span className="font-bold text-slate-900 dark:text-white">{request.profiles.business_name}</span> for a fresh link.
        </p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="max-w-md mx-auto p-8 mt-12 text-center bg-white dark:bg-charcoal-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500 transition-colors">
      <div className="bg-green-100 dark:bg-green-900/20 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
        <CheckCircle2 className="text-green-600 dark:text-green-400 w-12 h-12" />
      </div>
      <h2 className="text-4xl font-black mb-4 text-charcoal-900 dark:text-white tracking-tight">Message Sent</h2>
      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
        Your private feedback has been delivered to the management at <span className="text-charcoal-900 dark:text-white font-bold">{request.profiles.business_name}</span>. Thank you for helping us grow.
      </p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 md:p-8 mt-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-charcoal-900 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] dark:shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden group transition-all duration-500">
        
        <div className={`p-10 text-white text-center relative overflow-hidden transition-colors duration-500 ${!rating ? 'bg-charcoal-900 dark:bg-charcoal-950' : rating === 5 ? 'bg-green-600' : 'bg-amber-600'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="animate-spin-slow w-20 h-20 fill-white" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-widest text-white/60 mb-2">Customer Care</h1>
          <h2 className="text-3xl font-black tracking-tight leading-none mb-2">{request.profiles.business_name}</h2>
          <div className="w-12 h-1.5 bg-white/20 mx-auto rounded-full"></div>
        </div>

        <div className="p-8 md:p-10">
          {!rating ? (
            <div className="text-center space-y-10">
              <div className="space-y-3">
                <p className="text-slate-900 dark:text-white font-black text-3xl tracking-tight">How did we do?</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Please rate your experience with us today.</p>
              </div>
              <div className="flex justify-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onMouseEnter={() => setHoverRating(r)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRating(r)}
                    className="transition-all duration-300 hover:scale-125 active:scale-90 transform"
                  >
                    <Star 
                      size={54} 
                      className={`
                        ${(hoverRating || rating) >= r ? 'text-amber-400 fill-amber-400 drop-shadow-[0_5px_15px_rgba(245,158,11,0.3)]' : 'text-slate-100 dark:text-charcoal-800'}
                        transition-all duration-300
                      `} 
                    />
                  </button>
                ))}
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-slate-300 dark:text-slate-600 font-black text-[10px] uppercase tracking-[0.2em]">
                <ShieldCheck size={14} /> 100% Private feedback
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <button 
                  onClick={() => setRating(0)} 
                  className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-black text-[10px] uppercase tracking-widest mb-4 transition-colors"
                >
                  <ChevronLeft size={12} /> Back to rating
                </button>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Star key={r} size={24} className={`${r <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100 dark:text-charcoal-800'}`} />
                  ))}
                </div>
              </div>

              {rating < 5 && (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">Help us fix this</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Your feedback goes directly to our management team for review.</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">What went wrong? (Optional)</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => toggleTag(cat.label)}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border-2 transition-all active:scale-95
                            ${selectedTags.includes(cat.label) 
                              ? 'bg-amber-600 border-amber-600 text-white shadow-lg scale-105' 
                              : 'border-slate-100 dark:border-charcoal-800 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}
                          `}
                        >
                          {cat.icon}
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute top-4 left-4 text-slate-300 dark:text-slate-700" size={18} />
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share more details about your experience..."
                      className="w-full h-32 pl-12 pr-6 py-4 rounded-3xl border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-charcoal-800 outline-none resize-none transition-all font-medium text-slate-900 dark:text-white text-sm shadow-inner"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-charcoal-950 p-4 rounded-2xl flex items-start gap-3 border border-slate-100 dark:border-charcoal-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      This form is 100% private. Only the management of {request.profiles.business_name} will receive your comments.
                    </p>
                  </div>

                  <button
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="w-full bg-charcoal-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-amber-600 dark:hover:bg-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-center gap-3 active:scale-95 group/btn shadow-lg"
                  >
                    {submitting ? <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" /> : (
                      <>
                        Send to Management
                        <Send size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {rating === 5 && (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-100 dark:border-green-900/30">
                      <Star size={14} className="fill-current" /> Amazing!
                    </div>
                    <h3 className="text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">One last favor?</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed px-4">
                      Would you mind giving us a 1-sentence shoutout before you head to Google? We'd love to share it on our wall of fame!
                    </p>
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute top-4 left-4 text-slate-300 dark:text-slate-700" size={18} />
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What did you love most about your visit?"
                      className="w-full h-28 pl-12 pr-6 py-4 rounded-3xl border-2 border-slate-50 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50 focus:border-green-500 dark:focus:border-green-500 focus:bg-white dark:focus:bg-charcoal-800 outline-none resize-none transition-all font-medium text-slate-900 dark:text-white text-sm shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={submitFeedback}
                      disabled={submitting}
                      className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform flex items-center justify-center gap-3 active:scale-95 group/btn shadow-lg"
                    >
                      {submitting ? <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" /> : (
                        <>
                          Post & Finish on Google
                          <ExternalLink size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={skipToGoogle}
                      className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest hover:text-charcoal-900 dark:hover:text-white transition-colors py-2"
                    >
                      Skip to Google directly
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center mt-12 space-y-3 opacity-20 dark:opacity-40 group-hover:opacity-40 transition-opacity">
        <Star className="fill-charcoal-800 dark:fill-white animate-spin-slow w-5 h-5" />
        <p className="text-center text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em]">
          Verified Experience via Vendofyx
        </p>
      </div>
    </div>
  );
};

export default RatePage;