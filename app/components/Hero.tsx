"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Hero = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    dailyPayouts: 0,
    totalPayouts: 0,
  });

  const targetStats = {
    totalUsers: 5820,
    totalDeposits: 1685200,
    dailyPayouts: 15320,
    totalPayouts: 820150,
  };

  useEffect(() => {
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
      title: "Create Account",
      description: "Sign up easily. Get started fast. Access professional mining equipment.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      title: "Rent a Machine",
      description: "Browse our catalog of ASIC miners and GPU rigs. Choose your rental period.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Earn Profits",
      description: "Your machine mines 24/7. Receive earnings directly to your wallet.",
    },
  ];

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Floating Elements */}
      <div className="absolute top-40 right-20 w-64 h-64 opacity-20 animate-float hidden lg:block">
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="30" stroke="var(--gold)" strokeWidth="1" />
          <circle cx="32" cy="32" r="20" stroke="var(--gold)" strokeWidth="0.5" />
          <path d="M32 12V52M12 32H52" stroke="var(--gold)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Rent Mining Machines{" "}
                <span className="gradient-text">Earn Daily</span>
              </h1>
              <p className="text-lg text-foreground-muted max-w-lg">
                Access enterprise-grade mining hardware without the hassle. Rent professional ASIC miners and GPU rigs to earn passive crypto income.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="btn-gold px-8 py-4 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2"
              >
                Start Mining
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="btn-outline px-8 py-4 rounded-xl text-base font-semibold tracking-wide inline-flex items-center gap-2"
              >
                Learn More
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Content - Bitcoin/Mining Visual */}
          <div className="relative hidden lg:block animate-fade-in-up stagger-2">
            <div className="relative w-full h-96">
              {/* Server Rack Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main Bitcoin Icon */}
                  <div className="w-48 h-48 rounded-full bg-linear-to-br from-gold/30 to-gold/10 flex items-center justify-center animate-pulse-gold">
                    <div className="w-36 h-36 rounded-full bg-linear-to-br from-gold to-gold-dark flex items-center justify-center">
                      <svg className="w-20 h-20 text-background" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.5 11.5V7.5H12.75C13.4375 7.5 14 8.0625 14 8.75V10.25C14 10.9375 13.4375 11.5 12.75 11.5H11.5ZM11.5 12.5H12.75C13.4375 12.5 14 13.0625 14 13.75V15.25C14 15.9375 13.4375 16.5 12.75 16.5H11.5V12.5ZM9 12C9 7.03125 13.0312 3 18 3V5C14.1328 5 11 8.13281 11 12H13L9.5 16L6 12H9ZM15 12C15 16.9688 10.9688 21 6 21V19C9.86719 19 13 15.8672 13 12H11L14.5 8L18 12H15Z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Floating coins */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gold flex items-center justify-center text-background font-bold animate-float" style={{ animationDelay: "0.5s" }}>
                    ₿
                  </div>
                  <div className="absolute bottom-0 -left-8 w-10 h-10 rounded-full bg-gold/80 flex items-center justify-center text-background font-bold animate-float" style={{ animationDelay: "1s" }}>
                    $
                  </div>
                  <div className="absolute top-1/2 -right-12 w-8 h-8 rounded-full bg-gold/60 flex items-center justify-center text-background text-sm font-bold animate-float" style={{ animationDelay: "1.5s" }}>
                    Ξ
                  </div>
                </div>
              </div>

              {/* Decorative lines */}
              <div className="absolute top-10 left-10 w-32 h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
              <div className="absolute bottom-10 right-10 w-32 h-0.5 bg-gradient-to-l from-gold/50 to-transparent" />
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
                Total Users
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
                Total Deposits
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
                Daily Payouts
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
                Total Payouts
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

