"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { miningMachinesPublicApi, bookingsApi, MiningMachine, ApiError, RentalDuration } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const durationLabels: Record<RentalDuration, string> = {
  hour: "Per Hour",
  day: "Per Day",
  week: "Per Week",
  month: "Per Month",
};

export default function MachineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [machine, setMachine] = useState<MiningMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    rentalDuration: "day" as RentalDuration,
    quantity: 1,
    userNotes: "",
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const handleStartMining = () => {
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }
    setShowBookingModal(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;

    setIsCreatingBooking(true);
    try {
      await bookingsApi.create({
        machineId: machine.id,
        rentalDuration: bookingForm.rentalDuration,
        quantity: bookingForm.quantity,
        userNotes: bookingForm.userNotes || undefined,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        router.push("/dashboard/bookings");
      }, 2000);
    } catch (err) {
      console.error("Failed to create booking:", err);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const calculatedPrice = machine
    ? (() => {
        switch (bookingForm.rentalDuration) {
          case "hour":
            return machine.pricePerHour * bookingForm.quantity;
          case "day":
            return machine.pricePerDay * bookingForm.quantity;
          case "week":
            return machine.pricePerWeek * bookingForm.quantity;
          case "month":
            return machine.pricePerMonth * bookingForm.quantity;
        }
      })()
    : 0;

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
                  <button
                    onClick={handleStartMining}
                    className="block w-full btn-gold px-6 py-4 rounded-xl text-lg font-semibold text-center"
                  >
                    {isAuthenticated ? "Book This Machine" : "Start Mining Now"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
        
        <Footer />

        {/* Booking Modal */}
        {showBookingModal && machine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {bookingSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Booking Created!</h2>
                  <p className="text-foreground-muted">Redirecting to your bookings...</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Book {machine.name}</h2>
                        <p className="text-sm text-foreground-muted">Create a rental request</p>
                      </div>
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <form onSubmit={handleCreateBooking} className="p-6 space-y-5">
                    {/* Duration Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Rental Duration <span className="text-gold">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["hour", "day", "week", "month"] as RentalDuration[]).map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => setBookingForm({ ...bookingForm, rentalDuration: duration })}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                              bookingForm.rentalDuration === duration
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-border hover:border-gold/30 text-foreground-muted"
                            }`}
                          >
                            {durationLabels[duration]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Quantity <span className="text-gold">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={machine.totalUnits - machine.rentedUnits}
                        value={bookingForm.quantity}
                        onChange={(e) => setBookingForm({ ...bookingForm, quantity: parseInt(e.target.value) || 1 })}
                        className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50"
                        required
                      />
                      <p className="text-xs text-foreground-muted mt-1">
                        {machine.totalUnits - machine.rentedUnits} units available
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={bookingForm.userNotes}
                        onChange={(e) => setBookingForm({ ...bookingForm, userNotes: e.target.value })}
                        className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50 resize-none"
                        rows={3}
                        placeholder="Any special requests or notes..."
                      />
                    </div>

                    {/* Price Summary */}
                    <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-foreground-muted">Price ({durationLabels[bookingForm.rentalDuration]})</span>
                        <span className="text-foreground">
                          ${bookingForm.rentalDuration === "hour" ? machine.pricePerHour :
                            bookingForm.rentalDuration === "day" ? machine.pricePerDay :
                            bookingForm.rentalDuration === "week" ? machine.pricePerWeek :
                            machine.pricePerMonth} × {bookingForm.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gold/20">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-gold">${calculatedPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingBooking}
                      className="btn-gold w-full py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCreatingBooking ? (
                        <>
                          <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Booking Request"
                      )}
                    </button>

                    <p className="text-xs text-foreground-muted text-center">
                      After creating a request, an admin will send you the payment address.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

