import React from 'react';
import { RefreshCw, ShieldAlert, CheckCircle, HelpCircle, Truck } from 'lucide-react';

export const ReturnPolicy = () => {
  return (
    <div className="py-12 sm:py-20 bg-black animate-fade-in text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-12 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">
            Customer Satisfaction & Guarantee
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-wide">
            RETURNS, REFUND & EXCHANGE POLICY
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Effective for all purchases at <a href="https://decantrebd.com" className="text-gold hover:underline">Decantrebd.com</a>
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-[#050505] border border-white/5 p-8 sm:p-10 rounded-none space-y-8 font-sans text-xs text-zinc-400 leading-relaxed">
          <p className="text-sm font-light text-zinc-300">
            At Decantrebd.com, customer satisfaction is our top priority. We take pride in offering high-quality, authentic fragrances and decants. This policy outlines our terms and conditions for returns, refunds, exchanges, cancellations, and shipment responsibilities to ensure a smooth and transparent shopping experience.
          </p>

          {/* A. Return Eligibility */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">A.</span> Return Eligibility
            </h3>
            <p className="text-zinc-400">
              To maintain product integrity and hygiene, returns will only be accepted under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Products must be returned in their original packaging (no returns for tampered or damaged boxes)</li>
              <li>Decants can be checked in front of the delivery agent, but spraying is not allowed</li>
              <li>Full bottles must remain sealed and unopened (cellophane wrap must be intact)</li>
              <li>A valid proof of purchase is required (e.g., invoice, order confirmation email)</li>
              <li>For concerns regarding authenticity, proof must be provided before a return is accepted</li>
              <li className="text-gold/80">False or fraudulent claims without valid proof may result in legal consequences</li>
            </ul>
          </div>

          {/* B & C. Items Eligible & NOT Eligible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 border border-emerald-500/10 bg-emerald-950/5 space-y-3">
              <h4 className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> B. Eligible for Return
              </h4>
              <p className="text-[11px] text-zinc-400">We accept returns in the following situations:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-zinc-400 text-[11px]">
                <li>Unopened full bottle fragrances</li>
                <li>Un-sprayed decants</li>
                <li>Wrong product received (must be checked immediately in front of the delivery agent)</li>
                <li>Items damaged during transit (must be checked in front of the delivery agent)</li>
              </ul>
              <p className="text-[10px] text-zinc-500 font-bold border-t border-white/5 pt-2">
                ⚠️ Claims made after the delivery agent has left will not be accepted.
              </p>
            </div>

            <div className="p-5 border border-rose-500/10 bg-rose-950/5 space-y-3">
              <h4 className="text-xs uppercase font-bold text-rose-400 tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> C. NOT Eligible for Return
              </h4>
              <p className="text-[11px] text-zinc-400">We do NOT accept returns for:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-zinc-400 text-[11px]">
                <li>Opened or used bottles</li>
                <li>Sprayed decants</li>
                <li>Claims without evidence or raised after delivery is completed</li>
              </ul>
            </div>
          </div>

          {/* D. Return Request Time Frame & E. Shipping Costs */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">D. Return Request Time Frame</h4>
                <p className="text-zinc-400">Return requests must be submitted within <strong className="text-white">48 hours</strong> of receiving the product. Requests made after this time will not be accepted.</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">E. Shipping Costs for Returns</h4>
                <p className="text-zinc-400">If the return meets our policy, Decantrebd.com will cover the return shipping cost. If the return does not qualify, shipping costs will not be reimbursed.</p>
              </div>
            </div>
          </div>

          {/* F. Exchange Policy */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
              <span className="text-gold font-mono">F.</span> Exchange Policy
            </h3>
            <p className="text-zinc-400">
              We allow exchanges under these conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>Products must be unused and in original condition</li>
              <li>Exchange will be done hand-to-hand during delivery</li>
              <li>Delivery agents will inspect the item on the spot before confirming exchange</li>
              <li>If direct exchange is not possible in a location, the customer must return the item first. After inspection, a replacement will be dispatched</li>
              <li>Misuse or false claims void the exchange request</li>
              <li>If the request is valid, courier fees will be covered by Decantrebd.com</li>
            </ul>
          </div>

          {/* G. Refund Policy & H. Order Cancellation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold">G. Refund Policy</h4>
              <p className="text-zinc-400">
                Customers may request a full refund, store credit, or partial refund depending on the situation. Refunds are usually processed within 24 hours, unless extra verification is needed. If a package is lost during shipping, the customer may choose a replacement, refund, or store credit.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold">H. Order Cancellation Policy</h4>
              <p className="text-zinc-400">
                Orders can be cancelled anytime before dispatch without any fees. If the order is already dispatched, a courier fee will be deducted (for both decants and full bottles). Cancellations will not be accepted after delivery is completed.
              </p>
            </div>
          </div>

          {/* I. Responsibility for Delayed or Lost Shipments */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
              <span className="text-gold font-mono">I.</span> Responsibility for Delayed or Lost Shipments
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>If delivery is delayed more than 7 days, the order can be cancelled</li>
              <li>Decantrebd.com is responsible for lost shipments</li>
              <li>Products must be checked in front of the delivery agent</li>
              <li><strong className="text-white">For any claims involving missing items or empty bottles, a complete unboxing video must be recorded from the moment the seal is broken. Claims without video proof will not be accepted.</strong></li>
            </ul>
          </div>

          {/* J. Special Cases & Exceptions */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
              <span className="text-gold font-mono">J.</span> Special Cases & Exceptions
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>International orders are not accepted; we currently deliver within Bangladesh only</li>
              <li>For special cases, Decantrebd.com reserves the right to define custom return/exchange terms</li>
              <li>A verification process may be conducted before approval</li>
              <li>A return/exchange fee may apply depending on the condition and case</li>
            </ul>
          </div>

          {/* K. Contact Information */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gold font-bold">K. Contact Information</h4>
            <p className="text-zinc-400 font-light">
              For questions or concerns regarding returns, refunds, or exchanges, feel free to contact us:
            </p>
            <div className="space-y-1 text-zinc-300 font-mono text-[11px]">
              <div>📩 Instagram: <a href="https://instagram.com/decantre.store" target="_blank" rel="noreferrer" className="text-gold hover:underline">@decantre.store</a></div>
              <div>Website: <a href="https://decantrebd.com" target="_blank" rel="noreferrer" className="text-gold hover:underline">https://decantrebd.com</a></div>
            </div>
            <p className="text-gold tracking-wider font-light text-[10px] pt-2 uppercase">
              We’re always here to help you stay fresh with confidence ✨
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReturnPolicy;
