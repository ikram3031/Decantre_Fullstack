import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Truck, Droplet, Clock, RefreshCw } from 'lucide-react';

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      icon: ShieldCheck,
      question: "Are the fragrances 100% authentic?",
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Yes.</strong> Every fragrance at Decantre is 100% authentic and sourced from trusted international boutiques and verified retailers. We do not sell replicas, inspired versions, dupes, or perfume oils. We never dilute, reformulate, or alter the fragrance in any way — we simply transfer it from the original retail bottle into a premium atomizer.
          </p>
          <p className="text-zinc-400 text-xs italic bg-white/5 p-3 rounded-xs border-l-2 border-gold/60">
            Please note that Decantre is an independent fragrance retailer. We are not affiliated with or endorsed by the brands or designers whose perfumes we offer. We are fragrance enthusiasts dedicated to making luxury scents more accessible.
          </p>
        </div>
      )
    },
    {
      icon: Droplet,
      question: "What is a decant?",
      answer: (
        <div className="space-y-2">
          <p>
            A decant is a smaller portion of an original perfume transferred into a compact spray bottle (atomizer). Decanting simply means moving the fragrance from its full-size bottle into a smaller container — nothing more, nothing less.
          </p>
          <p className="text-gold font-medium">
            It allows you to experience luxury scents without committing to a full bottle.
          </p>
        </div>
      )
    },
    {
      icon: HelpCircle,
      question: "How do you decant the fragrance?",
      answer: (
        <div className="space-y-3">
          <p>
            Each decant is prepared carefully in a clean and controlled environment. We use professional tools to transfer the fragrance directly from the original retail bottle into premium glass atomizers.
          </p>
          <p>
            The process is handled with precision to preserve the scent’s integrity. We do not mix, dilute, or modify the fragrance. We also minimize air exposure during transfer to maintain freshness and reduce oxidation.
          </p>
        </div>
      )
    },
    {
      icon: Clock,
      question: "How long does a decant last?",
      answer: (
        <div className="space-y-4">
          <p>
            This depends on how frequently you use it. Below is an approximate spray count per size:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            <div className="bg-black border border-white/10 p-3 text-center rounded-sm">
              <span className="text-gold font-bold block text-sm">2ml</span>
              <span className="text-zinc-300 text-[11px]">≈ 25–30 sprays</span>
            </div>
            <div className="bg-black border border-white/10 p-3 text-center rounded-sm">
              <span className="text-gold font-bold block text-sm">5ml</span>
              <span className="text-zinc-300 text-[11px]">≈ 80–90 sprays</span>
            </div>
            <div className="bg-black border border-white/10 p-3 text-center rounded-sm">
              <span className="text-gold font-bold block text-sm">8ml</span>
              <span className="text-zinc-300 text-[11px]">≈ 130–140 sprays</span>
            </div>
            <div className="bg-black border border-white/10 p-3 text-center rounded-sm">
              <span className="text-gold font-bold block text-sm">10ml</span>
              <span className="text-zinc-300 text-[11px]">≈ 160–170 sprays</span>
            </div>
            <div className="bg-black border border-white/10 p-3 text-center rounded-sm col-span-2 sm:col-span-1">
              <span className="text-gold font-bold block text-sm">15ml</span>
              <span className="text-zinc-300 text-[11px]">≈ 250–280 sprays</span>
            </div>
          </div>

          <p className="text-zinc-300">
            If you follow the standard 5-spray method per occasion — two sprays behind the ears, two on the wrists, and one on clothing (usually the chest) — your decant will last several wears depending on the size.
          </p>
          <p className="text-amber-200/90 text-xs">
            ✨ When stored properly, a decant can maintain its quality for approximately 6 to 12 months.
          </p>
        </div>
      )
    },
    {
      icon: HelpCircle,
      question: "What is the best way to store my decant?",
      answer: (
        <p>
          Store your decants in a cool, dry place away from direct sunlight and heat. Avoid areas with high humidity. A drawer, cabinet, or closet is ideal. Always keep the bottle upright to reduce the risk of leakage and preserve the fragrance quality.
        </p>
      )
    },
    {
      icon: Truck,
      question: "Where do you ship?",
      answer: (
        <div className="space-y-2">
          <p>
            We deliver nationwide across Bangladesh through Pathao courier. Cash on Delivery is available.
          </p>
          <p className="text-amber-300 text-xs font-mono">
            * For first-time customers, the shipping charge must be paid in advance to confirm the order.
          </p>
        </div>
      )
    },
    {
      icon: Truck,
      question: "What is the shipping cost?",
      answer: (
        <div className="flex flex-col sm:flex-row gap-4 font-sans text-xs">
          <div className="bg-black border border-gold/30 px-4 py-3 rounded-sm flex items-center gap-3">
            <span className="text-gold font-bold text-base">80 TK</span>
            <span className="text-zinc-300">Inside Dhaka</span>
          </div>
          <div className="bg-black border border-gold/30 px-4 py-3 rounded-sm flex items-center gap-3">
            <span className="text-gold font-bold text-base">120 TK</span>
            <span className="text-zinc-300">Outside Dhaka</span>
          </div>
        </div>
      )
    },
    {
      icon: RefreshCw,
      question: "Do you have a return policy?",
      answer: (
        <div className="space-y-3">
          <p>
            Due to the nature of fragrance decants, returns for change of mind are not accepted once the package has been opened.
          </p>
          <div className="bg-black/50 border border-white/10 p-4 rounded-sm space-y-2">
            <p className="text-gold font-semibold uppercase text-xs">We will accept return requests only if:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1">
              <li>You receive an incorrect item</li>
              <li>The decant arrives damaged during shipping</li>
            </ul>
          </div>
          <div className="space-y-1 text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 p-3 rounded-sm">
            <p className="font-bold uppercase tracking-wider text-rose-400">Please note:</p>
            <p>• Opened or used decants cannot be returned</p>
            <p>• Items must be returned in their original condition and packaging</p>
            <p>• <strong>You must video record the unboxing process.</strong> Photos will not be considered sufficient proof of damage.</p>
          </div>
          <p className="text-zinc-400 text-xs">
            Please contact us immediately if your decant arrives damaged so we can assist you promptly.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16 relative py-10 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold block">
            NEED HELP?
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our authentic decants, bottling process, spray counts, shipping, and returns.
          </p>
        </div>

        {/* Accordion FAQ list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <div 
                key={index}
                className="bg-zinc-900/90 border border-zinc-700/60 hover:border-gold/40 rounded-sm overflow-hidden transition-all duration-300 shadow-xl"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer focus:outline-none group"
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <Icon className="w-5 h-5 text-gold shrink-0 group-hover:scale-110 transition-transform" />
                    <h3 className="text-sm sm:text-base font-serif font-medium text-luxury-white group-hover:text-gold transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm font-sans font-light text-zinc-300 leading-relaxed border-t border-zinc-800 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-16 bg-zinc-900/95 border border-zinc-700/70 p-8 rounded-sm text-center space-y-4 shadow-2xl">
          <h3 className="text-lg font-serif text-gold tracking-wide uppercase">Still Have Questions?</h3>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
            Our fragrance concierge team is here to assist you with any inquiries or recommendations.
          </p>
          <div className="pt-2">
            <a 
              href="/contact-us" 
              className="inline-block border border-gold bg-gold hover:bg-gold/80 text-black px-6 py-3 text-xs uppercase font-sans font-bold tracking-widest transition-all rounded-xs shadow-md"
            >
              Contact Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
