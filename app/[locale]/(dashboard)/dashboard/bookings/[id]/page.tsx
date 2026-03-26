"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  bookingsApi,
  Booking,
  BookingStatus,
  RentalDuration,
  BookingMessage,
} from "@/app/lib/api";

export const dynamic = "force-dynamic";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const t = useTranslations("dashboard.bookings");
  const tStatus = useTranslations("dashboard.status");
  const tDurations = useTranslations("machines.details.bookingModal.durations");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedPaymentAddressMessageId, setSelectedPaymentAddressMessageId] =
    useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    hour: tDurations("hour"),
    day: tDurations("day"),
    week: tDurations("week"),
    month: tDurations("month"),
  };

  useEffect(() => {
    if (id) loadBooking();
  }, [id]);

  useEffect(() => {
    if (booking) scrollToBottom();
  }, [booking?.messages]);

  useEffect(() => {
    if (!booking || booking.status !== "awaiting_payment") {
      setSelectedPaymentAddressMessageId(null);
      return;
    }

    const paymentAddressMessages =
      booking.messages?.filter((m) => m.messageType === "payment_address") ||
      [];
    if (paymentAddressMessages.length === 0) {
      setSelectedPaymentAddressMessageId(null);
      return;
    }

    setSelectedPaymentAddressMessageId((prev) =>
      prev && paymentAddressMessages.some((m) => m.id === prev)
        ? prev
        : paymentAddressMessages[0].id
    );
  }, [booking]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) loadBooking();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBooking = async () => {
    try {
      const response = await bookingsApi.getMyBooking(id);
      setBooking(response.data);
      try {
        await bookingsApi.markMessagesRead(id);
      } catch {}
    } catch (error) {
      console.error("Failed to load booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !confirm(t("cancelConfirm"))) return;
    try {
      await bookingsApi.cancelBooking(booking.id);
      await loadBooking();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await bookingsApi.sendMessage(booking.id, newMessage.trim());
      setNewMessage("");
      await loadBooking();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!booking || !selectedImage) return;

    setIsUploadingImage(true);
    try {
      await bookingsApi.sendImageMessage(
        booking.id,
        selectedImage,
        "Payment proof screenshot"
      );
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadBooking();
    } catch (error) {
      console.error("Failed to upload screenshot:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCopyAddress = async (messageId: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-muted">Booking not found.</p>
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="btn-gold mt-4 px-6 py-3 rounded-xl font-semibold"
        >
          {t("backToBookings")}
        </button>
      </div>
    );
  }

  const status = statusConfig[booking.status];
  const paymentAddressMessages =
    booking.messages?.filter((m) => m.messageType === "payment_address") || [];
  const selectedPaymentMessage = paymentAddressMessages.find(
    (m) => m.id === selectedPaymentAddressMessageId
  );

  const revenueBlock = () => {
    if (
      !booking.machine ||
      (booking.machine.profitPerDay == null &&
        booking.machine.pricePerMonth == null)
    )
      return null;

    const dailyRev = Number(booking.machine.profitPerDay) || 0;
    const pricePerMonth = Number(booking.machine.pricePerMonth) || 0;
    const dailyDisplay = dailyRev + pricePerMonth / 30;
    const qty = booking.quantity || 1;
    const dailyTotal = Math.round(dailyDisplay * qty);
    const weeklyTotal = Math.round(dailyTotal * 7);
    const monthlyTotal = Math.round(dailyTotal * 30);
    const daysInPeriod =
      { hour: 1 / 24, day: 1, week: 7, month: 30 }[
        booking.rentalDuration
      ] || 1;
    const periodTotal = Math.round(dailyTotal * daysInPeriod);

    return (
      <div className="p-4 rounded-xl bg-green/5 border border-green/20">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          {t("revenue")}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-muted">{t("dailyRevenue")}</span>
            <span className="font-semibold text-green">${dailyTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">{t("weeklyRevenue")}</span>
            <span className="font-semibold text-green">${weeklyTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">{t("monthlyRevenue")}</span>
            <span className="font-semibold text-green">${monthlyTotal}</span>
          </div>
          <div className="col-span-2 flex justify-between pt-2 border-t border-green/20">
            <span className="text-foreground-muted">{t("periodRevenue")}</span>
            <span className="font-bold text-green">${periodTotal}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/bookings")}
        className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-4 self-start"
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
        <span className="text-sm font-medium">{t("backToBookings")}</span>
      </button>

      {/* Two-column layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left column - Booking info */}
        <div className="w-full lg:w-[420px] lg:shrink-0 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Header card */}
          <div className="glass rounded-2xl p-5 sm:p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-gold"
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
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">
                    {booking.machine?.name || "Machine"}
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    {t("bookingNumber", {
                      id: booking.id?.slice(0, 8) || "N/A",
                    })}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-foreground-muted block">
                  {t("duration")}
                </span>
                <span className="text-foreground font-medium">
                  {durationLabels[booking.rentalDuration] || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-foreground-muted block">
                  {t("quantityLabel")}
                </span>
                <span className="text-foreground font-medium">
                  {booking.quantity ?? "N/A"} {t("units")}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-foreground-muted block">
                  {t("estimatedTotal")}
                </span>
                <span className="text-gold text-lg font-bold">
                  ${Math.round(Number(booking.totalPrice))}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-foreground-muted block">
                  {t("created")}
                </span>
                <span className="text-foreground font-medium">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue estimates */}
          {revenueBlock()}

          {/* Payment addresses */}
          {booking.status === "awaiting_payment" &&
            paymentAddressMessages.length > 0 && (
              <div className="glass rounded-2xl p-5 sm:p-6 border border-blue-500/30 bg-blue-500/5">
                <p className="text-sm text-blue-400 font-semibold mb-3">
                  {t("paymentAddress")}
                </p>
                <div className="space-y-2">
                  {paymentAddressMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedPaymentAddressMessageId === message.id
                          ? "border-gold bg-gold/10"
                          : "border-border bg-background-secondary/50 hover:border-gold/30"
                      }`}
                      onClick={() =>
                        setSelectedPaymentAddressMessageId(message.id)
                      }
                    >
                      <p className="text-xs text-blue-300 mb-1">
                        {message.cryptoName
                          ? `${message.cryptoName} - ${message.networkType || "Network"}`
                          : message.networkType || "Network"}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm break-all text-foreground flex-1 min-w-0">
                          {message.content}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(message.id, message.content);
                          }}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-gold/10 text-foreground-muted hover:text-gold transition-all"
                          title="Copy address"
                        >
                          {copiedId === message.id ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPaymentMessage?.imageUrl && (
                  <div className="mt-3 rounded-xl border border-blue-500/30 bg-background-secondary/40 p-3">
                    <p className="text-xs text-blue-300 mb-2">QR Code</p>
                    <a
                      href={selectedPaymentMessage.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={selectedPaymentMessage.imageUrl}
                        alt="Payment QR"
                        className="max-h-52 rounded-lg border border-border"
                      />
                    </a>
                  </div>
                )}
              </div>
            )}

          {/* Cancel button */}
          {["pending", "awaiting_payment"].includes(booking.status) && (
            <button
              onClick={handleCancelBooking}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              {t("cancelBooking")}
            </button>
          )}
        </div>

        {/* Right column - Chat */}
        <div className="flex-1 glass rounded-2xl border border-border flex flex-col min-h-[400px] lg:min-h-0">
          {/* Chat header */}
          <div className="px-5 sm:px-6 py-4 border-b border-border shrink-0">
            <h3 className="font-semibold text-foreground">
              {t("chatWithAdmin")}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
            {(!booking.messages || booking.messages.length === 0) && (
              <div className="flex items-center justify-center h-full">
                <p className="text-foreground-muted text-sm">
                  {t("noMessages")}
                </p>
              </div>
            )}
            {booking.messages?.map((message) => {
              if (message.messageType === "system") {
                return (
                  <div key={message.id} className="text-center py-2">
                    <span className="text-xs text-foreground-muted italic bg-background-secondary/50 px-3 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                );
              }

              if (message.messageType === "payment_address") {
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-blue-500/10 border border-blue-500/30">
                      <p className="text-xs text-blue-400 mb-1">
                        {message.networkType
                          ? `${t("paymentAddressLabel")} - ${message.cryptoName ? `${message.cryptoName} / ` : ""}${message.networkType}`
                          : t("paymentAddressLabel")}
                      </p>
                      <p className="font-mono text-sm break-all text-foreground">
                        {message.content}
                      </p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              }

              const isUser = !message.isFromAdmin;
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                      isUser ? "bg-gold/20" : "bg-background-secondary"
                    }`}
                  >
                    {message.messageType === "image" && message.imageUrl ? (
                      <div>
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
                          <p className="text-sm mt-2 text-foreground">
                            {message.content}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground">
                        {message.content}
                      </p>
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
          <div className="shrink-0 border-t border-border p-3 sm:p-4 space-y-3">
            {/* Image preview bar */}
            {selectedImage && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gold/5 border border-gold/20">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-foreground truncate flex-1 min-w-0">
                  {selectedImage.name}
                </span>
                <button
                  type="button"
                  onClick={handleUploadScreenshot}
                  disabled={isUploadingImage}
                  className="shrink-0 btn-gold px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploadingImage ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      {t("uploading")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {t("send")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-foreground-muted hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Input row */}
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 items-center">
              <label className="shrink-0 p-2.5 rounded-xl border border-border hover:border-gold/40 hover:bg-gold/5 text-foreground-muted hover:text-gold transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("typeMessage")}
                className="flex-1 min-w-0 input-gold px-4 py-3 rounded-xl bg-background-secondary/50"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="shrink-0 btn-gold px-4 sm:px-6 py-3 rounded-xl disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
