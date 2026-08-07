import React from 'react';
import { ShieldCheck, Mail, Globe, Lock, Eye } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="py-12 sm:py-20 bg-black animate-fade-in text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-12 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">
            Decantre BD Discretion Protocol
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-wide">
            PRIVACY POLICY
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Last updated: January 2026
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-[#050505] border border-white/5 p-8 sm:p-10 rounded-none space-y-10 font-sans text-xs text-zinc-400 leading-relaxed">
          <p className="text-sm font-light text-zinc-300">
            At Decantre BD (“Decantre”, “we”, “our”, “us”), accessible from{" "}
            <a href="https://decantrebd.com" target="_blank" rel="noreferrer" className="text-gold hover:underline">
              https://decantrebd.com
            </a>
            , we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you visit or make a purchase from our website.
          </p>

          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Eye className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Information We Collect
              </h3>
            </div>
            <p className="text-zinc-400">
              When you interact with our website, we may collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Personal details such as name, phone number, email address, and shipping address</li>
              <li>Order and payment-related information (payment details are processed securely via third-party gateways; we do not store card information)</li>
              <li>Communication data when you contact us via email, forms, or social platforms</li>
              <li>Technical data such as IP address, browser type, device information, and browsing behavior</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                How We Use Your Information
              </h3>
            </div>
            <p className="text-zinc-400">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Process and fulfill orders</li>
              <li>Communicate with you regarding purchases, updates, or support requests</li>
              <li>Improve our website, products, and customer experience</li>
              <li>Send promotional offers or updates (only if you opt in)</li>
              <li>Prevent fraud and ensure website security</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Globe className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Cookies and Tracking Technologies
              </h3>
            </div>
            <p className="text-zinc-400">
              Decantrebd.com uses cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Enhance website functionality</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Remember user preferences</li>
            </ul>
            <p className="text-zinc-500 italic">
              You may disable cookies through your browser settings, though some features of the site may not function properly.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Lock className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Sharing of Information
              </h3>
            </div>
            <p className="text-zinc-400">
              We do not sell, rent, or trade your personal information. We may share limited data with trusted third parties only when necessary, including:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Payment processors</li>
              <li>Delivery and logistics partners</li>
              <li>Website analytics and hosting services</li>
            </ul>
            <p className="text-zinc-500 italic">All third parties are required to maintain confidentiality and security.</p>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Data Security
              </h3>
            </div>
            <p className="text-zinc-400">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Eye className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Your Rights
              </h3>
            </div>
            <p className="text-zinc-400">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>Access or update your personal information</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Opt out of promotional communications at any time</li>
            </ul>
            <p className="text-zinc-400">To exercise these rights, please contact us using the details below.</p>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Globe className="w-4 h-4 text-gold shrink-0" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                Third-Party Links & Children's Information
              </h3>
            </div>
            <p className="text-zinc-400">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.
            </p>
            <p className="text-zinc-400 pt-2">
              Decantre does not knowingly collect personal information from individuals under the age of 18.
            </p>
          </div>

          {/* Contact Details */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gold font-bold">Contact Us</h4>
            <p className="text-zinc-400">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className="space-y-1 text-zinc-300 font-mono text-[11px]">
              <div>Email: <a href="mailto:support@decantrebd.com" className="text-gold hover:underline">support@decantrebd.com</a></div>
              <div>Website: <a href="https://decantrebd.com" target="_blank" rel="noreferrer" className="text-gold hover:underline">https://decantrebd.com</a></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
