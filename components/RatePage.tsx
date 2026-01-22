import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase.ts';
import { FeedbackWithProfile } from '../types.ts';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const RatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<FeedbackWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      const { data } = await supabase.from('feedback_requests').select(`*, profiles (business_name, google_review_url)`).eq('id', id).single();
      if (data) setRequest(data as any);
      setLoading(false);
    };
    fetchRequest();
  }, [id]);

  const submitFeedback = async () => {
    if (id) {
      await supabase.from('feedback_requests').update({ rating, feedback_text: feedbackText, status: 'rated' }).eq('id', id);
      if (rating === 5 && request?.profiles?.google_review_url) {
        window.location.href = request.profiles.google_review_url;
      } else {
        setSubmitted(true);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Star className="animate-spin text-blue-600" size={64} /></div>;

  if (submitted) return (
    <div className="max-w-md mx-auto p-12 mt-12 text-center bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100">
      <CheckCircle2 className="text-emerald-500 w-24 h-24 mx-auto mb-8" />
      <h2 className="text-4xl font-black mb-4 uppercase">Thank You</h2>
      <p className="text-slate-500 font-medium">Your feedback has been delivered privately to management.</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 mt-12">
      <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
        <div className="p-10 bg-charcoal-900 text-white text-center">
          <h2 className="text-3xl font-black uppercase">{request?.profiles?.business_name}</h2>
          <p className="opacity-60 text-xs font-bold uppercase tracking-widest mt-2">Private Feedback</p>
        </div>
        <div className="p-10 space-y-10">
          {!rating ? (
            <div className="text-center space-y-8">
              <h3 className="text-2xl font-black uppercase">How was your visit?</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRating(r)} onMouseEnter={() => setHoverRating(r)} onMouseLeave={() => setHoverRating(0)} className="interactive-element p-2 rounded-xl border-transparent">
                    <Star size={48} className={`${(hoverRating || rating) >= r ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Tell us more (private)" className="interactive-element w-full h-32 p-6 rounded-2xl border-slate-100 bg-slate-50 outline-none font-medium text-sm" />
              <button onClick={submitFeedback} className="interactive-element w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl border-transparent flex items-center justify-center gap-2">Send Feedback <Send size={20} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatePage;