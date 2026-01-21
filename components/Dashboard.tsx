import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ShieldCheck,
  CreditCard,
  Crown,
  X,
  Activity,
  Zap,
  TrendingUp,
  History,
  Timer
} from 'lucide-react';

// NOTE: Replace these with your actual IDs from the Paddle Dashboard
const PADDLE_CLIENT_TOKEN = 'test_9236c53e87c69992383848b393b'; // Mock/Sandbox Token
const PRICE_ID_MONTHLY = 'pri_01hks96z1z7vzrj00p0m0h1z1'; // Placeholder ID
const PRICE_ID_ANNUAL = 'pri_01hks97r5z7vzrj00p0m0h2z2'; // Placeholder ID

declare global {
  interface Window {
    Paddle: any;
  }
}

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
  
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [googleUrl, setGoogleUrl] = useState(profile?.google_review_url || '');

  const isDemo = !!localStorage.getItem('vendofyx_mock_user');
  const isPro = profile?.paddle_sub_status === 'active' || profile?.paddle_sub_status === 'active_annual';

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Initialize Paddle.js
  useEffect(() => {
    if (window.Paddle) {
      window.Paddle.Initialize({ 
        token: PADDLE_CLIENT_TOKEN,
        environment: 'sandbox', // Change to 'production' for live apps
        eventCallback: (event: any) => {
          if (event.name === 'checkout.completed') {
             // Handle checkout completion locally for UX
             handleLocalUpgradeSuccess();
          }
        }
      });
    }
  }, []);

  const handleLocalUpgradeSuccess = async () => {
    if (profile) {
      onProfileUpdate(profile.id);
      setShowUpgradeModal(false);
    }
  };

  const mockRequests: FeedbackRequest[] = [
    { id: '1', user_id: profile?.id || 'demo', customer_name: 'Alice Johnson', status: 'rated', rating: 5, feedback_text: "Absolutely loved the service!", created_at: new Date().toISOString() },
    { id: '2', user_id: profile?.id || 'demo', customer_name: 'Bob Peterson', status: 'rated', rating: 2, feedback_text: 'Issues: Speed, Service.', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', user_id: profile?.id || 'demo', customer_name: 'Catherine Reed', status: 'clicked', rating: null, feedback_text: null, created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }, // Older than 7 days
    { id: '4', user_id: profile?.id || 'demo', customer_name: 'David Smith', status: 'pending', rating: null, feedback_text: null, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() } // Older than 7 days
  ];

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
      setGoogleUrl(profile.google_review_url || '');
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
      const { data, error } = await supabase.from('feedback_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setRequests(data || []);
    } catch (e) { console.warn("Could not fetch requests:", e); }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    const updates = { business_name: businessName, google_review_url: googleUrl };
    if (isDemo) { onProfileUpdate(profile.id); setEditingProfile(false); } 
    else {
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) alert(error.message); else { onProfileUpdate(profile.id); setEditingProfile(false); }
    }
    setLoading(false);
  };

  const handleUpgradeCheckout = async () => {
    if (isDemo) {
      setUpgrading(true);
      await new Promise(r => setTimeout(r, 1000));
      alert("Real Paddle Checkout triggered in Demo Mode!");
      setUpgrading(false);
      return;
    }

    if (!window.Paddle) {
      alert("Paddle SDK not loaded.");
      return;
    }

    const priceId = selectedPlan === 'yearly' ? PRICE_ID_ANNUAL : PRICE_ID_MONTHLY;

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: {
        email: profile?.id 
      },
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en'
      }
    });
  };

  const generateLink = async () => {
    if (!customerName.trim() || !profile) return;
    if (!profile.google_review_url && !isDemo) { setShowConfigError(true); return; }
    if (!isPro && !isDemo) { setShowUpgradeModal(true);