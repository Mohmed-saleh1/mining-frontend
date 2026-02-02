"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { miningMachinesPublicApi, MiningMachine } from "@/app/lib/api";

export default function FeaturedMachines() {
  const [machines, setMachines] = useState<MiningMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedMachines = async () => {
      try {
        const response = await miningMachinesPublicApi.getFeatured();
        const machinesData = response.data || [];
        setMachines(Array.isArray(machinesData) ? machinesData.slice(0, 3) : []); // Show only top 3
      } catch (err) {
        console.error("Failed to fetch featured machines:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMachines();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Featured Mining <span className="gradient-text">Machines</span>
            </h2>
            <p className="text-foreground-muted text-lg">
              Our most popular and profitable mining machines
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-background-secondary/50 rounded-xl mb-4" />
                <div className="h-6 bg-background-secondary/50 rounded mb-2" />
                <div className="h-4 bg-background-secondary/50 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (machines.length === 0) {
    return null; // Don't show section if no featured machines
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured Mining <span className="gradient-text">Machines</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            Our most popular and profitable mining machines, ready to start earning for you 24/7
          </p>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {machines.map((machine, index) => (
            <div
              key={machine.id}
              className="glass rounded-2xl overflow-hidden card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Machine Image */}
              <div className="relative h-48 bg-linear-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                {machine.image ? (
                  <img
                    src={machine.image}
                    alt={machine.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-20 h-20 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                )}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gold text-background text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </div>
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass border border-gold/20 text-gold text-xs font-semibold uppercase">
                  {machine.type}
                </div>
              </div>

              {/* Machine Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{machine.name}</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  {machine.manufacturer} {machine.model}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs text-foreground-muted">
                      {machine.hashRate} {machine.hashRateUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span className="text-xs text-foreground-muted">{machine.powerConsumption}W</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-foreground-muted">{machine.miningCoin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-xs text-foreground-muted">{machine.algorithm}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-foreground-muted">Daily Rate</span>
                    <span className="text-lg font-bold text-gold">${machine.pricePerDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Est. Daily Profit</span>
                    <span className="text-sm font-semibold text-green">${machine.profitPerDay}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/register"
                  className="block w-full btn-gold px-4 py-3 rounded-xl text-sm font-semibold text-center"
                >
                  Rent Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            href="/machines"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-semibold"
          >
            View All Machines
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

