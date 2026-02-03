"use client";

import Link from "next/link";

const PricingPlans = () => {
  const plans = [
    {
      name: "Starter",
      price: "$50",
      period: "per day",
      description: "Perfect for beginners who want to test the waters",
      features: [
        "1 ASIC Miner",
        "Up to 50 TH/s",
        "Daily Payouts",
        "Basic Dashboard",
        "Email Support",
        "7/24 Mining",
      ],
      popular: false,
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$200",
      period: "per day",
      description: "Ideal for serious miners looking for better returns",
      features: [
        "3 ASIC Miners",
        "Up to 200 TH/s",
        "Daily Payouts",
        "Advanced Dashboard",
        "Priority Support",
        "7/24 Mining",
        "Performance Analytics",
      ],
      popular: true,
      cta: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "$500",
      period: "per day",
      description: "For large-scale operations and maximum profitability",
      features: [
        "10+ ASIC Miners",
        "Up to 1 PH/s",
        "Daily Payouts",
        "Enterprise Dashboard",
        "Dedicated Support",
        "7/24 Mining",
        "Performance Analytics",
        "Custom Configurations",
        "Volume Discounts",
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Flexible pricing plans to suit miners of all levels. Start small and scale up as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass rounded-2xl p-8 card-hover relative animate-fade-in-up ${
                plan.popular ? "border-2 border-gold" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-gold text-background text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-foreground-muted text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold gradient-text">
                    {plan.price}
                  </span>
                  <span className="text-foreground-muted text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gold shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-foreground-muted text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`block w-full text-center py-4 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? "btn-gold"
                    : "btn-outline"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-foreground-muted mb-4">
            All plans include secure wallet integration and real-time monitoring
          </p>
          <Link
            href="/machines"
            className="text-gold hover:text-gold-light transition-colors font-semibold inline-flex items-center gap-2"
          >
            View All Machines
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;

