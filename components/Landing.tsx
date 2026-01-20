import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabase';
import { CheckCircle, Shield, TrendingUp, Star, Smartphone, MessageCircle, ArrowRight, Zap, Quote, ChevronLeft, ChevronRight, BadgeCheck, Zap as Lightning, Check, HelpCircle, Sparkles, Percent, ShieldCheck } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  business: string;
  initials: string;
  verified?: boolean;
}

const staticTestimonials: Testimonial[] = [
  {
    quote: "Vendofyx saved us from a 2-star disaster. We caught the complaint privately and fixed it immediately. Now our Google score is a perfect 4.9.",
    author: "Sarah Jenkins",
    business: "The Coffee Nook",
    initials: "SJ"
  },
  {
    quote: "Our Google rating went from 4.1 to 4.8 in three weeks. The interface is so simple, my staff actually uses it daily without being asked.",
    author: "Marcus Thorne",
    business: "Thorne Auto Group",
    initials: "MT"
  },
  {
    quote: "Clients love the simple 5-star interface. It's much easier than asking them to find us on Google manually. The SMS integration is seamless.",
    author: "Elena Rodriguez",
    business: "Luxe Health Spa",
    initials: "ER"
  }
];

const RatingEvolution: React.FC = () => {
  const [rating, setRating] = useState(1);
  const [decimalRating, setDecimalRating] = useState(1.2);

  useEffect(() => {
    const decimals = [1.2, 2.4, 3.1, 4.2, 5.0];
    const interval = setInterval(() => {
      setRating((prev) => {
        const next = prev >= 5 ? 1 : prev + 1;
        setDecimalRating(decimals[next - 1]);
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 mt-6 animate-in fade-in duration-1000">
      <div className="bg-white dark:bg-charcoal-900 px-8 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center gap-3 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-blue-500/10 hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center">
            <span className="text-[#4285F4] font-extrabold text-lg">G</span>
            <span className="text-[#EA4335] font-extrabold text-lg">o</span>
            <span className="text-[#FBBC05] font-extrabold text-lg">o</span>
            <span className="text-[#4285F4] font-extrabold text-lg">g</span>
            <span className="text-[#34A853] font-extrabold text-lg">l</span>
            <span className="text-[#EA4335] font-extrabold text-lg">e</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business profile</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={24} 
                className={`transition-all duration-700 ease-out ${s <= rating ? 'fill-amber-400 text-amber-400 rating-glow scale-110' : 'text-slate-100 dark:text-slate-800'} ${s === rating ? 'animate-pulse' : ''}`} 
              />
            ))}
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums w-12 text-center">
            {decimalRating.toFixed(1)}
          </span>
        </div>

        <div className="w-full bg-slate-50 dark:bg-charcoal-800 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
            style={{ width: `${(decimalRating / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 bg-slate-100 dark:bg-charcoal-800 px-3 py-1 rounded-full">
        <TrendingUp size={12} className="text-blue-500" />
        Live Reputation sequence
      </div>
    </div>
  );
};

const TestimonialCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(staticTestimonials);

  const fetchRealTestimonials = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('feedback_requests')
        .select(`
          feedback_text,
          customer_name,
          profiles ( business_name )
        `)
        .eq('rating', 5)
        .not('feedback_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const realOnes: Testimonial[] = data.map((d: any) => {
          const names = d.customer_name.split(' ');
          const maskedName = names.length > 1 
            ? `${names[0]} ${names[1].charAt(0)}.` 
            : names[0];

          return {
            quote: d.feedback_text,
            author: maskedName,
            business: d.profiles.business_name,
            initials: names[0].charAt(0),
            verified: true
          };
        });
        
        setTestimonials([...realOnes, ...staticTestimonials]);
      }
    } catch (e) {
      console.warn("Could not fetch real testimonials:", e);
    }
  };

  useEffect(() => {
    fetchRealTestimonials();
  }, []);

  const next = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, testimonials.length]);

  const prev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, testimonials.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      <div className="overflow-hidden rounded-[3rem] bg-white dark:bg-charcoal-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="relative h-[450px] md:h-[350px]">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`absolute inset-0 p-10 md:p-16 flex flex-col justify-center transition-all duration-500 ease-in-out ${
                i === activeIndex 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : i < activeIndex 
                    ? 'opacity-0 -translate-x-full scale-95' 
                    : 'opacity-0 translate-x-full scale-95'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} size={20} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {t.verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <BadgeCheck size={14} /> Verified Customer
                  </div>
                )}
              </div>
              <div className="relative mb-8">
                <Quote className="absolute -top-6 -left-4 text-blue-50 dark:text-blue-500/10 opacity-50" size={80} />
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic relative z-10 line-clamp-4 md:line-clamp-3">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="w-14 h-14 bg-charcoal-900 dark:bg-charcoal-800 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl bg-gradient-to-br from-charcoal-800 to-charcoal-950">
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-black text-charcoal-900 dark:text-white text-lg tracking-tight">{t.author}</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 flex items-center">
        <button 
          onClick={prev}
          className="p-4 bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 flex items-center">
        <button 
          onClick={next}
          className="p-4 bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex justify-center gap-3 mt-10">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === activeIndex ? 'w-12 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-charcoal-700 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const MagicJoinButton: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => {
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
      return;
    }
    if (isJoining) return;
    setIsJoining(true);
    
    setTimeout(() => {
      navigate('/auth?mode=signup');
    }, 1000);
  };

  const starColors = ['text-blue-400', 'text-amber-400', 'text-indigo-400', 'text-purple-400', 'text-emerald-400', 'text-rose-400'];

  return (
    <button
      onClick={handleJoin}
      className="group relative bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-2xl hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all transform active:scale-95 overflow-hidden w-full sm:w-auto"
    >
      <div className="relative z-20 flex items-center justify-center gap-3">
        {children}
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </div>

      {isJoining && (
        <>
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
            <Lightning size={120} className="text-white fill-white animate-thunder opacity-0" />
            <div className="absolute inset-0 bg-white/30 animate-pulse duration-75"></div>
          </div>

          {[...Array(16)].map((_, i) => {
            const rotation = (i / 16) * 360;
            const color = starColors[i % starColors.length];
            return (
              <Star 
                key={i} 
                size={Math.random() * 10 + 8} 
                className={`absolute left-1/2 top-1/2 fill-current ${color} animate-star-orbit-magic pointer-events-none`}
                style={{ 
                  '--rotation': `${rotation}deg`
                } as any}
              />
            );
          })}

          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 mix-blend-screen animate-pulse z-0"></div>
        </>
      )}
    </button>
  );
};

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Transparent Pricing</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight mb-8">Simple, professional plans with a 7-day money-back guarantee.</p>
        
        {/* Billing Switcher */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <span className={`text-sm font-black transition-colors ${billingCycle === 'monthly' ? 'text-charcoal-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-20 h-10 bg-slate-200 dark:bg-charcoal-800 rounded-full p-1 relative transition-colors border border-slate-300 dark:border-slate-700"
          >
            <div className={`w-8 h-8 bg-blue-600 rounded-full transition-transform duration-300 shadow-xl ${billingCycle === 'yearly' ? 'translate-x-10' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black transition-colors ${billingCycle === 'yearly' ? 'text-charcoal-900 dark:text-white' : 'text-slate-400'}`}>Yearly</span>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
              Save $49 / year
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Monthly Plan */}
        <div className="p-10 md:p-14 bg-white dark:bg-charcoal-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex flex-col transition-all hover:border-blue-500/30">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">Pro Monthly</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-charcoal-900 dark:text-white tracking-tighter">$29</span>
              <span className="text-xl font-bold text-slate-400">/month</span>
            </div>
          </div>
          
          <div className="flex-grow space-y-6 mb-12">
             <div className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Core Features</div>
             <ul className="space-y-4">
               <li className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold"><Check size={20} className="text-blue-600" /> Unlimited Magic Links</li>
               <li className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold"><Check size={20} className="text-blue-600" /> Private Feedback Inbox</li>
               <li className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold"><Check size={20} className="text-blue-600" /> Basic Analytics Feed</li>
               <li className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold"><Check size={20} className="text-blue-600" /> 7-Day Refund Policy</li>
             </ul>
          </div>
          
          <Link to="/auth?mode=signup" className="block w-full text-center py-6 bg-slate-100 dark:bg-charcoal-800 text-slate-900 dark:text-white rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm">Start Scaling</Link>
        </div>

        {/* Yearly Plan - Featured */}
        <div className="p-10 md:p-14 bg-charcoal-900 dark:bg-blue-600 rounded-[4rem] shadow-2xl relative overflow-hidden group z-10 text-white flex flex-col border-4 border-white/20 transform scale-105">
          <div className="absolute top-0 right-0 p-10">
            <Sparkles className="text-white/20 animate-pulse" size={80} />
          </div>
          <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-8 py-3 rounded-br-[2rem] uppercase tracking-[0.3em] shadow-lg">Most Popular</div>
          
          <div className="mb-8">
            <h3 className="text-xl font-black text-white/60 uppercase tracking-widest mb-4">Pro Annual</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black tracking-tighter">$299</span>
              <span className="text-xl font-bold text-white/60">/year</span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full w-fit">
               <Percent size={14} /> Only $24.90/month
            </p>
          </div>
          
          <div className="flex-grow space-y-6 mb-12">
             <div className="text-xs font-black uppercase tracking-widest text-white/40">Full-Suite Experience</div>
             <ul className="space-y-4">
               <li className="flex items-center gap-4 text-lg font-bold"><CheckCircle className="text-emerald-400" size={24} /> 100% Unlimited Links</li>
               <li className="flex items-center gap-4 text-lg font-bold"><CheckCircle className="text-emerald-400" size={24} /> Real-Time Private Feed</li>
               <li className="flex items-center gap-4 text-lg font-bold"><CheckCircle className="text-emerald-400" size={24} /> Advanced Reputation Insights</li>
               <li className="flex items-center gap-4 text-lg font-bold"><CheckCircle className="text-emerald-400" size={24} /> Priority Customer Support</li>
               <li className="flex items-center gap-4 text-lg font-bold"><CheckCircle className="text-emerald-400" size={24} /> Annual Cost Savings: $49</li>
             </ul>
          </div>
          
          <MagicJoinButton>Get Yearly Access</MagicJoinButton>
          <div className="mt-6 flex items-center justify-center gap-2 opacity-60 text-[10px] font-black uppercase tracking-[0.2em]">
             <ShieldCheck size={14} /> Full Protection Guarantee
          </div>
        </div>
      </div>

      {/* Enterprise Contact */}
      <div className="mt-24 max-w-4xl mx-auto p-12 bg-slate-50 dark:bg-charcoal-950/40 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-3">
          <h4 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">Need a customized solution?</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">For agencies, multi-location franchises, or white-label needs.</p>
        </div>
        <a href="mailto:sales@vendofyx.com" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all hover:shadow-xl active:scale-95">Inquire Now</a>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "How does the 7-day refund guarantee work?", a: "If Vendofyx doesn't capture a single valuable piece of feedback or improve your score in 7 days, email support@vendofyx.com. We'll issue a full refund immediately—zero friction." },
    { q: "Is this against Google's Terms of Service?", a: "No. We don't block reviews. We provide a private venting channel for customers to resolve issues with you directly. It's ethical, compliant, and protects your brand." },
    { q: "What's the benefit of the Annual plan?", a: "The Annual plan is our best value, offering a $49 discount compared to paying monthly. It also unlocks priority support and advanced reputation insights." },
    { q: "Can I cancel my subscription anytime?", a: "Yes. You're in full control. Cancel with one click from your dashboard settings. You'll keep access until the end of your current billing period." }
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Common Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
            <button 
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full p-10 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-colors"
            >
              <span className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight">{faq.q}</span>
              <HelpCircle className={`text-blue-600 transition-transform duration-300 ${open === i ? 'rotate-180 scale-125' : ''}`} size={28} />
            </button>
            {open === i && (
              <div className="px-10 pb-10 text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed animate-in slide-in-from-top-4 duration-500">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const Landing: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      
      heroRef.current.style.setProperty('--mx', x.toString());
      heroRef.current.style.setProperty('--my', y.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 px-4 overflow-hidden perspective-1000"
        style={{ '--mx': '0', '--my': '0' } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="flex flex-col items-center mb-10">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-black border border-blue-100 dark:border-blue-500/20 shadow-sm animate-pulse">
              <Zap size={16} className="fill-current" />
              <span className="tracking-widest uppercase text-[10px]">Boost your rating by up to 2.4x</span>
            </div>
            <RatingEvolution />
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-charcoal-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
            The Ethical Way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Master Your Reviews</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed tracking-tight">
            Protect your business from public complaints. Automatically filter negative feedback while funneling happy customers directly to Google.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <MagicJoinButton>Get Pro Access Now</MagicJoinButton>
            <button 
              onClick={scrollToFeatures}
              className="bg-white dark:bg-charcoal-900 text-slate-700 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 dark:hover:bg-charcoal-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Explore Features
            </button>
          </div>
        </div>
        
        {/* Parallax Background Elements */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{ 
            transform: 'translate3d(calc(var(--mx) * -20px), calc(var(--my) * -20px), 0)',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
            willChange: 'transform'
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 dark:from-blue-900/10 to-transparent rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div 
          className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
          style={{ 
            transform: 'translate3d(calc(var(--mx) * -50px), calc(var(--my) * -50px), 0)',
            transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)',
            willChange: 'transform'
          }}
        >
          <Star className="absolute top-1/4 left-1/4 text-blue-200/40 dark:text-blue-500/20 fill-current animate-pulse" size={24} style={{ animationDelay: '0.5s' }} />
          <Star className="absolute top-2/3 left-10 text-indigo-200/30 dark:text-indigo-500/20 fill-current animate-bounce" size={16} style={{ animationDuration: '4s' }} />
          <Star className="absolute top-1/3 right-1/4 text-amber-200/30 dark:text-amber-500/20 fill-current animate-spin-slow" size={32} />
          <Star className="absolute bottom-1/4 right-10 text-blue-200/40 dark:text-blue-500/20 fill-current animate-pulse" size={20} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Core Capabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">Everything you need to scale your professional reputation.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Shield className="text-blue-600 dark:text-blue-400" size={32} />}
            title="Privacy Filter"
            description="Captured feedback is delivered to your private inbox, ensuring complaints never hit the public eye."
          />
          <FeatureCard 
            icon={<Star className="text-amber-500 fill-amber-500" size={32} />}
            title="Smart Funneling"
            description="Satisfied customers are instantly routed to Google, turning happy experiences into 5-star ratings."
          />
          <FeatureCard 
            icon={<Smartphone className="text-indigo-600 dark:text-indigo-400" size={32} />}
            title="Native Messaging"
            description="Zero extra costs. Use your phone's native SMS and WhatsApp to send magic links with zero friction."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-24 bg-slate-50/50 dark:bg-charcoal-900/30 rounded-[4rem] relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Star className="text-blue-600 dark:text-blue-500 w-48 h-48 animate-spin-slow" />
        </div>
        <div className="text-center mb-16 relative z-10">
          <span className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-6 inline-block">Global Wall of Love</span>
          <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Success Stories</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight">See how our users are capturing real 5-star experiences every day.</p>
        </div>
        <TestimonialCarousel />
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Footer-ish CTA */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-charcoal-900 dark:bg-charcoal-950 rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden border border-transparent dark:border-slate-800">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">Bulletproof Your Presence</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xl max-w-2xl mx-auto font-medium tracking-tight">
              Get Pro access today and watch your Google rating skyrocket ethically.
            </p>
            <div className="pt-4">
              <MagicJoinButton>Get Pro Access Now</MagicJoinButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
  <div className="p-10 bg-white dark:bg-charcoal-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:hover:shadow-blue-500/10 hover:-translate-y-3 transition-all duration-500 transform group">
    <div className="w-20 h-20 bg-slate-50 dark:bg-charcoal-800 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 text-charcoal-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tighter">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-lg tracking-tight">{description}</p>
  </div>
);

export default Landing;