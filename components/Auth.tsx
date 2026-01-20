import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSandboxMode } from '../supabase';
import { Mail, Lock, ShieldCheck, Star, Zap, MousePointer2, X, Play, Smartphone, CheckCircle, ArrowLeft, Loader2, AlertTriangle, UserPlus, LogIn, Github } from 'lucide-react';

const DemoTourPreview = () => (
  <div className="relative w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden mb-4 group/demo shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 to-black opacity-50"></div>
    <div className="relative p-4 space-y-3 z-10">
      <div className="flex justify-between items-center mb-2">
        <div className="w-1/3 h-2 bg-slate-700 rounded-full"></div>
        <div className="google-score text-[10px] font-black tracking-tighter transition-colors"></div>
      </div>
      <div className="relative w-full h-8 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 flex items-center overflow-hidden shadow-sm">
        <span className="text-[10px] text-slate-900 dark:text-white font-bold animate-type-text">Happy Customer</span>
        <div className="w-[1px] h-4 bg-blue-500 animate-pulse ml-0.5"></div>
      </div>
      <div className="w-full h-8 bg-blue-600 rounded-lg flex items-center justify-center gap-2 shadow-lg">
        <div className="w-16 h-2 bg-white/40 rounded-full"></div>
      </div>
      <div className="animate-reveal-card bg-charcoal-800/80 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={12} className="text-blue-400" />
          <div className="w-24 h-2 bg-slate-600 rounded-full"></div>
        </div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-stars-success">
         <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-2">
            <div className="