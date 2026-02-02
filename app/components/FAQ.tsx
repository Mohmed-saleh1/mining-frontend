"use client";

import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does cloud mining work?",
      answer: "Cloud mining allows you to rent mining hardware remotely without purchasing or maintaining physical equipment. You pay a rental fee, and we handle all the technical aspects including setup, maintenance, and electricity costs. Your rented machine mines cryptocurrency 24/7, and you receive daily payouts based on the mining performance.",
    },
    {
      question: "What cryptocurrencies can I mine?",
      answer: "We support mining for Bitcoin, Ethereum, Litecoin, and other major cryptocurrencies. The specific coins depend on the machine you rent. ASIC miners are typically optimized for Bitcoin, while GPU rigs can mine various altcoins. Check each machine's specifications to see which coins it supports.",
    },
    {
      question: "How are payouts calculated?",
      answer: "Payouts are calculated based on the actual mining performance of your rented machine, current cryptocurrency prices, and network difficulty. We use real-time data to ensure accurate calculations. Daily payouts are automatically sent to your wallet address, minus the rental fee.",
    },
    {
      question: "What happens if a machine breaks down?",
      answer: "We maintain a 99.9% uptime guarantee. If a machine experiences issues, our technical team immediately switches your rental to a backup machine to ensure continuous mining. You won't lose any mining time, and we handle all maintenance automatically.",
    },
    {
      question: "Can I cancel my rental?",
      answer: "Yes, you can cancel your rental at any time. However, rental fees are non-refundable for the current period. Once the current rental period ends, your machine will be released and no further charges will apply. You can always rent again in the future.",
    },
    {
      question: "Is there a minimum rental period?",
      answer: "Yes, the minimum rental period is 1 day. You can rent machines for daily, weekly, or monthly periods. Longer rental periods often come with discounted rates. Check the pricing details for each machine to see available rental options.",
    },
    {
      question: "How do I track my mining performance?",
      answer: "Once you rent a machine, you'll have access to a comprehensive dashboard showing real-time mining statistics, including hash rate, earnings, payout history, and machine status. You can monitor everything from your account dashboard 24/7.",
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, we believe in transparent pricing. The rental fee you see is the only fee you pay. There are no setup fees, maintenance fees, or withdrawal fees. The only exception is network transaction fees for cryptocurrency transfers, which are standard blockchain fees.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Find answers to common questions about our platform and cloud mining
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-2xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-background-secondary/50 transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gold transition-transform shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 pt-0">
                  <p className="text-foreground-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
          <p className="text-foreground-muted mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="btn-outline px-8 py-3 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2 group"
          >
            Contact Support
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
