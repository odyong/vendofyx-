import React from 'react';

const Refund: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-black text-charcoal-900 dark:text-white mb-8 tracking-tighter">Refund Policy</h1>
    <div className="prose prose-slate dark:prose-invert max-w-none space-y-12 text-slate-600 dark:text-slate-400">
      <section className="bg-blue-50 dark:bg-blue-950/20 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-2xl font-black text-blue-900 dark:text-blue-400 mb-4 tracking-tight">7-Day Money-Back Guarantee</h2>
        <p className="text-lg font-medium leading-relaxed">
          We are so confident that Vendofyx will improve your business reputation that we offer a **no-questions-asked full refund** within your first 7 days of subscription. 
        </p>
        <p className="mt-4 font-bold text-blue-800 dark:text-blue-300">
          This applies to both our $29 Monthly and $299 Annual plans.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tight">How to Request a Refund</h2>
        <p className="leading-relaxed">
          Simply email us at <a href="mailto:support@vendofyx.com" className="text-blue-600 font-bold hover:underline">support@vendofyx.com</a> with your account email address. We process all refund requests within 48 business hours. Your access to Pro features will be discontinued immediately upon the issuance of a refund.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-black text-charcoal-900 dark:text-white mb-4 tracking-tight">Subscription Cancellations</h2>
        <p className="leading-relaxed">
          You can cancel your subscription at any time through your dashboard settings. If you cancel after the initial 7-day period, you will continue to have access to the service until the end of your current billing period (the end of the month for monthly plans, or the end of the year for annual plans). No partial refunds are issued for cancellations made after the 7-day window.
        </p>
      </section>

      <section className="pt-8 border-t border-slate-100 dark:border-charcoal-800">
        <h2 className="text-xl font-black text-charcoal-900 dark:text-white mb-2 tracking-tight">Questions?</h2>
        <p>Our support team is here to help you 24/7. Reach out anytime at <span className="font-bold">support@vendofyx.com</span>.</p>
      </section>
    </div>
  </div>
);

export default Refund;