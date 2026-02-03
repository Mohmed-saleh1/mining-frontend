"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations('hero');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    dailyPayouts: 0,
    totalPayouts: 0,
  });

  useEffect(() => {
    const targetStats = {
      totalUsers: 5820,
      totalDeposits: 1685200,
      dailyPayouts: 15320,
      totalPayouts: 820150,
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setStats({
        totalUsers: Math.floor(targetStats.totalUsers * easeOut),
        totalDeposits: Math.floor(targetStats.totalDeposits * easeOut),
        dailyPayouts: Math.floor(targetStats.dailyPayouts * easeOut),
        totalPayouts: Math.floor(targetStats.totalPayouts * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targetStats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  const formatCurrency = (num: number) => {
    return "$" + num.toLocaleString("en-US");
  };

  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      title: t('steps.createAccount.title'),
      description: t('steps.createAccount.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      title: t('steps.rentMachine.title'),
      description: t('steps.rentMachine.description'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('steps.earnProfits.title'),
      description: t('steps.earnProfits.description'),
    },
  ];

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-slow hidden lg:block" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      
      {/* Floating Geometric Elements */}
      <div className="absolute top-32 right-20 w-20 h-20 opacity-10 animate-float hidden lg:block">
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <rect x="16" y="16" width="32" height="32" stroke="var(--gold)" strokeWidth="2" transform="rotate(45 32 32)" />
        </svg>
      </div>
      <div className="absolute bottom-32 left-20 w-16 h-16 opacity-10 animate-float hidden lg:block" style={{ animationDelay: "0.5s" }}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="24" stroke="var(--gold)" strokeWidth="2" />
          <circle cx="32" cy="32" r="16" stroke="var(--gold)" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold/20 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-sm text-foreground-muted">
                {t('trustBadge', { count: '5,800+' })}
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                {t('title')}
                <br />
                <span className="gradient-text">{t('titleHighlight')}</span>
              </h1>
              <p className="text-xl text-foreground-muted max-w-xl leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gold">{t('features.mining247')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gold">{t('features.dailyPayouts')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gold">{t('features.noSetup')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/register"
                className="btn-gold px-8 py-4 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2 group"
              >
                {t('cta.startMining')}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="btn-outline px-8 py-4 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2 group"
              >
                {t('cta.howItWorks')}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Content - 3D Mining Visual */}
          <div className="relative hidden lg:block animate-fade-in-up stagger-2">
            <div className="relative w-full h-[500px]">
              {/* Main Center Piece - Mining Rig */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Large Glowing Circle */}
                  <div className="w-72 h-72 rounded-full bg-linear-to-br from-gold/20 via-gold/10 to-transparent flex items-center justify-center animate-pulse-gold">
                    {/* Inner Circle */}
                    <div className="w-56 h-56 rounded-full bg-linear-to-br from-gold/30 via-gold/20 to-gold/10 flex items-center justify-center relative">
                      {/* Core Mining Icon */}
                      <div className="w-40 h-40 rounded-2xl bg-linear-to-br from-gold to-gold-dark flex items-center justify-center rotate-12 shadow-2xl glow-gold">
                        <svg className="w-24 h-24 text-background" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6"/>
                          <path d="M8 10l4 2 4-2M8 14l4 2 4-2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
                        </svg>
                      </div>
                      {/* Orbital Lines */}
                      <div className="absolute inset-0 rounded-full border border-gold/30 animate-spin-slow" />
                      <div className="absolute inset-4 rounded-full border border-gold/20 animate-spin-slower" />
                    </div>
                  </div>
                  
                  {/* Floating Crypto Coins */}
                  <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-linear-to-br from-gold to-gold-dark flex items-center justify-center text-background font-bold text-2xl shadow-lg animate-float" style={{ animationDelay: "0s" }}>
                    ₿
                  </div>
                  <div className="absolute top-1/4 -left-12 w-14 h-14 rounded-full bg-linear-to-br from-gold-light to-gold flex items-center justify-center text-background font-bold text-xl shadow-lg animate-float" style={{ animationDelay: "0.7s" }}>
                    Ξ
                  </div>
                  <div className="absolute bottom-8 -right-6 w-12 h-12 rounded-full bg-linear-to-br from-gold to-gold-dark/80 flex items-center justify-center text-background font-bold text-lg shadow-lg animate-float" style={{ animationDelay: "1.4s" }}>
                    $
                  </div>
                  <div className="absolute -bottom-6 left-1/4 w-10 h-10 rounded-full bg-linear-to-br from-gold-light/80 to-gold/80 flex items-center justify-center text-background font-bold shadow-lg animate-float" style={{ animationDelay: "2.1s" }}>
                    ᐊ
                  </div>

                  {/* Data Streams */}
                  <div className="absolute top-0 right-20 flex flex-col gap-1 animate-pulse">
                    <div className="w-24 h-1 bg-linear-to-r from-gold via-gold-light to-transparent rounded-full" />
                    <div className="w-20 h-1 bg-linear-to-r from-gold via-gold-light to-transparent rounded-full" />
                    <div className="w-16 h-1 bg-linear-to-r from-gold via-gold-light to-transparent rounded-full" />
                  </div>
                  <div className="absolute bottom-12 left-16 flex flex-col gap-1 animate-pulse" style={{ animationDelay: "0.5s" }}>
                    <div className="w-24 h-1 bg-linear-to-l from-gold via-gold-light to-transparent rounded-full" />
                    <div className="w-20 h-1 bg-linear-to-l from-gold via-gold-light to-transparent rounded-full" />
                    <div className="w-16 h-1 bg-linear-to-l from-gold via-gold-light to-transparent rounded-full" />
                  </div>
                </div>
              </div>

              {/* Corner Accent Lines */}
              <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-gold/30 rounded-tl-lg" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gold/30 rounded-br-lg" />
            </div>
          </div>
        </div>

        {/* Steps Cards */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="glass rounded-2xl p-6 card-hover animate-fade-in-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 glass rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-foreground-muted text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('stats.totalUsers')}
              </div>
              <div className="text-3xl font-bold gradient-text animate-count-up">
                {formatNumber(stats.totalUsers)}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-foreground-muted text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('stats.totalDeposits')}
              </div>
              <div className="text-3xl font-bold gradient-text animate-count-up">
                {formatCurrency(stats.totalDeposits)}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-foreground-muted text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('stats.dailyPayouts')}
              </div>
              <div className="text-3xl font-bold gradient-text animate-count-up">
                {formatCurrency(stats.dailyPayouts)}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-foreground-muted text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('stats.totalPayouts')}
              </div>
              <div className="text-3xl font-bold gradient-text animate-count-up">
                {formatCurrency(stats.totalPayouts)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

