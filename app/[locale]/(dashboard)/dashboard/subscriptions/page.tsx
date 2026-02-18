"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { subscriptionsApi, Subscription, SubscriptionStatus, PaymentMethod } from "@/app/lib/api";
import { useRouter } from "@/i18n/navigation";

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic';

const statusConfig: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Payment", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  active: { label: "Active", color: "text-green-400", bg: "bg-green-400/10" },
  expired: { label: "Expired", color: "text-gray-400", bg: "bg-gray-400/10" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function UserSubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionsApi.getMySubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setCancellingId(id);
    try {
      await subscriptionsApi.cancel(id);
      await loadSubscriptions();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Subscriptions</h1>
          <p className="text-foreground-muted">Manage your mining machine subscriptions</p>
        </div>

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
            <h2 className="text-xl font-bold text-foreground mb-2">No Subscriptions Yet</h2>
            <p className="text-foreground-muted mb-6">
              Start mining by subscribing to a machine plan
            </p>
            <button
              onClick={() => router.push("/machines")}
              className="btn-gold px-6 py-3 rounded-xl font-semibold"
            >
              Browse Machines
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {subscriptions.map((subscription) => {
              const status = statusConfig[subscription.status];
              return (
                <div key={subscription.id} className="glass rounded-2xl p-6">
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
                      <p className="text-foreground-muted mb-2">
                        {subscription.machine.name}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-muted">Amount</p>
                          <p className="font-semibold text-foreground">${subscription.amount}</p>
                        </div>
                        <div>
                          <p className="text-foreground-muted">Payment</p>
                          <p className="font-semibold text-foreground flex items-center gap-1">
                            {subscription.paymentMethod === 'binance' ? (
                              <>
                                <span className="w-4 h-4 inline-flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2ZM2 12L4 10L6 12L4 14L2 12ZM6.5 16.5L12 22L17.5 16.5L15.5 14.5L12 18L8.5 14.5L6.5 16.5ZM18 12L20 10L22 12L20 14L18 12ZM12 10L10 12L12 14L14 12L12 10Z" />
                                  </svg>
                                </span>
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
                          <p className="text-foreground-muted">Start Date</p>
                          <p className="font-semibold text-foreground">
                            {formatDate(subscription.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground-muted">End Date</p>
                          <p className="font-semibold text-foreground">
                            {formatDate(subscription.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground-muted">Quantity</p>
                          <p className="font-semibold text-foreground">
                            {subscription.quantity || subscription.plan?.quantity || 1} unit{(subscription.quantity || subscription.plan?.quantity || 1) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {subscription.status === "active" && (
                        <button
                          onClick={() => handleCancel(subscription.id)}
                          disabled={cancellingId === subscription.id}
                          className="px-4 py-2 rounded-xl bg-red/10 text-red hover:bg-red/20 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === subscription.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      {subscription.status === "pending" && (
                        <button
                          onClick={() => router.push("/machines")}
                          className="px-4 py-2 rounded-xl btn-gold"
                        >
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



