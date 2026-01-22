import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Star, 
  Smartphone, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Zap, 
  MessageCircle, 
  ThumbsUp,
  Filter,
  BarChart3,
  MousePointer2,
  Mail,
  ExternalLink,
  Lock,
  Target
} from 'lucide-react';

const StepCard = ({ number, title, desc, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white dark:bg-charcoal-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden h-full"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full ${color}`}></div>
    <div className={`w-16 h-16 rounded-2xl ${color} text-white flex items-center justify-center mb-6 shadow-lg`}>
      <Icon size={32} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Step {number}</span>
    <h3 className="text-xl font-black uppercase mb-3 text-charcoal-900 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Landing: React.FC = () => {
  const [simRating, setSimRating] = useState<number>(0);
  const [showSimResult, setShowSimResult] = useState(false);

  const handleSimRate = (val: number) => {
    setSimRating(val);
    setShowSimResult(true);
    setTimeout(() => {
      setShowSimResult(false);
      setSimRating(0);
    }, 4500);
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative pt-32 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/50 mb-8"
        >
          <Sparkles className="text-indigo-600 dark:text-indigo-400" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Reputation Armor v2.0</span>
        </motion.div>
        
        <h1 className="text-6xl md:text-9xl font-black text-charcoal-900 dark:text-white mb-8 tracking-tighter leading-[0.85]">
          Scale Public <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">Trust Fast.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium">
          The ethical "Gate Logic" that filters your feedback. Boost your Google rating automatically while capturing complaints privately.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button onClick={scrollToPricing} className="interactive-element bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 border-transparent shadow-xl shadow-indigo-500/30">Secure My Brand <ArrowRight /></button>
          <Link to="/auth?mode=signup" className="interactive-element bg-white dark:bg-charcoal-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-xl shadow-sm">Start Trial Free</Link>
        </div>
      </section>

      {/* Interactive Gate Simulator */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-charcoal-900 dark:bg-charcoal-950 rounded-[4rem] p-10 md:p-20 text-white border-2 border-slate-800 shadow-3xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                  The <span className="text-indigo-400">Feedback Gate</span>
                </h2>
                <p className="text-slate-400 font-bold text-lg leading-relaxed">
                  Test the logic yourself. Choose a star rating to see how Vendofyx instantly routes your customers based on their sentiment.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1 text-emerald-400">The Growth Path (4-5 Stars)</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Instantly triggers a redirect to your public Google Maps review page to boost your SEO.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1 text-indigo-300">The Shield Path (1-3 Stars)</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Opens a private feedback form that sends data straight to your dashboard—keeping issues off Google.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 space-y-10 text-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Simulation Interface</p>
                  <h3 className="text-2xl font-black text-charcoal-900 uppercase">Rate your experience</h3>
                </div>

                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSimRate(i)}
                      disabled={showSimResult}
                      className="interactive-element p-2 rounded-xl border-transparent"
                    >
                      <Star size={44} className={`${(simRating || 0) >= i ? 'fill-amber-400 text-amber-400' : 'text-slate-100'} transition-all duration-300`} />
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {showSimResult ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 ${simRating >= 4 ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}
                    >
                      {simRating >= 4 ? (
                        <>
                          <div className="bg-emerald-500 p-4 rounded-full text-white shadow-lg"><ExternalLink size={24} /></div>
                          <p className="text-emerald-900 font-black text-xl uppercase tracking-tight">Public Redirect</p>
                          <p className="text-emerald-700 text-xs font-bold leading-relaxed">The system would now send this customer to your Google Page to share their 5-star experience.</p>
                        </>
                      ) : (
                        <>
                          <div className="bg-indigo-500 p-4 rounded-full text-white shadow-lg"><Lock size={24} /></div>
                          <p className="text-indigo-900 font-black text-xl uppercase tracking-tight">Private Shield Activated</p>
                          <p className="text-indigo-700 text-xs font-bold leading-relaxed">This customer is sent to a private form. You get the feedback, but your Google rating stays safe.</p>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-12 flex flex-col items-center text-slate-200 gap-4">
                      <div className="p-4 rounded-full bg-slate-50">
                        <MousePointer2 className="animate-bounce text-indigo-600" size={32} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Choose a rating above</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/40 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-600/30 blur-[100px] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-24">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-charcoal-900 dark:text-white">Built for <span className="text-indigo-600">Local Leaders.</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Everything you need to dominate your neighborhood</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
              <Smartphone size={32} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 dark:text-white">Zero Message Costs</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">We use your device's native SMS and WhatsApp apps. No expensive SMS fees or complicated Twilio integrations needed.</p>
          </div>
          <div className="space-y-6 group">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner group-hover:scale-110 transition-transform">
              <Shield size={32} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 dark:text-white">Reputation Armor</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Capture negative feedback before it hits Google. Turn angry customers into loyal fans by resolving issues privately.</p>
          </div>
          <div className="space-y-6 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tight text-charcoal-900 dark:text-white">SEO Power Boost</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">More 5-star reviews means higher local search ranking. Dominate your local market and watch your customer base grow.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="bg-white dark:bg-charcoal-900 rounded-[5rem] p-12 md:p-24 text-center border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-16">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-charcoal-900 dark:text-white">Simple Plans.</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Unleash the full power of Vendofyx today</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Link to="/auth?mode=signup" className="interactive-element bg-slate-50 dark:bg-charcoal-950 border-slate-200 dark:border-charcoal-800 p-12 rounded-[3.5rem] block text-left group">
              <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-2">Monthly Partnership</p>
              <div className="text-6xl font-black text-charcoal-900 dark:text-white">$29<span className="text-sm font-bold opacity-40 ml-2">/mo</span></div>
              <ul className="mt-10 space-y-4">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400"><Check size={18} className="text-emerald-500" /> Unlimited Magic Links</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400"><Check size={18} className="text-emerald-500" /> Private Feedback Inbox</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400"><Check size={18} className="text-emerald-500" /> Real-time Dashboard</li>
              </ul>
            </Link>
            <Link to="/auth?mode=signup" className="interactive-element bg-indigo-600 border-transparent p-12 rounded-[3.5rem] block text-left relative overflow-hidden shadow-2xl shadow-indigo-500/40">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[11px] font-black px-6 py-3 rounded-bl-2xl uppercase tracking-widest">Saves $49</div>
              <p className="text-indigo-100/60 font-black uppercase tracking-widest text-[10px] mb-2">Annual Partnership</p>
              <div className="text-6xl font-black text-white">$299<span className="text-sm font-bold opacity-60 ml-2">/yr</span></div>
              <ul className="mt-10 space-y-4">
                <li className="flex items-center gap-3 text-sm font-bold text-white/90"><Check size={18} /> Everything in Monthly</li>
                <li className="flex items-center gap-3 text-sm font-bold text-white/90"><Check size={18} /> 2 Months Free</li>
                <li className="flex items-center gap-3 text-sm font-bold text-white/90"><Check size={18} /> Priority Support</li>
              </ul>
            </Link>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cancel anytime. 7-Day full refund guarantee.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;