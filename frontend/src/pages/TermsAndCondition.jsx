import React from 'react';
import { ShieldCheck, Scale, FileText, Info } from 'lucide-react';

export const TermsAndCondition = () => {
  return (
    <div className="py-12 sm:py-20 bg-black animate-fade-in text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-12 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">
            The Sovereign Agreement
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-wide">
            TERMS & CONDITIONS
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Website: <a href="https://decantrebd.com" target="_blank" rel="noreferrer" className="text-gold hover:underline">https://decantrebd.com</a>
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-[#050505] border border-white/5 p-8 sm:p-10 rounded-none space-y-8 font-sans text-xs text-zinc-400 leading-relaxed">
          <p className="text-sm font-light text-zinc-300">
            By accessing or using this website, you agree to be bound by the Terms & Conditions outlined below. These terms govern your use of the website, services, content, and transactions conducted through Decantre. Please read them carefully before using our services.
          </p>

          {/* A. Introduction */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">A.</span> Introduction
            </h3>
            <p className="text-zinc-400">
              Welcome to Decantre, an online platform offering authentic perfumes and fragrance decants. By using this website, you confirm that you have read, understood, and agreed to these Terms & Conditions. If you do not agree, please discontinue use of the website.
            </p>
            <p className="text-zinc-500 italic">
              Decantre reserves the right to modify or update these Terms & Conditions at any time without prior notice. Continued use of the website constitutes acceptance of any changes.
            </p>
          </div>

          {/* B. Definitions */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">B.</span> Definitions
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-400">
              <li><strong className="text-zinc-300">“Decantre”, “we”, “our”, “us”</strong> refers to the business operating https://decantrebd.com</li>
              <li><strong className="text-zinc-300">“You”, “user”, “customer”</strong> refers to any individual accessing or purchasing from the website</li>
              <li><strong className="text-zinc-300">“Services”</strong> include products, content, customer support, and features provided through the website</li>
            </ul>
          </div>

          {/* C. Intellectual Property & Content Usage */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">C.</span> Intellectual Property & Content Usage
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-2 text-zinc-400">
              <li>All website content including images, descriptions, logos, designs, and text are protected by intellectual property laws</li>
              <li>Unauthorized copying, reproduction, or distribution of any content is strictly prohibited</li>
              <li>Product descriptions may be based on brand information or personal experience and may vary by individual perception</li>
              <li>Product appearance, color, or packaging may differ slightly due to lighting, screen, or batch variations</li>
            </ul>
          </div>

          {/* D. Decanting Process & Product Disclaimer */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">D.</span> Decanting Process & Product Disclaimer
            </h3>
            <p className="text-zinc-400">
              Decantre provides authentic fragrance decants prepared in smaller quantities from original bottles. All decants are filled manually with care and hygiene.
            </p>
            <p className="text-zinc-400">We are not liable for differences such as:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>Variations in longevity, projection, or sillage</li>
              <li>Batch differences or brand reformulations</li>
              <li>Seasonal, weather, or skin chemistry variations</li>
              <li>Minor leakage, evaporation, or bottle reactions over time</li>
            </ul>
            <p className="text-zinc-500 italic">
              Note: All decants are freshly prepared by hand. Minor imperfections are normal and not considered defects.
            </p>
          </div>

          {/* E. User Accounts & Security */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="text-gold font-mono">E.</span> User Accounts & Security
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>Users must provide accurate and up-to-date information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>Unauthorized access must be reported immediately</li>
              <li>Accounts involved in misuse or fraud may be suspended without notice</li>
            </ul>
          </div>

          {/* F, G, H */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 border border-white/5 bg-zinc-950/40 space-y-2">
              <h4 className="font-bold text-[10px] uppercase text-gold tracking-widest">F. Website Availability</h4>
              <p className="text-zinc-400 text-[11px]">While we strive to keep the website accessible, downtime may occur due to maintenance or technical issues. Decantre is not liable for losses caused by temporary unavailability.</p>
            </div>
            <div className="p-4 border border-white/5 bg-zinc-950/40 space-y-2">
              <h4 className="font-bold text-[10px] uppercase text-gold tracking-widest">G. Prohibited Conduct</h4>
              <p className="text-zinc-400 text-[11px]">Submitting false, misleading, or unlawful information, engaging in fraud, violating IP rights, or uploading malware/spam is strictly forbidden.</p>
            </div>
            <div className="p-4 border border-white/5 bg-zinc-950/40 space-y-2">
              <h4 className="font-bold text-[10px] uppercase text-gold tracking-widest">H. Orders & Payment</h4>
              <p className="text-zinc-400 text-[11px]">All orders are subject to availability and confirmation. Prices and stock may change. Order confirmation does not guarantee final acceptance.</p>
            </div>
          </div>

          {/* I, J, K, L, M, N */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">I. Data Use & Privacy</h4>
                <p className="text-zinc-400">Personal information is collected only for order processing and service improvement. Please refer to our Privacy Policy for complete details.</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">J. Third-Party Links</h4>
                <p className="text-zinc-400">Our website may contain links to third-party platforms. Decantre is not responsible for the content, policies, or practices of those websites.</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">K. Limitation of Liability</h4>
                <p className="text-zinc-400">Decantre is not liable for damages arising from website usage. Errors in pricing, listings, or delays may occur. We reserve the right to correct errors without liability.</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">L. Pricing Errors</h4>
                <p className="text-zinc-400">In case of incorrect pricing or listing errors, Decantre may cancel affected orders or issue refunds where applicable.</p>
              </div>
            </div>
          </div>

          {/* M. Governing Law */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold">M. Governing Law</h4>
            <p className="text-zinc-400">
              These Terms & Conditions are governed by the laws of Bangladesh. All disputes shall fall under the jurisdiction of courts in Dhaka, Bangladesh.
            </p>
          </div>

          {/* N. Age Restriction */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold">N. Age Restriction</h4>
            <p className="text-zinc-400">
              Our services are intended for individuals aged 18 and above. If personal information from a minor is identified, it will be deleted immediately.
            </p>
          </div>

          {/* Contact Details */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-gold font-bold">O. Contact Us</h4>
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

export default TermsAndCondition;
