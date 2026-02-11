"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { subscriptionsApi } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const dynamic = 'force-dynamic';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if we have a subscription ID in the URL
    const subscriptionId = searchParams.get("subscription_id");
    const tranRef = searchParams.get("tranRef");

    if (subscriptionId) {
      loadSubscription(subscriptionId);
    } else {
      // If no subscription ID, just show success message
      setIsLoading(false);
    }
  }, [isAuthenticated, router, searchParams]);

  const loadSubscription = async (subscriptionId: string) => {
    try {
      const response = await subscriptionsApi.getMySubscription(subscriptionId);
      setSubscription(response.data);
    } catch (err) {
      console.error("Failed to load subscription:", err);
      setError("Failed to load subscription details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen main-bg relative">
        <div className="starfield" />
        <div className="golden-particles" />
        <div className="relative z-10">
          <Navbar />
          <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-foreground-muted">Loading...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-bg relative">
      <div className="starfield" />
      <div className="golden-particles" />
      <div className="relative z-10">
        <Navbar />
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              {error ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-red/20 flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-red"
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
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
                  <p className="text-foreground-muted mb-6">{error}</p>
                  <Link
                    href="/dashboard/subscriptions"
                    className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold inline-block"
                  >
                    View Subscriptions
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-foreground-muted mb-6">
                    Your subscription has been activated successfully.
                  </p>
                  {subscription && (
                    <div className="bg-background-secondary/50 rounded-xl p-6 mb-6 text-left">
                      <h3 className="font-semibold text-foreground mb-4">
                        Subscription Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground-muted">Machine:</span>
                          <span className="font-semibold text-foreground">
                            {subscription.machine?.name || 'Mining Machine'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-muted">Amount:</span>
                          <span className="font-semibold text-gold">
                            ${subscription.amount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground-muted">Status:</span>
                          <span
                            className={`font-semibold ${
                              subscription.status === "active"
                                ? "text-green"
                                : subscription.status === "pending"
                                ? "text-yellow-400"
                                : "text-foreground-muted"
                            }`}
                          >
                            {subscription.status.charAt(0).toUpperCase() +
                              subscription.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/dashboard/subscriptions"
                      className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
                    >
                      View My Subscriptions
                    </Link>
                    <Link
                      href="/machines"
                      className="px-6 py-3 rounded-xl text-sm font-semibold bg-background-secondary/50 text-foreground hover:bg-background-secondary transition-colors"
                    >
                      Browse More Machines
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
