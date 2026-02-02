"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { miningMachinesPublicApi, MiningMachine, ApiError } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function MachineDetailsPage() {
  const params = useParams();
  const [machine, setMachine] = useState<MiningMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        setIsLoading(true);
        const response = await miningMachinesPublicApi.getOne(params.id as string);
        setMachine(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load machine details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMachine();
    }
  }, [params.id]);

  return (
    <div className="min-h-screen main-bg relative">
      <div className="starfield" />
      <div className="golden-particles" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link
              href="/machines"
              className="inline-flex items-center gap-2 text-foreground-muted hover:text-gold transition-colors mb-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Machines
            </Link>

            {error ? (
              <div className="glass rounded-2xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
                <p className="text-foreground-muted mb-6">{error}</p>
                <Link href="/machines" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">
                  Browse Machines
                </Link>
              </div>
            ) : isLoading ? (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-2xl h-96 animate-pulse" />
                <div className="glass rounded-2xl p-8 space-y-4">
                  <div className="h-8 bg-background-secondary/50 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-background-secondary/50 rounded w-1/2 animate-pulse" />
                  <div className="h-32 bg-background-secondary/50 rounded animate-pulse" />
                </div>
              </div>
            ) : machine ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Machine Image */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="relative h-96 bg-linear-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                    {machine.image ? (
                      <img
                        src={machine.image}
                        alt={machine.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-32 h-32 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    )}
                    {machine.isFeatured && (
                      <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gold text-background text-sm font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full glass border border-gold/20 text-gold text-sm font-semibold uppercase">
                      {machine.type}
                    </div>
                  </div>
                </div>

                {/* Machine Details */}
                <div className="space-y-6">
                  <div className="glass rounded-2xl p-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{machine.name}</h1>
                    <p className="text-foreground-muted mb-4">
                      {machine.manufacturer} {machine.model}
                    </p>
                    {machine.description && (
                      <p className="text-foreground-muted text-sm leading-relaxed">{machine.description}</p>
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="glass rounded-2xl p-8">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      Specifications
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">Hash Rate</p>
                        <p className="text-lg font-bold text-gold">{machine.hashRate} {machine.hashRateUnit}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">Power Consumption</p>
                        <p className="text-lg font-bold text-foreground">{machine.powerConsumption}W</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">Algorithm</p>
                        <p className="text-lg font-bold text-foreground">{machine.algorithm || "N/A"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">Mining Coin</p>
                        <p className="text-lg font-bold text-foreground">{machine.miningCoin || "N/A"}</p>
                      </div>
                      {machine.efficiency && (
                        <div className="p-4 rounded-xl bg-background-secondary/50 col-span-2">
                          <p className="text-xs text-foreground-muted mb-1">Efficiency</p>
                          <p className="text-lg font-bold text-foreground">{machine.efficiency} J/TH</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="glass rounded-2xl p-8">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pricing
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                        <p className="text-xs text-foreground-muted mb-1">Per Hour</p>
                        <p className="text-xl font-bold text-gold">${machine.pricePerHour}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                        <p className="text-xs text-foreground-muted mb-1">Per Day</p>
                        <p className="text-xl font-bold text-gold">${machine.pricePerDay}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                        <p className="text-xs text-foreground-muted mb-1">Per Week</p>
                        <p className="text-xl font-bold text-gold">${machine.pricePerWeek}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                        <p className="text-xs text-foreground-muted mb-1">Per Month</p>
                        <p className="text-xl font-bold text-gold">${machine.pricePerMonth}</p>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Estimated Profits
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-green/10">
                        <p className="text-xs text-foreground-muted">Daily Profit</p>
                        <p className="text-lg font-bold text-green">${machine.profitPerDay}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green/10">
                        <p className="text-xs text-foreground-muted">Monthly Profit</p>
                        <p className="text-lg font-bold text-green">${machine.profitPerMonth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="glass rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-foreground">Availability</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        machine.status === "available" 
                          ? "bg-green/20 text-green" 
                          : machine.status === "rented"
                          ? "bg-gold/20 text-gold"
                          : "bg-red/20 text-red"
                      }`}>
                        {machine.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-foreground-muted">Available Units</span>
                      <span className="text-lg font-bold text-foreground">
                        {machine.totalUnits - machine.rentedUnits} / {machine.totalUnits}
                      </span>
                    </div>
                    <div className="w-full bg-background-secondary/50 rounded-full h-2">
                      <div
                        className="bg-gold rounded-full h-2 transition-all"
                        style={{ width: `${((machine.totalUnits - machine.rentedUnits) / machine.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/register"
                    className="block w-full btn-gold px-6 py-4 rounded-xl text-lg font-semibold text-center"
                  >
                    Start Mining Now
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

