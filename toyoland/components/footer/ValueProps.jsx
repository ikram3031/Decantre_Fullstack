'use client';

import { Globe, RefreshCw, ShieldCheck, Headset } from 'lucide-react';

// 4-Column Value Proposition section matching screenshot exact text & icons
export default function ValueProps() {
  const props = [
    {
      icon: Globe,
      title: 'Shipping Worldwide',
      description: 'Special financing and earn rewards.',
      bg: 'bg-[#FF6B6B]/15 text-[#FF6B6B]',
    },
    {
      icon: RefreshCw,
      title: '14 Days Return',
      description: '14-days free return policy.',
      bg: 'bg-[#4ECDC4]/15 text-[#4ECDC4]',
    },
    {
      icon: ShieldCheck,
      title: 'Security Payment',
      description: 'We accept all major credit cards.',
      bg: 'bg-[#FFD93D]/25 text-[#2D2D2D]',
    },
    {
      icon: Headset,
      title: '24/7 Support',
      description: "Your customers like they're ours.",
      bg: 'bg-[#16A34A]/15 text-[#16A34A]',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t-2 border-b-2 border-[#EEEEEE]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
        {props.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading font-black text-sm text-[#2D2D2D]">
                  {item.title}
                </h4>
                <p className="text-xs text-[#666666] leading-normal font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
