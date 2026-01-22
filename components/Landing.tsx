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
  ThumbsUp,
  Filter,
  MousePointer2,
  Mail,
  ExternalLink,
  Lock,
  Target
} from 'lucide-react';

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
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Reputation Armor v2.0</span>
        </motion.div>
        
        <h1 className="text-6xl md:text-9xl font-black text-charcoal-900 dark:text-white mb-8 tracking-tighter leading-[0.85]">
          Scale Public <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">Trust Fast.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium">
          The ethical "Gate Logic" that filters your feedback. Boost your Google rating automatically while capturing complaints privately.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/auth?mode=signup" className="interactive-element bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 border-transparent shadow-xl shadow-indigo-500/30">Get Started Free <ArrowRight /></Link>
          <button onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })} className="interactive-element bg-white dark:bg-charcoal-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 px-10 py-5 rounded-2xl font-black text-xl shadow-sm">Watch Demo</button>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="simulator" className="max-w-7xl mx-auto px-6">
        <div className="bg-charcoal-900 dark:bg-charcoal-950 rounded-[4rem] p-10 md:p-20 text-white border-2 border-slate-800 shadow-3xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                  The <span className="text-indigo-400">Logic Gate</span>
                </h2>
                <p className="text-slate-400 font-bold text-lg leading-relaxed">
                  Test the smart funneling logic. Choose a star rating to see how Vendofyx instantly routes your customers based on their sentiment.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1 text-emerald-400">Public Promotion (4-5 Stars)</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Happy customers are sent directly to your Google Maps review page to boost your rankings.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm mb-1 text-indigo-300">Private Filter (1-3 Stars)</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Opens a private feedback form that sends data straight to your dashboard—keeping issues off Google.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl relative z-10 space-y-10 text-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer View Simulation</p>
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
                      <Star size={44} className={`${(simRating || 0) >= i ? 'fill-amber-400 text-amber-400' : 'text-slate-100'} transition-all`} />
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
                          <p className="text-emerald-700 text-xs font-bold leading-relaxed">The system triggers a redirect to your Google Page to share the 5-star experience.</p>
                        </>
                      ) : (
                        <>
                          <div className="bg-indigo-500 p-4 rounded-full text-white shadow-lg"><Lock size={24} /></div>
                          <p className="text-indigo-900 font-black text-xl uppercase tracking-tight">Private Shield</p>
                          <p className="text-indigo-700 text-xs font-bold leading-relaxed">This customer is sent to a private form. You get the feedback, but your Google rating stays safe.</p>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-12 flex flex-col items-center text-slate-200 gap-4">
                      <MousePointer2 className="animate-bounce text-indigo-600" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Choose a rating above</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="p-10 bg-white dark:bg-charcoal-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Smartphone size={32} /></div>
          <h4 className="text-2xl font-black uppercase tracking-tight">Zero Messaging Costs</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Uses your device's native SMS and WhatsApp apps. No hidden fees or complex API integrations.</p>
        </div>
        <div className="p-10 bg-white dark:bg-charcoal-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950 text-violet-600 rounded-2xl flex items-center justify-center shadow-inner"><Target size={32} /></div>
          <h4 className="text-2xl font-black uppercase tracking-tight">SEO Domination</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">More 5-star reviews means higher local search ranking. Beat your competitors to the top spot.</p>
        </div>
        <div className="p-10 bg-white dark:bg-charcoal-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><Zap size={32} /></div>
          <h4 className="text-2xl font-black uppercase tracking-tight">Instant Deployment</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Sign up and generate your first magic link in under 60 seconds. No dev skills required.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;