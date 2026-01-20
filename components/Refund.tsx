
import React from 'react';

const Refund: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
    <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
      <section>
        <h2 className="text-xl font-bold text-slate-900">7-Day Money-Back Guarantee</h2>
        <p className="text-lg">If you don't get more reviews in your first 7 days of using Vendofyx, we will give you a full refund—no questions asked.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">How to request a refund</h2>
        <p>Simply email us at support@vendofyx.com with your account email address. We process all refund requests within 48 hours.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">Subscription Cancellations</h2>
        <p>You can cancel your subscription at any time through your dashboard. You will continue to have access to the service until the end of your current billing period.</p>
      </section>
    </div>
  </div>
);

export default Refund;
