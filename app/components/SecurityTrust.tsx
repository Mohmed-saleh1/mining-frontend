"use client";

import { useTranslations } from "next-intl";

const SecurityTrust = () => {
  const t = useTranslations('securityTrust');
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t('features.sslEncryption.title'),
      description: t('features.sslEncryption.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('features.coldStorage.title'),
      description: t('features.coldStorage.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('features.twoFA.title'),
      description: t('features.twoFA.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('features.regularAudits.title'),
      description: t('features.regularAudits.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('features.insurance.title'),
      description: t('features.insurance.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('features.compliance.title'),
      description: t('features.compliance.description'),
    },
  ];

  const certifications = [
    { name: t('certifications.iso27001.name'), description: t('certifications.iso27001.description') },
    { name: t('certifications.soc2.name'), description: t('certifications.soc2.description') },
    { name: t('certifications.gdpr.name'), description: t('certifications.gdpr.description') },
    { name: t('certifications.pciDss.name'), description: t('certifications.pciDss.description') },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-foreground-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="glass rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            {t('certifications.title')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={cert.name}
                className="text-center p-4 rounded-xl bg-background-secondary border border-border"
              >
                <div className="text-2xl font-bold text-gold mb-2">
                  {cert.name}
                </div>
                <div className="text-sm text-foreground-muted">
                  {cert.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrust;

