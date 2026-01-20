
import React from 'react';

const Privacy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
    <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
      <p>Your privacy is important to us. This policy explains how we handle data.</p>
      <section>
        <h2 className="text-xl font-bold text-slate-900">1. Data We Collect</h2>
        <p>We store business names, Google review URLs, and the customer names you enter in the dashboard. We also store the feedback and ratings submitted by your customers.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">2. Data Usage</h2>
        <p>We do not sell your customer data to third parties. Data is used exclusively to provide the feedback dashboard functionality to you.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">3. Security</h2>
        <p>We use industry-standard encryption (via Supabase) to protect your data. However, no method of transmission over the internet is 100% secure.</p>
      </section>
    </div>
  </div>
);

export default Privacy;
