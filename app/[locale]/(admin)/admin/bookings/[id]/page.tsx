"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  bookingsAdminApi,
  Booking,
  BookingStatus,
  RentalDuration,
} from "@/app/lib/api";
import ClientOnly from "@/app/components/ClientOnly";

export const dynamic = "force-dynamic";

const unwrapBooking = (response: { data: unknown }): Booking | null => {
  const raw = response.data as Booking | { data?: Booking };
  const booking =
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    raw.data &&
    typeof raw.data === "object" &&
    "id" in raw.data
      ? (raw.data as Booking)
      : (raw as Booking);
  return booking?.id ? booking : null;
};

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const t = useTranslations("admin.bookings");
  const tStatus = useTranslations("dashboard.status");
  const tMachines = useTranslations("machines.details.bookingModal.durations");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const statusConfig: Record<
    BookingStatus,
    { label: string; color: string; bg: string }
  > = {
    pending: {
      label: tStatus("pending"),
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    awaiting_payment: {
      label: tStatus("awaitingPayment"),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    payment_sent: {
      label: tStatus("paymentSent"),
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    approved: {
      label: tStatus("approved"),
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    rejected: {
      label: tStatus("rejected"),
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    cancelled: {
      label: tStatus("cancelled"),
      color: "text-gray-400",
      bg: "bg-gray-400/10",
    },
  };

  const durationLabels: Record<RentalDuration, string> = {
    hour: tMachines("hour"),
    day: tMachines("day"),
    week: tMachines("week"),
    month: tMachines("month"),
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadBooking = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingsAdminApi.getOne(id);
      const data = unwrapBooking(response);
      if (data) {
        setBooking(data);
        await bookingsAdminApi.markMessagesRead(id);
      } else {
        setError("Booking not found");
      }
    } catch (err) {
      console.error("Failed to load booking:", err);
      setError("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (booking?.messages) scrollToBottom();
  }, [booking?.messages, scrollToBottom]);

  const handleApprove = async () => {
    if (!booking) return;
    setIsApproving(true);
    try {
      const response = await bookingsAdminApi.approve(
        booking.id,
        adminNotes || undefined
      );
      const updated = unwrapBooking(response);
      if (updated) setBooking(updated);
      setAdminNotes("");
    } catch (err) {
      console.error("Failed to approve booking:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!booking) return;
    if (!confirm(t("details.rejectConfirm"))) return;
    setIsRejecting(true);
    try {
      const response = await bookingsAdminApi.reject(
        booking.id,
        adminNotes || undefined
      );
      const updated = unwrapBooking(response);
      if (updated) setBooking(updated);
      setAdminNotes("");
    } catch (err) {
      console.error("Failed to reject booking:", err);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !newMessage.trim()) return;
    setIsSending(true);
    try {
      await bookingsAdminApi.sendMessage(booking.id, newMessage.trim());
      const response = await bookingsAdminApi.getOne(booking.id);
      const updated = unwrapBooking(response);
      if (updated) setBooking(updated);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const canApproveOrReject =
    booking?.status === "pending" ||
    booking?.status === "awaiting_payment" ||
    booking?.status === "payment_sent";

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto" />
            <p className="mt-4 text-foreground-muted">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="p-4 lg:p-6 h-full">
        {/* Back button + header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/bookings")}
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("details.backToBookings")}
          </button>

          {booking && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("details.title")}
                </h1>
                <p className="text-sm text-foreground-muted">
                  {t("details.bookingNumber", {
                    id: booking.id?.slice(0, 8) || "N/A",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center self-start px-4 py-1.5 rounded-full text-sm font-medium ${
                  statusConfig[booking.status]?.bg || "bg-gray-500/20"
                } ${statusConfig[booking.status]?.color || "text-gray-500"}`}
              >
                {statusConfig[booking.status]?.label || "Unknown"}
              </span>
            </div>
          )}
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="glass rounded-2xl p-12 text-center border border-border">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadBooking}
              className="btn-outline px-6 py-3 rounded-xl"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main content - two column layout */}
        {booking && !isLoading && (
          <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-220px)]">
            {/* Left column - Booking info + actions */}
            <div className="lg:w-1/2 xl:w-5/12 space-y-5 lg:overflow-y-auto lg:pr-2">
              {/* User Info */}
              <div className="glass rounded-2xl p-5 border border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {t("details.userInfo")}
                </h3>
                <div className="space-y-1">
                  <p className="text-foreground font-medium">
                    {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {booking.user?.email}
                  </p>
                </div>
              </div>

              {/* Machine Info */}
              <div className="glass rounded-2xl p-5 border border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  {t("details.machineInfo")}
                </h3>
                <div className="space-y-1">
                  <p className="text-foreground font-medium">
                    {booking.machine?.name}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    {booking.machine?.miningCoin}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-foreground-muted">
                      {t("table.duration")}
                    </p>
                    <p className="font-medium text-foreground text-sm">
                      {booking.rentalDuration
                        ? durationLabels[booking.rentalDuration]
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">
                      {t("table.quantity")}
                    </p>
                    <p className="font-medium text-foreground text-sm">
                      {booking.quantity ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">
                      {t("table.totalPrice")}
                    </p>
                    <p className="font-bold text-gold text-sm">
                      $
                      {booking.totalPrice
                        ? Math.round(Number(booking.totalPrice))
                        : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted">
                      {t("table.createdAt")}
                    </p>
                    <p className="font-medium text-foreground text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Notes */}
              {booking.userNotes && (
                <div className="glass rounded-2xl p-5 border border-border">
                  <p className="text-sm text-foreground-muted mb-2">
                    {t("details.userNotes")}
                  </p>
                  <p className="text-foreground">{booking.userNotes}</p>
                </div>
              )}

              {/* Transaction Hash */}
              {booking.transactionHash && (
                <div className="rounded-2xl p-5 bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-purple-400 mb-2">
                    {t("details.transactionHash")}
                  </p>
                  <p className="font-mono text-sm break-all text-foreground">
                    {booking.transactionHash}
                  </p>
                </div>
              )}

              {/* Approve / Reject Actions */}
              {canApproveOrReject && (
                <div className="rounded-2xl p-5 bg-green-500/10 border border-green-500/30 space-y-4">
                  <p className="text-sm text-green-400 font-medium">
                    {t("details.paymentInfo")}
                  </p>
                  <textarea
                    placeholder={t("details.notesPlaceholder")}
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
                      {isApproving
                        ? t("details.approving")
                        : t("details.approve")}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isRejecting
                        ? t("details.rejecting")
                        : t("details.reject")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Chat */}
            <div className="lg:w-1/2 xl:w-7/12 flex flex-col glass rounded-2xl border border-border min-h-[400px] lg:min-h-0">
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-border shrink-0">
                <h3 className="font-semibold text-foreground">
                  {t("details.chatWithUser")}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                {(!booking.messages || booking.messages.length === 0) && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-foreground-muted text-sm">
                      No messages yet
                    </p>
                  </div>
                )}

                {booking.messages?.map((message) => {
                  if (message.messageType === "system") {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="bg-background-secondary/50 rounded-2xl px-4 py-2 text-foreground-muted text-sm italic text-center max-w-[90%]">
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const isAdmin = message.isFromAdmin;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.messageType === "payment_address"
                            ? "bg-blue-500/10 border border-blue-500/30"
                            : isAdmin
                              ? "bg-gold/20"
                              : "bg-background-secondary"
                        }`}
                      >
                        {message.messageType === "payment_address" ? (
                          <div>
                            <p className="text-xs text-blue-400 mb-1">
                              {message.networkType
                                ? `${t("details.paymentAddress")} - ${message.cryptoName ? `${message.cryptoName} / ` : ""}${message.networkType}`
                                : t("details.paymentAddress")}
                            </p>
                            <p className="font-mono text-sm break-all">
                              {message.content}
                            </p>
                          </div>
                        ) : message.messageType === "image" &&
                          message.imageUrl ? (
                          <div>
                            <p className="text-xs text-foreground-muted mb-2">
                              Payment Screenshot
                            </p>
                            <a
                              href={message.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={message.imageUrl}
                                alt="Payment screenshot"
                                className="rounded-lg max-h-56 w-auto border border-border"
                              />
                            </a>
                            {message.content && (
                              <p className="text-sm mt-2">{message.content}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <p className="text-xs text-foreground-muted mt-1">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border shrink-0"
              >
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("details.typeMessage")}
                    className="flex-1 min-w-0 input-gold px-4 py-3 rounded-xl bg-background-secondary/50"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="shrink-0 btn-gold px-6 py-3 rounded-xl disabled:opacity-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
