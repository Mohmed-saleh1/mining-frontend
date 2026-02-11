"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { miningMachinesPublicApi, subscriptionsApi, MiningMachine, PlanDuration, PaymentMethod, ApiError } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Disable static generation for pages that use useAuth
export const dynamic = 'force-dynamic';

export default function MachineDetailsPage() {
  const t = useTranslations('machines.details');
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [machine, setMachine] = useState<MiningMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Subscription form state
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('day');
  const [durationNumber, setDurationNumber] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const machineResponse = await miningMachinesPublicApi.getOne(params.id as string);
        setMachine(machineResponse.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t('failedToLoad'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Calculate total price
  const getUnitPrice = (): number => {
    if (!machine) return 0;
    switch (selectedDuration) {
      case 'day': return Number(machine.pricePerDay) || 0;
      case 'week': return Number(machine.pricePerWeek) || 0;
      case 'month': return Number(machine.pricePerMonth) || 0;
      default: return 0;
    }
  };

  const unitPrice = getUnitPrice();
  const totalPrice = unitPrice * durationNumber * quantity;

  const availableUnits = machine ? machine.totalUnits - machine.rentedUnits : 0;

  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    if (!machine) return;

    setIsSubscribing(true);
    setShowPaymentModal(false);

    try {
      const response = await subscriptionsApi.create({
        machineId: machine.id,
        duration: selectedDuration,
        number: durationNumber,
        quantity,
        paymentMethod,
      });
      // Redirect to payment page
      // Response is wrapped in { success, message, data: { subscription, paymentUrl }, timestamp }
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("No payment URL in response:", response);
        alert("Failed to get payment URL. Please try again.");
      }
    } catch (err) {
      console.error("Failed to create subscription:", err);
      alert("Failed to create subscription. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const durationLabels: Record<PlanDuration, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
  };

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
              {t('back')}
            </Link>

            {error ? (
              <div className="glass rounded-2xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-foreground mb-2">{t('error')}</h2>
                <p className="text-foreground-muted mb-6">{error}</p>
                <Link href="/machines" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold">
                  {t('browseMachines')}
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
                        {t('featured')}
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
                      {t('specifications')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">{t('hashRate')}</p>
                        <p className="text-lg font-bold text-gold">{machine.hashRate} {machine.hashRateUnit}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">{t('powerConsumption')}</p>
                        <p className="text-lg font-bold text-foreground">{machine.powerConsumption}W</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">{t('algorithm')}</p>
                        <p className="text-lg font-bold text-foreground">{machine.algorithm || "N/A"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background-secondary/50">
                        <p className="text-xs text-foreground-muted mb-1">{t('miningCoin')}</p>
                        <p className="text-lg font-bold text-foreground">{machine.miningCoin || "N/A"}</p>
                      </div>
                      {machine.efficiency && (
                        <div className="p-4 rounded-xl bg-background-secondary/50 col-span-2">
                          <p className="text-xs text-foreground-muted mb-1">{t('efficiency')}</p>
                          <p className="text-lg font-bold text-foreground">{machine.efficiency} J/TH</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated Profits */}
                  <div className="glass rounded-2xl p-8">
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {t('estimatedProfits')}
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-green/10">
                        <p className="text-xs text-foreground-muted">{t('dailyProfit')}</p>
                        <p className="text-lg font-bold text-green">${machine.profitPerDay}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green/10">
                        <p className="text-xs text-foreground-muted">{t('monthlyProfit')}</p>
                        <p className="text-lg font-bold text-green">${machine.profitPerMonth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="glass rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-foreground">{t('availability')}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        machine.status === "available" 
                          ? "bg-green/20 text-green" 
                          : machine.status === "rented"
                          ? "bg-gold/20 text-gold"
                          : "bg-red/20 text-red"
                      }`}>
                        {machine.status === "available" ? t('status.available') :
                         machine.status === "rented" ? t('status.rented') :
                         t('status.unavailable')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-foreground-muted">{t('availableUnits')}</span>
                      <span className="text-lg font-bold text-foreground">
                        {availableUnits} / {machine.totalUnits}
                      </span>
                    </div>
                    <div className="w-full bg-background-secondary/50 rounded-full h-2">
                      <div
                        className="bg-gold rounded-full h-2 transition-all"
                        style={{ width: `${(availableUnits / machine.totalUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Subscribe Section */}
            {machine && machine.status !== 'maintenance' && availableUnits > 0 && (
              <div className="mt-8">
                <div className="glass rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Subscribe to This Machine
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Configuration */}
                    <div className="space-y-6">
                      {/* Duration Type Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">
                          Duration Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['day', 'week', 'month'] as PlanDuration[]).map((dur) => {
                            const price = dur === 'day' ? machine.pricePerDay : dur === 'week' ? machine.pricePerWeek : machine.pricePerMonth;
                            return (
                              <button
                                key={dur}
                                onClick={() => { setSelectedDuration(dur); setDurationNumber(1); }}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${
                                  selectedDuration === dur
                                    ? 'border-gold bg-gold/10'
                                    : 'border-border hover:border-gold/40'
                                }`}
                              >
                                <p className="font-bold text-foreground capitalize">{durationLabels[dur]}</p>
                                <p className="text-gold font-semibold text-lg">${price}</p>
                                <p className="text-xs text-foreground-muted">per {dur}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Number of Duration Units */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">
                          Number of {durationLabels[selectedDuration]}s
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setDurationNumber(Math.max(1, durationNumber - 1))}
                            className="w-12 h-12 rounded-xl border-2 border-border hover:border-gold/40 flex items-center justify-center text-foreground text-xl font-bold transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={durationNumber}
                            onChange={(e) => setDurationNumber(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 h-12 text-center text-xl font-bold rounded-xl border-2 border-border bg-background-secondary/50 text-foreground focus:border-gold focus:outline-none"
                          />
                          <button
                            onClick={() => setDurationNumber(durationNumber + 1)}
                            className="w-12 h-12 rounded-xl border-2 border-border hover:border-gold/40 flex items-center justify-center text-foreground text-xl font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Quantity (Units) */}
                      {availableUnits > 1 && (
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-3">
                            Number of Units
                          </label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="w-12 h-12 rounded-xl border-2 border-border hover:border-gold/40 flex items-center justify-center text-foreground text-xl font-bold transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={availableUnits}
                              value={quantity}
                              onChange={(e) => setQuantity(Math.min(availableUnits, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="w-24 h-12 text-center text-xl font-bold rounded-xl border-2 border-border bg-background-secondary/50 text-foreground focus:border-gold focus:outline-none"
                            />
                            <button
                              onClick={() => setQuantity(Math.min(availableUnits, quantity + 1))}
                              className="w-12 h-12 rounded-xl border-2 border-border hover:border-gold/40 flex items-center justify-center text-foreground text-xl font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs text-foreground-muted mt-2">
                            {availableUnits} units available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Price Summary */}
                    <div className="flex flex-col justify-between">
                      <div className="glass rounded-xl p-6 border border-gold/20 space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Machine</span>
                            <span className="text-foreground font-medium">{machine.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Duration</span>
                            <span className="text-foreground font-medium">
                              {durationNumber} {durationNumber === 1 ? durationLabels[selectedDuration] : durationLabels[selectedDuration] + 's'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Price per {durationLabels[selectedDuration]}</span>
                            <span className="text-foreground font-medium">${unitPrice.toFixed(2)}</span>
                          </div>
                          {quantity > 1 && (
                            <div className="flex justify-between">
                              <span className="text-foreground-muted">Units</span>
                              <span className="text-foreground font-medium">{quantity}</span>
                            </div>
                          )}
                          <div className="border-t border-border pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-foreground font-bold text-lg">Total</span>
                              <span className="text-gold font-bold text-3xl">${totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSubscribeClick}
                        disabled={isSubscribing || totalPrice <= 0}
                        className="btn-gold w-full py-4 rounded-xl font-bold text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubscribing ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Subscribe Now — ${totalPrice.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Machine unavailable */}
            {machine && (machine.status === 'maintenance' || availableUnits <= 0) && (
              <div className="mt-8">
                <div className="glass rounded-2xl p-8 text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <h3 className="text-xl font-bold text-foreground mb-2">Currently Unavailable</h3>
                  <p className="text-foreground-muted">
                    {availableUnits <= 0 
                      ? 'All units of this machine are currently rented. Please check back later.' 
                      : 'This machine is currently under maintenance.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />

        {/* Payment Method Modal */}
        {showPaymentModal && machine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass rounded-2xl w-full max-w-md border border-gold/20">
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Choose Payment Method</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="px-6 pt-4">
                <div className="bg-background-secondary/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground-muted">Machine</span>
                    <span className="font-semibold text-foreground">{machine.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground-muted">Duration</span>
                    <span className="font-medium text-foreground">
                      {durationNumber} {durationNumber === 1 ? durationLabels[selectedDuration] : durationLabels[selectedDuration] + 's'}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground-muted">Units</span>
                      <span className="font-medium text-foreground">{quantity}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-foreground-muted">Total Amount</span>
                    <span className="text-xl font-bold text-gold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="p-6 space-y-3">
                {/* Card Payment (PayTabs) */}
                <button
                  onClick={() => handlePayment('paytabs')}
                  disabled={isSubscribing}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-gold/60 transition-all flex items-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      Pay with Card
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Credit / Debit Card via PayTabs
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-foreground-muted group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Crypto Payment (Binance Pay) */}
                <button
                  onClick={() => handlePayment('binance')}
                  disabled={isSubscribing}
                  className="w-full p-4 rounded-xl border-2 border-border hover:border-gold/60 transition-all flex items-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2ZM2 12L4 10L6 12L4 14L2 12ZM6.5 16.5L12 22L17.5 16.5L15.5 14.5L12 18L8.5 14.5L6.5 16.5ZM18 12L20 10L22 12L20 14L18 12ZM12 10L10 12L12 14L14 12L12 10Z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      Pay with Crypto
                    </p>
                    <p className="text-xs text-foreground-muted">
                      USDT / BTC / ETH via Binance Pay
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-foreground-muted group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Footer note */}
              <div className="px-6 pb-6">
                <p className="text-xs text-foreground-muted text-center">
                  You will be redirected to a secure payment page to complete your transaction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
