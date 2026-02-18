"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/lib/auth-context";
import {
  bookingsApi,
  miningMachinesPublicApi,
  Booking,
  BookingStatus,
  RentalDuration,
  MiningMachine,
  BookingMessage,
} from "@/app/lib/api";
import { useTranslations } from "next-intl";

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic';

export default function UserBookingsPage() {
  const t = useTranslations('dashboard.bookings');
  const tStatus = useTranslations('dashboard.status');
  const tCommon = useTranslations('common');
  const tMachines = useTranslations('machines.details.bookingModal.durations');
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [machines, setMachines] = useState<MiningMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Create booking form state
  const [createForm, setCreateForm] = useState({
    machineId: "",
    rentalDuration: "day" as RentalDuration,
    quantity: 1,
    userNotes: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Payment form state
  const [transactionHash, setTransactionHash] = useState("");
  const [isMarkingPayment, setIsMarkingPayment] = useState(false);

  useEffect(() => {
    loadBookings();
    loadMachines();
  }, []);

  useEffect(() => {
    if (selectedBooking && showDetailsModal) {
      scrollToBottom();
    }
  }, [selectedBooking?.messages, showDetailsModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      setBookings(Array.isArray(response.data) ? response.data : []);
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

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.machineId) return;

    setIsCreating(true);
    try {
      await bookingsApi.create(createForm);
      await loadBookings();
      setShowCreateModal(false);
      setCreateForm({
        machineId: "",
        rentalDuration: "day",
        quantity: 1,
        userNotes: "",
      });
    } catch (error) {
      console.error("Failed to create booking:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMarkPaymentSent = async () => {
    if (!selectedBooking) return;

    setIsMarkingPayment(true);
    try {
      const response = await bookingsApi.markPaymentSent(
        selectedBooking.id,
        transactionHash || undefined
      );
      setSelectedBooking(response.data);
      await loadBookings();
      setTransactionHash("");
    } catch (error) {
      console.error("Failed to mark payment:", error);
    } finally {
      setIsMarkingPayment(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t('cancelConfirm'))) return;

    try {
      await bookingsApi.cancelBooking(bookingId);
      await loadBookings();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await bookingsApi.sendMessage(selectedBooking.id, newMessage.trim());
      const response = await bookingsApi.getMyBooking(selectedBooking.id);
      setSelectedBooking(response.data);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const openBookingDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
    // Mark messages as read
    try {
      await bookingsApi.markMessagesRead(booking.id);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const selectedMachine = machines.find((m) => m.id === createForm.machineId);
  const calculatedPrice = selectedMachine
    ? (() => {
        switch (createForm.rentalDuration) {
          case "hour":
            // Calculate hourly price from daily price (divide by 24)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
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

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('noBookings')}</h3>
          <p className="text-foreground-muted mb-6">
            {t('noBookingsDescription')}
          </p>
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
              className="glass rounded-2xl p-6 border border-border hover:border-gold/30 transition-all cursor-pointer"
              onClick={() => openBookingDetails(booking)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{booking.machine?.name || "Machine"}</h3>
                    <p className="text-sm text-foreground-muted">
                      {booking.quantity} {t('units')} • {durationLabels[booking.rentalDuration]}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {t('created')} {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                    {statusConfig[booking.status].label}
                  </span>
                  <p className="text-lg font-bold text-gold mt-2">${Number(booking.totalPrice).toFixed(2)}</p>
                </div>
              </div>
              {booking.messages && booking.messages.filter(m => m.isFromAdmin && !m.isRead).length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-gold">
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
              {/* Machine Selection */}
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

              {/* Duration Selection */}
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

              {/* Quantity */}
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

              {/* Notes */}
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

              {/* Price Summary */}
              {selectedMachine && (
                <div className="p-4 rounded-xl bg-gold/5 border border-gold/20">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">{t('estimatedTotal')}</span>
                    <span className="text-2xl font-bold text-gold">${calculatedPrice.toFixed(2)}</span>
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

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedBooking.machine?.name}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {t('bookingNumber', { id: selectedBooking.id.slice(0, 8) })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Booking Info */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedBooking.status].bg} ${statusConfig[selectedBooking.status].color}`}>
                  {statusConfig[selectedBooking.status].label}
                </span>
                <span className="text-xl font-bold text-gold">${Number(selectedBooking.totalPrice).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground-muted">{t('duration')}</span>
                  <span className="ml-2 text-foreground">{durationLabels[selectedBooking.rentalDuration]}</span>
                </div>
                <div>
                  <span className="text-foreground-muted">{t('quantityLabel')}</span>
                  <span className="ml-2 text-foreground">{selectedBooking.quantity} {t('units')}</span>
                </div>
              </div>

              {/* Payment Address Display */}
              {selectedBooking.paymentAddress && selectedBooking.status === "awaiting_payment" && (
                <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-400 font-medium mb-2">{t('paymentAddress')}</p>
                  <p className="text-foreground font-mono text-sm break-all bg-background-secondary/50 p-3 rounded-lg">
                    {selectedBooking.paymentAddress}
                  </p>
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder={t('transactionHashPlaceholder')}
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50 text-sm"
                    />
                    <button
                      onClick={handleMarkPaymentSent}
                      disabled={isMarkingPayment}
                      className="btn-gold w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                    >
                      {isMarkingPayment ? t('processing') : t('sentPayment')}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              {["pending", "awaiting_payment"].includes(selectedBooking.status) && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="mt-4 w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  {t('cancelBooking')}
                </button>
              )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-6 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">{t('chatWithAdmin')}</h3>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedBooking.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.messageType === "system"
                          ? "bg-background-secondary/50 text-foreground-muted text-sm italic text-center w-full max-w-full"
                          : message.messageType === "payment_address"
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : message.isFromAdmin
                          ? "bg-background-secondary"
                          : "bg-gold/20"
                      }`}
                    >
                      {message.messageType === "payment_address" ? (
                        <div>
                          <p className="text-xs text-blue-400 mb-1">{t('paymentAddressLabel')}</p>
                          <p className="font-mono text-sm break-all">{message.content}</p>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p className="text-xs text-foreground-muted mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('typeMessage')}
                    className="flex-1 input-gold px-4 py-3 rounded-xl bg-background-secondary/50"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="btn-gold px-6 py-3 rounded-xl disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

