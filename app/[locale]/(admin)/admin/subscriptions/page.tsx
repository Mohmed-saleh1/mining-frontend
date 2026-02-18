"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import {
  subscriptionsAdminApi,
  Subscription,
  SubscriptionStatus,
} from "@/app/lib/api";

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';

const statusConfig: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Payment", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  active: { label: "Active", color: "text-green-400", bg: "bg-green-400/10" },
  expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-400/10" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function AdminSubscriptionsPage() {
  useAuth(); // Ensure user is authenticated
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statistics, setStatistics] = useState<{
    total: number;
    pending: number;
    active: number;
    expired: number;
    cancelled: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSubscriptions();
    loadStatistics();
  }, [statusFilter, currentPage]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionsAdminApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSubscriptions(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await subscriptionsAdminApi.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  };

  const openSubscriptionDetails = async (subscription: Subscription) => {
    try {
      const response = await subscriptionsAdminApi.getOne(subscription.id);
      setSelectedSubscription(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to load subscription details:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !subscriptions.length) {
    return (
      <div className="min-h-screen main-bg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-foreground-muted">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-bg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Subscriptions</h1>
          <p className="text-foreground-muted">Manage all user subscriptions</p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-foreground-muted mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-foreground-muted mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{statistics.pending}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-foreground-muted mb-1">Active</p>
              <p className="text-2xl font-bold text-green-400">{statistics.active}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-foreground-muted mb-1">Expired</p>
              <p className="text-2xl font-bold text-gray-400">{statistics.expired}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-foreground-muted mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-400">{statistics.cancelled}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-gold text-background"
                  : "bg-background-secondary/50 text-foreground-muted hover:bg-background-secondary"
              }`}
            >
              All
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as SubscriptionStatus)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? `${config.bg} ${config.color} border-2 border-current`
                    : "bg-background-secondary/50 text-foreground-muted hover:bg-background-secondary"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-foreground-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414.586A1 1 0 0119 5v14a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-xl font-bold text-foreground mb-2">No Subscriptions Found</h2>
            <p className="text-foreground-muted">
              {statusFilter === "all"
                ? "No subscriptions have been created yet."
                : `No subscriptions with status "${statusConfig[statusFilter as SubscriptionStatus]?.label}"`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {subscriptions.map((subscription) => {
                const status = statusConfig[subscription.status];
                return (
                  <div
                    key={subscription.id}
                    className="glass rounded-2xl p-6 hover:border-gold/40 border border-border transition-all cursor-pointer"
                    onClick={() => openSubscriptionDetails(subscription)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">
                            {subscription.machine?.name || subscription.plan?.name || 'Subscription'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-foreground-muted">User</p>
                            <p className="font-semibold text-foreground">
                              {subscription.user?.firstName} {subscription.user?.lastName}
                            </p>
                            <p className="text-xs text-foreground-muted">{subscription.user?.email}</p>
                          </div>
                          <div>
                            <p className="text-foreground-muted">Machine</p>
                            <p className="font-semibold text-foreground">{subscription.machine.name}</p>
                          </div>
                          <div>
                            <p className="text-foreground-muted">Amount</p>
                            <p className="font-semibold text-foreground">${subscription.amount}</p>
                          </div>
                          <div>
                            <p className="text-foreground-muted">Payment</p>
                            <p className="font-semibold text-foreground flex items-center gap-1">
                              {subscription.paymentMethod === 'binance' ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2ZM2 12L4 10L6 12L4 14L2 12ZM6.5 16.5L12 22L17.5 16.5L15.5 14.5L12 18L8.5 14.5L6.5 16.5ZM18 12L20 10L22 12L20 14L18 12ZM12 10L10 12L12 14L14 12L12 10Z" />
                                  </svg>
                                  Crypto
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                  Card
                                </>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-foreground-muted">Created</p>
                            <p className="font-semibold text-foreground">
                              {formatDate(subscription.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-foreground-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-background-secondary/50 text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-foreground-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-background-secondary/50 text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedSubscription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Subscription Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-foreground-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      statusConfig[selectedSubscription.status].color
                    } ${statusConfig[selectedSubscription.status].bg}`}
                  >
                    {statusConfig[selectedSubscription.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Machine</p>
                  <p className="font-semibold text-foreground">{selectedSubscription.machine?.name || 'N/A'}</p>
                </div>
                {selectedSubscription.duration && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Duration</p>
                    <p className="font-semibold text-foreground capitalize">
                      {selectedSubscription.durationNumber || 1} {selectedSubscription.duration}{(selectedSubscription.durationNumber || 1) > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {selectedSubscription.plan && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Plan</p>
                    <p className="font-semibold text-foreground">{selectedSubscription.plan.name}</p>
                    {selectedSubscription.plan.description && (
                      <p className="text-sm text-foreground-muted mt-1">
                        {selectedSubscription.plan.description}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm text-foreground-muted mb-1">User</p>
                  <p className="font-semibold text-foreground">
                    {selectedSubscription.user?.firstName} {selectedSubscription.user?.lastName}
                  </p>
                  <p className="text-sm text-foreground-muted">{selectedSubscription.user?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Amount</p>
                    <p className="font-semibold text-foreground">${selectedSubscription.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Quantity</p>
                    <p className="font-semibold text-foreground">
                      {selectedSubscription.quantity || selectedSubscription.plan?.quantity || 1} unit
                      {(selectedSubscription.quantity || selectedSubscription.plan?.quantity || 1) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Start Date</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedSubscription.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">End Date</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedSubscription.endDate)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Payment Method</p>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {selectedSubscription.paymentMethod === 'binance' ? (
                      <>
                        <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2ZM2 12L4 10L6 12L4 14L2 12ZM6.5 16.5L12 22L17.5 16.5L15.5 14.5L12 18L8.5 14.5L6.5 16.5ZM18 12L20 10L22 12L20 14L18 12ZM12 10L10 12L12 14L14 12L12 10Z" />
                        </svg>
                        Binance Pay (Crypto)
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        PayTabs (Card)
                      </>
                    )}
                  </p>
                </div>
                {selectedSubscription.paytabsPaymentId && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">PayTabs Payment ID</p>
                    <p className="font-semibold text-foreground">
                      {selectedSubscription.paytabsPaymentId}
                    </p>
                  </div>
                )}
                {selectedSubscription.binanceOrderId && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Binance Order ID</p>
                    <p className="font-semibold text-foreground">
                      {selectedSubscription.binanceOrderId}
                    </p>
                  </div>
                )}
                {selectedSubscription.binancePrepayId && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Binance Prepay ID</p>
                    <p className="font-semibold text-foreground">
                      {selectedSubscription.binancePrepayId}
                    </p>
                  </div>
                )}
                {selectedSubscription.paidAt && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Paid At</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(selectedSubscription.paidAt)}
                    </p>
                  </div>
                )}
                {selectedSubscription.notes && (
                  <div>
                    <p className="text-sm text-foreground-muted mb-1">Notes</p>
                    <p className="text-foreground">{selectedSubscription.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



