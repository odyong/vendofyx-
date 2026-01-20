
import React from 'react';

const Terms: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
    <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
      <p>Last updated: June 2024</p>
      <section>
        <h2 className="text-xl font-bold text-slate-900">1. Introduction</h2>
        <p>Vendofyx provides a platform to generate feedback links. By using our service, you agree to these terms.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">2. User Responsibility</h2>
        <p>Users are solely responsible for the messages they send from their own devices (SMS, WhatsApp, etc.). Vendofyx provides the link infrastructure; we do not send messages on your behalf.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">3. Compliance</h2>
        <p>You agree to comply with all local anti-spam laws (such as TCPA in the US or GDPR in the EU). You must have consent from customers before sending them review links.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-900">4. Payments</h2>
        <p>Payments are handled via our authorized secure payment provider. They act as the Merchant of Record for all transactions. By subscribing, you agree to the payment provider's terms and conditions as presented during the checkout process.</p>
      </section>
    </div>
  </div>
);

export default Terms;
