"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { useTranslations } from "next-intl";
import ClientOnly from "@/app/components/ClientOnly";
import {
  bookingsAdminApi,
  Booking,
  BookingReceivingAddress,
  BookingStatus,
  RentalDuration,
  BookingStatistics,
} from "@/app/lib/api";

export const dynamic = 'force-dynamic';

export default function AdminBookingsPage() {
  const t = useTranslations('admin.bookings');
  const tStatus = useTranslations('dashboard.status');
  const tMachines = useTranslations('machines.details.bookingModal.durations');
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] = useState<BookingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [qrAddresses, setQrAddresses] = useState<BookingReceivingAddress[]>([]);
  const [selectedQrFiles, setSelectedQrFiles] = useState<Record<string, File | null>>({});
  const [uploadingQrId, setUploadingQrId] = useState<string | null>(null);

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

  useEffect(() => {
    loadBookings();
    loadStatistics();
    loadQrAddresses();
  }, [statusFilter, currentPage]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsAdminApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      const paginatedData = (response.data as any)?.data;
      const bookingsArray = paginatedData?.data;
      setBookings(Array.isArray(bookingsArray) ? bookingsArray : []);
      setTotalPages(paginatedData?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load admin bookings:", error);
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

  const loadQrAddresses = async () => {
    try {
      const response = await bookingsAdminApi.getReceivingAddressesForQr();
      const actualData = (response.data as any)?.data || response.data;
      setQrAddresses(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      console.error("Failed to load receiving addresses for QR:", error);
      setQrAddresses([]);
    }
  };

  const handleQrFileChange = (addressId: string, file: File | null) => {
    setSelectedQrFiles((prev) => ({ ...prev, [addressId]: file }));
  };

  const handleUploadQr = async (addressId: string) => {
    const file = selectedQrFiles[addressId];
    if (!file) return;

    setUploadingQrId(addressId);
    try {
      await bookingsAdminApi.uploadReceivingAddressQr(addressId, file);
      setSelectedQrFiles((prev) => ({ ...prev, [addressId]: null }));
      await loadQrAddresses();
    } catch (error) {
      console.error("Failed to upload QR image:", error);
    } finally {
      setUploadingQrId(null);
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
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-foreground-muted mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={loadBookings}
            className="btn-outline px-4 py-3 rounded-xl font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
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

        {/* QR Section */}
        <div className="glass rounded-2xl p-5 border border-border space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Binance QR For Receiving Addresses</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Upload a QR image for each global receiving address. Users will see it when selecting the address.
            </p>
          </div>
          {qrAddresses.length === 0 ? (
            <p className="text-sm text-foreground-muted">No receiving addresses found.</p>
          ) : (
            <div className="space-y-3">
              {qrAddresses.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-background-secondary/40 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.cryptoName ? `${item.cryptoName} - ` : ""}{item.networkType}
                  </p>
                  <p className="text-xs text-foreground-muted break-all mt-1">{item.address}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {item.qrImageUrl ? (
                      <a href={item.qrImageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={item.qrImageUrl}
                          alt="Address QR"
                          className="h-20 w-20 rounded-md border border-border object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-foreground-muted">No QR uploaded</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQrFileChange(item.id, e.target.files?.[0] || null)}
                      className="text-xs text-foreground-muted"
                    />
                    <button
                      onClick={() => handleUploadQr(item.id)}
                      disabled={!selectedQrFiles[item.id] || uploadingQrId === item.id}
                      className="px-3 py-2 rounded-lg text-xs border border-gold/40 text-gold hover:bg-gold/10 disabled:opacity-50"
                    >
                      {uploadingQrId === item.id ? "Uploading..." : "Upload QR"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {/* Bookings Table (desktop) / Cards (mobile) */}
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.user')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.machine')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.duration')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.totalPrice')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.status')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.createdAt')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{booking.user?.firstName} {booking.user?.lastName}</p>
                            <p className="text-sm text-foreground-muted">{booking.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{booking.machine?.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">{booking.quantity} {t('table.quantity')} • {durationLabels[booking.rentalDuration]}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gold">${Math.round(Number(booking.totalPrice))}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                            {statusConfig[booking.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground-muted">{new Date(booking.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/admin/bookings/${booking.id}`)}
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

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-gold/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{booking.user?.firstName} {booking.user?.lastName}</p>
                        <p className="text-sm text-foreground-muted truncate">{booking.user?.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                        {statusConfig[booking.status].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-foreground">{booking.machine?.name}</p>
                        <p className="text-foreground-muted text-xs">{booking.quantity} {t('table.quantity')} • {durationLabels[booking.rentalDuration]}</p>
                      </div>
                      <p className="font-bold text-gold">${Math.round(Number(booking.totalPrice))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
      </div>
    </ClientOnly>
  );
}
