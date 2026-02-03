"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AboutPage() {
  const t = useTranslations('about');
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      title: t('features.items.enterpriseHardware.title'),
      description: t('features.items.enterpriseHardware.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('features.items.optimizedPerformance.title'),
      description: t('features.items.optimizedPerformance.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('features.items.flexibleRentalPlans.title'),
      description: t('features.items.flexibleRentalPlans.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('features.items.secureTransparent.title'),
      description: t('features.items.secureTransparent.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('features.items.expertSupport.title'),
      description: t('features.items.expertSupport.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('features.items.globalInfrastructure.title'),
      description: t('features.items.globalInfrastructure.description'),
    },
  ];

  const stats = [
    { value: "50K+", label: t('stats.activeMiners') },
    { value: "99.9%", label: t('stats.uptime') },
    { value: "15+", label: t('stats.countries') },
    { value: "$100M+", label: t('stats.paidOut') },
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      description: "10+ years in blockchain technology and cryptocurrency mining operations.",
    },
    {
      name: "Sarah Mitchell",
      role: "CTO",
      description: "Former Google engineer specializing in distributed systems and infrastructure.",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Operations",
      description: "Expert in large-scale mining facility management and optimization.",
    },
  ];

  return (
    <div className="min-h-screen main-bg relative">
      <div className="starfield" />
      <div className="golden-particles" />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up">
              {t('title')}{" "}
              <span className="gradient-text">{t('titleHighlight')}</span>
            </h1>
            <p className="mt-6 text-lg text-foreground-muted max-w-3xl mx-auto animate-fade-in-up stagger-1">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 lg:p-12 animate-fade-in-up">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  {t('mission.title')} <span className="gradient-text">{t('mission.titleHighlight')}</span>
                </h2>
                <p className="text-foreground-muted leading-relaxed mb-6">
                  {t('mission.description1')}
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  {t('mission.description2')}
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square relative">
                  {/* Mining Rig Visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-gold/5 rounded-3xl animate-pulse-gold" />
                      <div className="absolute inset-4 glass rounded-2xl flex items-center justify-center">
                        <svg className="w-24 h-24 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center animate-float" style={{ animationDelay: "0s" }}>
                        <span className="text-gold font-bold">₿</span>
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                        <span className="text-gold font-bold text-sm">Ξ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              {t('features.title')} <span className="gradient-text">{t('features.titleHighlight')}</span>?
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto animate-fade-in-up stagger-1">
              {t('features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              {t('howItWorks.title')} <span className="gradient-text">{t('howItWorks.titleHighlight')}</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto animate-fade-in-up stagger-1">
              {t('howItWorks.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: t('howItWorks.steps.step1.step'), title: t('howItWorks.steps.step1.title'), description: t('howItWorks.steps.step1.description') },
              { step: t('howItWorks.steps.step2.step'), title: t('howItWorks.steps.step2.title'), description: t('howItWorks.steps.step2.description') },
              { step: t('howItWorks.steps.step3.step'), title: t('howItWorks.steps.step3.title'), description: t('howItWorks.steps.step3.description') },
              { step: t('howItWorks.steps.step4.step'), title: t('howItWorks.steps.step4.title'), description: t('howItWorks.steps.step4.description') },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground-muted">{item.description}</p>
                
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 animate-fade-in-up">
              {t('team.title')} <span className="gradient-text">{t('team.titleHighlight')}</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto animate-fade-in-up stagger-1">
              {t('team.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="glass rounded-2xl p-8 text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold/20 border-2 border-gold/30 flex items-center justify-center">
                  <span className="text-3xl font-bold gradient-text">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-gold text-sm mb-3">{member.role}</p>
                <p className="text-sm text-foreground-muted">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 lg:p-12 text-center animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('cta.title')} <span className="gradient-text">{t('cta.titleHighlight')}</span>?
            </h2>
            <p className="text-foreground-muted mb-8 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="btn-gold px-8 py-4 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2"
              >
                {t('cta.getStarted')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="btn-outline px-8 py-4 rounded-xl text-base font-semibold tracking-wide"
              >
                {t('cta.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
