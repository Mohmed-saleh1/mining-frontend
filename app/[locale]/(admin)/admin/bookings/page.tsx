"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useTranslations } from "next-intl";

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';
import {
  bookingsAdminApi,
  Booking,
  BookingStatus,
  RentalDuration,
  BookingStatistics,
} from "@/app/lib/api";

export default function AdminBookingsPage() {
  const t = useTranslations('admin.bookings');
  const tStatus = useTranslations('dashboard.status');
  const tMachines = useTranslations('machines.details.bookingModal.durations');
  useAuth(); // Ensure user is authenticated
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] = useState<BookingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  // Payment address form
  const [paymentAddress, setPaymentAddress] = useState("");
  const [isSendingAddress, setIsSendingAddress] = useState(false);

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadBookings();
    loadStatistics();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    if (selectedBooking && showDetailsModal) {
      scrollToBottom();
    }
  }, [selectedBooking?.messages, showDetailsModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsAdminApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setBookings(Array.isArray(response.data?.data) ? response.data.data : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await bookingsAdminApi.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const openBookingDetails = async (booking: Booking) => {
    try {
      const response = await bookingsAdminApi.getOne(booking.id);
      setSelectedBooking(response.data);
      setShowDetailsModal(true);
      // Mark messages as read
      await bookingsAdminApi.markMessagesRead(booking.id);
    } catch (error) {
      console.error("Failed to load booking details:", error);
    }
  };

  const handleSendPaymentAddress = async () => {
    if (!selectedBooking || !paymentAddress.trim()) return;

    setIsSendingAddress(true);
    try {
      const response = await bookingsAdminApi.sendPaymentAddress(
        selectedBooking.id,
        paymentAddress.trim()
      );
      setSelectedBooking(response.data);
      setPaymentAddress("");
      await loadBookings();
      await loadStatistics();
    } catch (error) {
      console.error("Failed to send payment address:", error);
    } finally {
      setIsSendingAddress(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;

    setIsApproving(true);
    try {
      const response = await bookingsAdminApi.approve(
        selectedBooking.id,
        adminNotes || undefined
      );
      setSelectedBooking(response.data);
      setAdminNotes("");
      await loadBookings();
      await loadStatistics();
    } catch (error) {
      console.error("Failed to approve booking:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    if (!confirm(t('details.rejectConfirm'))) return;

    setIsRejecting(true);
    try {
      const response = await bookingsAdminApi.reject(
        selectedBooking.id,
        adminNotes || undefined
      );
      setSelectedBooking(response.data);
      setAdminNotes("");
      await loadBookings();
      await loadStatistics();
    } catch (error) {
      console.error("Failed to reject booking:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await bookingsAdminApi.sendMessage(selectedBooking.id, newMessage.trim());
      const response = await bookingsAdminApi.getOne(selectedBooking.id);
      setSelectedBooking(response.data);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const statCards = statistics
    ? [
        { label: t('statistics.total'), value: statistics.total, color: "text-foreground" },
        { label: t('statistics.pending'), value: statistics.pending, color: "text-yellow-400" },
        { label: t('statistics.awaitingPayment'), value: statistics.awaitingPayment, color: "text-blue-400" },
        { label: t('statistics.paymentSent'), value: statistics.paymentSent, color: "text-purple-400" },
        { label: t('statistics.approved'), value: statistics.approved, color: "text-green-400" },
        { label: t('statistics.rejected'), value: statistics.rejected, color: "text-red-400" },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-foreground-muted mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 border border-border">
              <p className="text-foreground-muted text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-gold text-background"
              : "bg-background-secondary text-foreground-muted hover:text-foreground"
          }`}
        >
          {t('filters.all')}
        </button>
        {(Object.keys(statusConfig) as BookingStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-gold text-background"
                : "bg-background-secondary text-foreground-muted hover:text-foreground"
            }`}
          >
            {statusConfig[status].label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-foreground-muted">{t('details.noBookings')}</p>
            <p className="text-foreground-muted text-sm mt-1">{t('details.noBookingsDescription')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.user')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.machine')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.duration')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.totalPrice')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.createdAt')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </p>
                        <p className="text-sm text-foreground-muted">{booking.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{booking.machine?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {booking.quantity} {t('table.quantity')} • {durationLabels[booking.rentalDuration]}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gold">${Number(booking.totalPrice).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                        {statusConfig[booking.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground-muted">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openBookingDetails(booking)}
                        className="btn-outline px-4 py-2 rounded-lg text-sm"
                      >
                        {t('table.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-background-secondary text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {t('pagination.previous')}
            </button>
            <span className="text-foreground-muted">
              {t('pagination.page', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-background-secondary text-foreground-muted hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {t('pagination.next')}
            </button>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {t('details.title')}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {t('details.bookingNumber', { id: selectedBooking.id.slice(0, 8) })}
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
            <div className="p-6 border-b border-border space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('details.userInfo')}</h3>
                  <p className="text-foreground">
                    {selectedBooking.user?.firstName} {selectedBooking.user?.lastName}
                  </p>
                  <p className="text-sm text-foreground-muted">{selectedBooking.user?.email}</p>
                </div>

                {/* Machine Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('details.machineInfo')}</h3>
                  <p className="text-foreground">{selectedBooking.machine?.name}</p>
                  <p className="text-sm text-foreground-muted">{selectedBooking.machine?.miningCoin}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-foreground-muted">{t('table.duration')}</p>
                  <p className="font-medium text-foreground">{durationLabels[selectedBooking.rentalDuration]}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">{t('table.quantity')}</p>
                  <p className="font-medium text-foreground">{selectedBooking.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">{t('table.totalPrice')}</p>
                  <p className="font-bold text-gold">${Number(selectedBooking.totalPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">{t('table.status')}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[selectedBooking.status].bg} ${statusConfig[selectedBooking.status].color}`}>
                    {statusConfig[selectedBooking.status].label}
                  </span>
                </div>
              </div>

              {/* User Notes */}
              {selectedBooking.userNotes && (
                <div className="p-4 rounded-xl bg-background-secondary/50">
                  <p className="text-sm text-foreground-muted mb-1">{t('details.userNotes')}:</p>
                  <p className="text-foreground">{selectedBooking.userNotes}</p>
                </div>
              )}

              {/* Transaction Hash */}
              {selectedBooking.transactionHash && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-purple-400 mb-1">{t('details.transactionHash')}:</p>
                  <p className="font-mono text-sm break-all">{selectedBooking.transactionHash}</p>
                </div>
              )}

              {/* Actions based on status */}
              {selectedBooking.status === "pending" && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-3">
                  <p className="text-sm text-yellow-400 font-medium">{t('details.sendPaymentAddress')}</p>
                  <input
                    type="text"
                    placeholder={t('details.paymentAddressPlaceholder')}
                    value={paymentAddress}
                    onChange={(e) => setPaymentAddress(e.target.value)}
                    className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50"
                  />
                  <button
                    onClick={handleSendPaymentAddress}
                    disabled={isSendingAddress || !paymentAddress.trim()}
                    className="btn-gold w-full py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isSendingAddress ? t('details.sendingAddress') : t('details.sendPaymentAddress')}
                  </button>
                </div>
              )}

              {selectedBooking.status === "payment_sent" && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 space-y-3">
                  <p className="text-sm text-green-400 font-medium">{t('details.paymentInfo')}</p>
                  <textarea
                    placeholder={t('details.notesPlaceholder')}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="flex-1 btn-gold py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {isApproving ? t('details.approving') : t('details.approve')}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isRejecting ? t('details.rejecting') : t('details.reject')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <div className="px-6 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">{t('details.chatWithUser')}</h3>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedBooking.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.messageType === "system"
                          ? "bg-background-secondary/50 text-foreground-muted text-sm italic text-center w-full max-w-full"
                          : message.messageType === "payment_address"
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : message.isFromAdmin
                          ? "bg-gold/20"
                          : "bg-background-secondary"
                      }`}
                    >
                      {message.messageType === "payment_address" ? (
                        <div>
                          <p className="text-xs text-blue-400 mb-1">{t('details.paymentAddress')}</p>
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
                    placeholder={t('details.typeMessage')}
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

