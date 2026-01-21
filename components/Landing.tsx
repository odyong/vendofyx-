import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex flex-col items-center gap-4 mt-6">
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
                className={`transition-all duration-700 ease-out ${s <= rating ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-100 dark:text-slate-800'} ${s === rating ? 'animate-pulse' : ''}`} 
              />
            ))}
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums w-12 text-center">
            {decimalRating.toFixed(1)}
          </span>
        </div>

        <div className="w-full bg-slate-50 dark:bg-charcoal-800 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-1000 ease-in-out rounded-full" 
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(staticTestimonials);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      <div className="overflow-hidden rounded-[3rem] bg-white dark:bg-charcoal-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="relative h-[450px] md:h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 p-10 md:p-16 flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, starI) => (
                    <Star key={starI} size={20} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {testimonials[activeIndex].verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <BadgeCheck size={14} /> Verified Customer
                  </div>
                )}
              </div>
              <div className="relative mb-8">
                <Quote className="absolute -top-6 -left-4 text-blue-50 dark:text-blue-500/10 opacity-50" size={80} />
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic relative z-10 line-clamp-4 md:line-clamp-3">
                  "{testimonials[activeIndex].quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="w-14 h-14 bg-charcoal-900 dark:bg-charcoal-800 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl bg-gradient-to-br from-charcoal-800 to-charcoal-950">
                  {testimonials[activeIndex].initials}
                </div>
                <div>
                  <h4 className="font-black text-charcoal-900 dark:text-white text-lg tracking-tight">{testimonials[activeIndex].author}</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest">{testimonials[activeIndex].business}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
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
          </div>
          {[...Array(16)].map((_, i) => {
            const rotation = (i / 16) * 360;
            return (
              <Star 
                key={i} 
                size={Math.random() * 10 + 8} 
                className={`absolute left-1/2 top-1/2 fill-current ${starColors[i % starColors.length]} animate-star-orbit-magic pointer-events-none`}
                style={{ '--rotation': `${rotation}deg` } as any}
              />
            );
          })}
        </>
      )}
    </button>
  );
};

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Professional Tiers</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight mb-8">Choose the growth pace that fits your business.</p>
        
        <div className="flex items-center justify-center gap-6 mb-16">
          <span className={`text-sm font-black transition-colors ${billingCycle === 'monthly' ? 'text-charcoal-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-20 h-10 bg-slate-200 dark:bg-charcoal-800 rounded-full p-1 relative transition-colors border border-slate-300 dark:border-slate-700 group overflow-hidden"
          >
            <motion.div 
              animate={{ x: billingCycle === 'yearly' ? 40 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-8 h-8 bg-blue-600 rounded-full shadow-xl relative z-10" 
            />
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black transition-colors ${billingCycle === 'yearly' ? 'text-charcoal-900 dark:text-white' : 'text-slate-400'}`}>Yearly</span>
            <motion.div 
              initial={false}
              animate={{ scale: billingCycle === 'yearly' ? 1.05 : 1 }}
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
            >
              Save $49 / year
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
        {/* Monthly Plan */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="p-10 md:p-14 bg-white dark:bg-charcoal-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex flex-col transition-all hover:border-blue-500/30 group"
        >
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">Pro Monthly</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-charcoal-900 dark:text-white tracking-tighter">$29</span>
              <span className="text-xl font-bold text-slate-400">/month</span>
            </div>
          </div>
          
          <div className="flex-grow space-y-6 mb-12">
             <div className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Feature Suite</div>
             <ul className="space-y-4">
               {[
                 "Unlimited Magic Links",
                 "Private Inbox Funnel",
                 "Standard Reputation Feed",
                 "Native Multi-App Sharing",
                 "7-Day Refund Guarantee"
               ].map((f, i) => (
                 <li key={i} className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-bold">
                   <Check size={20} className="text-blue-600 flex-shrink-0" /> {f}
                 </li>
               ))}
             </ul>
          </div>
          
          <Link to="/auth?mode=signup" className="block w-full text-center py-6 bg-slate-100 dark:bg-charcoal-800 text-slate-900 dark:text-white rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm">Start Scaling</Link>
        </motion.div>

        {/* Yearly Plan - Best Value */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="p-10 md:p-14 bg-charcoal-900 dark:bg-blue-600 rounded-[4rem] shadow-2xl relative overflow-hidden group z-10 text-white flex flex-col border-4 border-white/20 transform scale-105"
        >
          <div className="absolute top-0 right-0 p-10">
            <Sparkles className="text-white/20 animate-pulse" size={80} />
          </div>
          <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-8 py-3 rounded-br-[2rem] uppercase tracking-[0.3em] shadow-lg z-20">Best Value</div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-xl font-black text-white/60 uppercase tracking-widest mb-4">Pro Annual</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black tracking-tighter">$299</span>
              <span className="text-xl font-bold text-white/60">/year</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full w-fit">
               <Percent size={14} /> $24.90 / month eff.
            </div>
          </div>
          
          <div className="flex-grow space-y-6 mb-12 relative z-10">
             <div className="text-xs font-black uppercase tracking-widest text-white/40">Power Experience</div>
             <ul className="space-y-4">
               {[
                 "100% Unlimited Link Volume",
                 "Priority Database Routing",
                 "Advanced Sentiment Telemetry",
                 "Concierge Customer Support",
                 "Annual Savings: $49 (14% Off)"
               ].map((f, i) => (
                 <li key={i} className="flex items-center gap-4 text-lg font-bold">
                   <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} /> {f}
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="relative z-10">
            <MagicJoinButton>Get Pro Annual</MagicJoinButton>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 opacity-60 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
             <ShieldCheck size={14} /> Secure Billed Annually
          </div>
        </motion.div>
      </div>

      <div className="mt-24 max-w-4xl mx-auto p-12 bg-slate-50 dark:bg-charcoal-950/40 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-3">
          <h4 className="text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">Need white-label scale?</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">For agencies managing 10+ business locations.</p>
        </div>
        <a href="mailto:sales@vendofyx.com" className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all hover:shadow-xl active:scale-95">Inquire Now</a>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-10 bg-white dark:bg-charcoal-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:hover:shadow-blue-500/10 transition-all duration-500 transform group"
  >
    <div className="w-20 h-20 bg-slate-50 dark:bg-charcoal-800 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 text-charcoal-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tighter">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-lg tracking-tight">{description}</p>
  </motion.div>
);

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "How does the 7-day refund guarantee work?", a: "If Vendofyx doesn't help you catch at least one negative review or improve your score in 7 days, email support@vendofyx.com. We'll issue a full refund immediately." },
    { q: "Is this ethical and compliant?", a: "Yes. We don't block reviews. We provide a private resolution channel for customers, which protects your brand reputation while staying compliant with platform terms." },
    { q: "What's the benefit of the Annual plan?", a: "Annual billing saves you $49 per year (equivalent to nearly two months free) and gives you access to advanced sentiment telemetry features." },
    { q: "Can I cancel anytime?", a: "Absolutely. We don't believe in long-term lock-ins. You can cancel with one click in your dashboard at any time." }
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Platform FAQs</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full p-10 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-charcoal-800 transition-colors"
            >
              <span className="text-xl font-black text-charcoal-900 dark:text-white tracking-tight">{faq.q}</span>
              <motion.div
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <HelpCircle className="text-blue-600" size={28} />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="px-10 pb-10 text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const Landing: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      heroRef.current.style.setProperty('--mx', x.toString());
      heroRef.current.style.setProperty('--my', y.toString());
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="space-y-24 pb-24">
      <section ref={heroRef} className="relative pt-32 px-4 overflow-hidden perspective-1000">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <RatingEvolution />
          <h1 className="text-6xl md:text-8xl font-black text-charcoal-900 dark:text-white mt-12 mb-8 tracking-tighter leading-[0.9]">
            Modern Brand <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Reputation Logic</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed tracking-tight">
            The ethical "gate" for your customer reviews. Funnel positive sentiment to Google and capture negative feedback privately.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <MagicJoinButton>Start Professional Suite</MagicJoinButton>
            <button onClick={scrollToFeatures} className="bg-white dark:bg-charcoal-900 text-slate-700 dark:text-slate-300 border-2 border-slate-100 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-xl hover:bg-slate-50 dark:hover:bg-charcoal-800 hover:shadow-xl transition-all transform hover:-translate-y-1">Explore Tech</button>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tighter uppercase">Platform Logic</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard icon={<Shield className="text-blue-600" size={32} />} title="Feedback Gate" description="Privacy-first capturing of dissatisfaction, allowing you to resolve issues before they become public." />
          <FeatureCard icon={<Star className="text-amber-500 fill-amber-500" size={32} />} title="Reputation Booster" description="Automated funneling of 5-star experiences directly to your public Google Review profile." />
          <FeatureCard icon={<Smartphone className="text-indigo-600" size={32} />} title="Zero-Cost Native" description="Generates magic links that work with your device's native SMS and WhatsApp apps seamlessly." />
        </div>
      </section>

      <PricingSection />
      
      <section className="max-w-7xl mx-auto px-4 py-24 bg-slate-50/50 dark:bg-charcoal-900/30 rounded-[4rem] relative overflow-hidden">
        <div className="text-center mb-16 relative z-10">
          <span className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-6 inline-block">Client Voices</span>
          <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 dark:text-white tracking-tighter uppercase">Success Gallery</h2>
        </div>
        <TestimonialCarousel />
      </section>

      <FAQSection />

      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-charcoal-900 dark:bg-charcoal-950 rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">Ready for Pro Status?</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">Capture every high-intent review starting today.</p>
            <div className="pt-4">
              <MagicJoinButton>Activate Suite Now</MagicJoinButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;