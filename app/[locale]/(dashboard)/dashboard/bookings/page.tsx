"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import {
  bookingsApi,
  miningMachinesPublicApi,
  Booking,
  BookingStatus,
  RentalDuration,
  MiningMachine,
  BookingReceivingAddress,
} from "@/app/lib/api";
import { useTranslations } from "next-intl";

export const dynamic = 'force-dynamic';

export default function UserBookingsPage() {
  const t = useTranslations('dashboard.bookings');
  const tStatus = useTranslations('dashboard.status');
  const tMachines = useTranslations('machines.details.bookingModal.durations');
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [machines, setMachines] = useState<MiningMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [receivingAddresses, setReceivingAddresses] = useState<BookingReceivingAddress[]>([]);

  const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
    pending: { label: tStatus('pending'), color: "text-yellow-400", bg: "bg-yellow-400/10" },
    awaiting_payment: { label: tStatus('awaitingPayment'), color: "text-blue-400", bg: "bg-blue-400/10" },
    payment_sent: { label: tStatus('paymentSent'), color: "text-purple-400", bg: "bg-purple-400/10" },
    approved: { label: tStatus('approved'), color: "text-green-400", bg: "bg-green-400/10" },
    rejected: { label: tStatus('rejected'), color: "text-red-400", bg: "bg-red-400/10" },
    cancelled: { label: tStatus('cancelled'), color: "text-gray-400", bg: "bg-gray-400/10" },
  };

  const durationLabels: Record<RentalDuration, string> = {
    hour: tMachines('hour'),
    day: tMachines('day'),
    week: tMachines('week'),
    month: tMachines('month'),
  };

  const [createForm, setCreateForm] = useState({
    machineId: "",
    rentalDuration: "day" as RentalDuration,
    quantity: 1,
    userNotes: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBookings();
    loadMachines();
    loadReceivingAddresses();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) loadBookings();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      const actualData = (response.data as any)?.data || response.data;
      setBookings(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMachines = async () => {
    try {
      const response = await miningMachinesPublicApi.getAll();
      setMachines(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load machines:", error);
      setMachines([]);
    }
  };

  const loadReceivingAddresses = async () => {
    try {
      const response = await bookingsApi.getReceivingAddresses();
      const actualData = (response.data as any)?.data || response.data;
      setReceivingAddresses(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      console.error("Failed to load receiving addresses:", error);
      setReceivingAddresses([]);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.machineId) return;

    setIsCreating(true);
    try {
      await bookingsApi.create(createForm);
      await loadBookings();
      setShowCreateModal(false);
      setCreateForm({ machineId: "", rentalDuration: "day", quantity: 1, userNotes: "" });
    } catch (error) {
      console.error("Failed to create booking:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedMachine = machines.find((m) => m.id === createForm.machineId);
  const calculatedPrice = selectedMachine
    ? (() => {
        switch (createForm.rentalDuration) {
          case "hour":
            return (selectedMachine.pricePerDay / 24) * createForm.quantity;
          case "day":
            return selectedMachine.pricePerDay * createForm.quantity;
          case "week":
            return selectedMachine.pricePerWeek * createForm.quantity;
          case "month":
            return selectedMachine.pricePerMonth * createForm.quantity;
        }
      })()
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground-muted mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadBookings}
            className="btn-outline px-4 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('refresh')}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gold px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('newBooking')}
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('noBookings')}</h3>
          <p className="text-foreground-muted mb-6">{t('noBookingsDescription')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-gold px-6 py-3 rounded-xl font-semibold"
          >
            {t('createBooking')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="glass rounded-2xl p-4 sm:p-6 border border-border hover:border-gold/30 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{booking.machine?.name || "Machine"}</h3>
                    <p className="text-sm text-foreground-muted">
                      {booking.quantity} {t('units')} • {durationLabels[booking.rentalDuration]}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {t('created')} {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                    {statusConfig[booking.status].label}
                  </span>
                  <p className="text-lg font-bold text-gold mt-2">${Math.round(Number(booking.totalPrice))}</p>
                  {booking.machine && (booking.machine.profitPerDay != null || booking.machine.pricePerMonth != null) && (
                    <p className="text-xs text-green mt-1">
                      ~${Math.round(((Number(booking.machine.profitPerDay) || 0) + (Number(booking.machine.pricePerMonth) || 0) / 30) * (booking.quantity || 1))}/{t('suffixDay')}
                    </p>
                  )}
                </div>
              </div>
              {booking.messages && booking.messages.filter(m => m.isFromAdmin && !m.isRead).length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-gold">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-sm">{t('newMessage')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{t('createNewBooking')}</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('selectMachine')} <span className="text-gold">*</span>
                </label>
                <select
                  value={createForm.machineId}
                  onChange={(e) => setCreateForm({ ...createForm, machineId: e.target.value })}
                  className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50"
                  required
                >
                  <option value="">{t('chooseMachine')}</option>
                  {machines.filter(m => m.isActive).map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name} - {machine.miningCoin}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('rentalDuration')} <span className="text-gold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["hour", "day", "week", "month"] as RentalDuration[]).map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, rentalDuration: duration })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        createForm.rentalDuration === duration
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border hover:border-gold/30 text-foreground-muted"
                      }`}
                    >
                      {durationLabels[duration]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('quantity')} <span className="text-gold">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 1 })}
                  className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  {t('notes')}
                </label>
                <textarea
                  value={createForm.userNotes}
                  onChange={(e) => setCreateForm({ ...createForm, userNotes: e.target.value })}
                  className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50 resize-none"
                  rows={3}
                  placeholder={t('notesPlaceholder')}
                />
              </div>

              {selectedMachine && (
                <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">{t('estimatedTotal')}</span>
                    <span className="text-2xl font-bold text-gold">${Math.round(calculatedPrice)}</span>
                  </div>
                </div>
              )}

              {receivingAddresses.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-400 mb-2">Receiving addresses that will appear after booking:</p>
                  <div className="space-y-2">
                    {receivingAddresses.map((item) => (
                      <div key={item.id} className="bg-background-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-blue-300 mb-1">
                          {item.cryptoName ? `${item.cryptoName} - ` : ""}{item.networkType}
                        </p>
                        <p className="font-mono text-xs break-all text-foreground">{item.address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating || !createForm.machineId}
                className="btn-gold w-full py-4 rounded-xl font-semibold disabled:opacity-50"
              >
                {isCreating ? t('creating') : t('createBookingRequest')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
