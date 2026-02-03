"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const FAQ = () => {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('items.howDoesCloudMiningWork.question'),
      answer: t('items.howDoesCloudMiningWork.answer'),
    },
    {
      question: t('items.whatCryptocurrencies.question'),
      answer: t('items.whatCryptocurrencies.answer'),
    },
    {
      question: t('items.howArePayoutsCalculated.question'),
      answer: t('items.howArePayoutsCalculated.answer'),
    },
    {
      question: t('items.whatIfMachineBreaks.question'),
      answer: t('items.whatIfMachineBreaks.answer'),
    },
    {
      question: t('items.canICancelRental.question'),
      answer: t('items.canICancelRental.answer'),
    },
    {
      question: t('items.minimumRentalPeriod.question'),
      answer: t('items.minimumRentalPeriod.answer'),
    },
    {
      question: t('items.howToTrackPerformance.question'),
      answer: t('items.howToTrackPerformance.answer'),
    },
    {
      question: t('items.hiddenFees.question'),
      answer: t('items.hiddenFees.answer'),
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
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            {t('description')}
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
            {t('stillHaveQuestions')}
          </p>
          <Link
            href="/contact"
            className="btn-outline px-8 py-3 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2 group"
          >
            {t('contactSupport')}
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

