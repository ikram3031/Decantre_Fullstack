import React from 'react';
import { Star, Sparkles, UserCheck, ShieldCheck, Heart, Award } from 'lucide-react';

export const AboutUs = () => {
  const marqueeItems = [
    "270+ Designer & Niche Fragrances",
    "20+ Renowned Niche Houses",
    "Exclusively Sourced from Germany, the UK & UAE Markets",
    "Imported Travel Atomizers"
  ];

  const teamMembers = [
    {
      name: "Saad Ebna Azad",
      role: "Founder & CEO",
      badge: "Visionary & Founder",
      bio: "The heart and vision behind Decantre. With an unshakable passion for perfumery and a relentless drive to innovate, Saad laid the foundation for what we are today. His leadership fuels our mission to bring luxury scents within reach, one decant at a time."
    },
    {
      name: "Rezwana Swarnali",
      role: "Head of Social Media & Content Lead",
      badge: "Brand Voice & Content",
      bio: "The heart and energy behind our digital presence, she has been part of Decantre since day one, playing a vital role in shaping who we are today. She manages all our social platforms and defines Decantre’s unique voice online. From every reel to every post, her creativity ensures that Decantre always feels engaging and authentic."
    },
    {
      name: "Sabit Ahmed",
      role: "Co-Founder & Strategic Advisor",
      badge: "Strategy & Guidance",
      bio: "The mind behind the strategy. Sabit brings a wealth of insight and steady guidance to the team, ensuring we grow with purpose and stay true to our vision. His advice is our compass in a constantly evolving fragrance market."
    },
    {
      name: "Farhan Sadik",
      role: "Creative Director",
      badge: "Visuals & Design",
      bio: "The lens through which our brand comes alive. Farhan is the creative force behind every video shoot, product photo, and visual detail you see. From crafting ideas for photoshoots to editing content with precision, he ensures Decantre always looks and feels exceptional."
    }
  ];

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 relative py-10 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold block">
            ESTABLISHED IN DHAKA, BANGLADESH
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide uppercase">
            ABOUT DECANTRE
          </h1>
          <p className="text-zinc-300 text-xs sm:text-base font-sans font-light max-w-3xl mx-auto leading-relaxed pt-2">
            Decantre is a perfume decanting business based in Dhaka, Bangladesh, where our passion for scent meets a deep commitment to quality, authenticity, and accessibility. Every perfume we offer is carefully sourced from top boutiques across Germany, the UK, and the UAE, along with trusted retailers in Bangladesh.
          </p>
        </div>

        {/* Highlight Ticker / Marquee Banner */}
        <div className="mb-20 overflow-hidden bg-black/80 border border-gold/30 rounded-sm py-4 relative shadow-2xl">
          <div className="flex w-max animate-marquee space-x-8 items-center text-xs sm:text-sm font-serif tracking-widest text-gold uppercase">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="whitespace-nowrap flex items-center gap-3">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold/30 shrink-0" />
                  <span>{item}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Narrative & Mission Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 bg-luxury-dark/30 border border-white/5 p-8 sm:p-12 rounded-sm shadow-xl">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold">
              THE FRAGRANCE LIBRARY
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-light text-luxury-white uppercase">
              PURE, JOYFUL SCENT DISCOVERY
            </h2>
            <div className="h-[1px] w-16 bg-gold/50"></div>
            
            <p className="text-zinc-300 text-sm sm:text-base font-sans font-light leading-relaxed">
              We created Decantre to be a space where you can freely explore, experiment, and fall in love with scents — without investing in a full bottle right away. Think of us as your personal fragrance library, where every “book” is a meticulously decanted perfume waiting to be discovered.
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
              No more shelves filled with half-used bottles. No more second-guessing. Just pure, joyful scent discovery — tailored to your curiosity. So go ahead, take a sniff, and let your senses lead the way. Your next favorite fragrance is just a decant away.
            </p>
          </div>

          <div className="lg:col-span-5 bg-black/60 border border-gold/25 p-6 sm:p-8 rounded-sm space-y-5">
            <h3 className="text-xs font-serif text-gold font-semibold tracking-widest uppercase border-b border-white/10 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              OUR GUARANTEE
            </h3>
            
            <ul className="space-y-4 text-xs font-sans font-light text-zinc-300">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span><strong>100% Authentic:</strong> Never diluted, never reformulated, and never mixed with oils.</span>
              </li>
              <li className="flex items-start gap-3">
                <Award className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span><strong>Global Sourcing:</strong> Direct from Germany, UK, UAE & verified BD boutiques.</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span><strong>Precision Bottling:</strong> Decanted into glass atomizers under clean sterile conditions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="border-t border-gold/15 pt-16 mb-20 space-y-6 max-w-4xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold">
            THE BEGINNING
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white uppercase tracking-wide">
            OUR STORY
          </h2>
          <div className="h-[1px] w-12 bg-gold/40 mx-auto"></div>
          <p className="text-zinc-300 text-sm sm:text-lg font-serif font-light leading-relaxed italic pt-2">
            “Every scent tells a story and ours began not in a grand atelier, but in a quiet corner, fueled by a simple frustration: the desire to explore the vast, enchanting world of fragrances without committing to a full bottle. We’ve all been there, haven’t we? That fleeting moment of fascination with a new perfume, only to hesitate at the price tag, wondering if it’s truly you. That question sparked the idea for Decantre.”
          </p>
        </div>

        {/* OUR TEAM Section */}
        <div className="border-t border-gold/15 pt-16 mb-12">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold">
              THE PEOPLE BEHIND THE SCENTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-luxury-white uppercase">
              OUR TEAM
            </h2>
            <div className="h-[1px] w-12 bg-gold/40 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div 
                key={member.name}
                className="bg-luxury-dark/20 p-8 border border-white/10 hover:border-gold/40 rounded-sm space-y-4 transition-all duration-300 shadow-lg group"
              >
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-luxury-white group-hover:text-gold transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-sans text-gold tracking-widest uppercase mt-0.5 font-medium">
                      {member.role}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono tracking-wider bg-gold/10 text-gold border border-gold/30 px-2.5 py-1 rounded-xs uppercase">
                    {member.badge}
                  </span>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;

