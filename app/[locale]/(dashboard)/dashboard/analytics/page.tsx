"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { bookingsApi, BookingAnalytics, BookingStatus } from "@/app/lib/api";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic';

const statusColors: Record<BookingStatus, string> = {
  pending: "bg-yellow-400",
  awaiting_payment: "bg-blue-400",
  payment_sent: "bg-purple-400",
  approved: "bg-green",
  rejected: "bg-red-400",
  cancelled: "bg-gray-400",
};

export default function AnalyticsPage() {
  const t = useTranslations('dashboard.analytics');
  const tStatus = useTranslations('dashboard.status');
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusLabels: Record<BookingStatus, string> = {
    pending: tStatus('pending'),
    awaiting_payment: tStatus('awaitingPayment'),
    payment_sent: tStatus('paymentSent'),
    approved: tStatus('approved'),
    rejected: tStatus('rejected'),
    cancelled: tStatus('cancelled'),
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await bookingsApi.getAnalytics();
      console.log("Analytics response:", response); // Debug log
      
      // Handle potential double-wrapping from transform interceptor
      let analyticsData = response?.data;
      if (analyticsData && typeof analyticsData === 'object' && 'data' in analyticsData) {
        analyticsData = (analyticsData as any).data;
      }
      
      if (analyticsData) {
        setAnalytics(analyticsData as BookingAnalytics);
      } else {
        console.error("No data in analytics response");
        setAnalytics(null);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to safely parse numbers
  const safeNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-foreground-muted">{t('failedToLoad')}</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for pie chart
  const bookingsByStatus = analytics?.bookingsByStatus || {};
  const revenueByMonth = analytics?.revenueByMonth || [];
  const subscriptionsByStatus = analytics?.subscriptionMetrics?.subscriptionsByStatus || {};
  
  const totalBookingsForPie = Object.values(bookingsByStatus).reduce((a, b) => Number(a) + Number(b), 0);
  const bookingPercentages = Object.entries(bookingsByStatus).map(([status, count]) => ({
    status: status as BookingStatus,
    count: Number(count),
    percentage: totalBookingsForPie > 0 ? (Number(count) / totalBookingsForPie) * 100 : 0,
  })).filter(item => item.count > 0);

  const totalSubscriptionsForPie = Object.values(subscriptionsByStatus).reduce((a, b) => Number(a) + Number(b), 0);
  const subscriptionPercentages = Object.entries(subscriptionsByStatus).map(([status, count]) => ({
    status,
    count: Number(count),
    percentage: totalSubscriptionsForPie > 0 ? (Number(count) / totalSubscriptionsForPie) * 100 : 0,
  })).filter(item => item.count > 0);

  const subscriptionStatusColors: Record<string, string> = {
    pending: "bg-yellow-400",
    active: "bg-green",
    expired: "bg-red-400",
    cancelled: "bg-gray-400",
  };

  const subscriptionStatusStrokeColors: Record<string, string> = {
    pending: "#FBBF24",
    active: "#10B981",
    expired: "#F87171",
    cancelled: "#9CA3AF",
  };

  const subscriptionStatusLabels: Record<string, string> = {
    pending: "Pending",
    active: "Active",
    expired: "Expired",
    cancelled: "Cancelled",
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = revenueByMonth.length > 0
    ? Math.max(...revenueByMonth.map(r => r.revenue))
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {(() => {
                const titleTemplate = t('title', { dashboard: '{dashboard}' });
                const parts = titleTemplate.split('{dashboard}');
                return parts.length > 1 ? (
                  <>
                    {parts[0]}
                    <span className="gradient-text">{t('dashboardText')}</span>
                    {parts[1]}
                  </>
                ) : t('title', { dashboard: t('dashboardText') });
              })()}
            </h1>
            <p className="text-foreground-muted text-sm">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="btn-outline px-4 py-2 rounded-lg text-sm font-medium"
          >
            {t('viewBookings')}
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid - Hybrid Approach */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Show subscription metrics if user has subscriptions, otherwise show booking metrics */}
        {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? (
          <>
            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(analytics?.subscriptionMetrics?.monthlyEarnings || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Daily Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(analytics?.subscriptionMetrics?.avgDailyEarnings || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.subscriptionMetrics?.activeSubscriptions || 0}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Total Investment</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(analytics?.subscriptionMetrics?.totalSubscriptionValue || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Fallback to booking metrics when no subscriptions */}
            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Total Investment</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(analytics?.totalInvestment || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(analytics?.totalRevenue || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.totalBookings || 0}</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Active Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{analytics?.activeBookings || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time - Bar Chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">{t('revenueOverTime')}</h2>
          {revenueByMonth.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-64">
                {revenueByMonth.map((item, index) => {
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="relative w-full h-full flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-gold to-gold-light rounded-t transition-all hover:from-gold-light hover:to-gold cursor-pointer shadow-lg"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '0' }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-foreground">
                          ${item.revenue.toFixed(0)}
                        </p>
                        <p className="text-xs text-foreground-muted mt-1">
                          {item.month.split(' ')[0]}
                        </p>
                      </div>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-background-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground z-10 whitespace-nowrap shadow-lg">
                        <p className="font-semibold">{item.month}</p>
                        <p className="text-gold">${item.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">{t('averageMonthlyRevenue')}</span>
                  <span className="text-sm font-bold text-foreground">
                    ${revenueByMonth.length > 0
                      ? (revenueByMonth.reduce((sum, item) => sum + item.revenue, 0) / revenueByMonth.length).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-foreground-muted text-sm">{t('noRevenueData')}</p>
              <p className="text-foreground-muted text-xs mt-1">{t('noRevenueDescription')}</p>
            </div>
          )}
        </div>

        {/* Status Distribution - Pie Chart */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? 'Subscriptions by Status' : 'Bookings by Status'}
          </h2>
          {((analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? totalSubscriptionsForPie : totalBookingsForPie) > 0 ? (
            <div className="space-y-6">
              {/* Pie Chart Visualization */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let currentAngle = 0;
                    const radius = 45;
                    const circumference = 2 * Math.PI * radius;
                    
                    const percentages = (analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? subscriptionPercentages : bookingPercentages;
                    // const colors = (analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? subscriptionStatusStrokeColors : statusColors;
                    
                    return percentages.map((item) => {
                      const percentage = item.percentage / 100;
                      const strokeDasharray = circumference;
                      const strokeDashoffset = circumference - (percentage * circumference);
                      const rotation = currentAngle;
                      currentAngle += percentage * 360;
                      
                      return (
                        <circle
                          key={item.status}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="none"
                          stroke={(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 
                            ? subscriptionStatusStrokeColors[item.status] || '#6B7280'
                            : statusColors[item.status as BookingStatus]?.replace('bg-', '#') || '#6B7280'}
                          strokeWidth="10"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform={`rotate(${rotation} 50 50)`}
                          className="transition-all hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? totalSubscriptionsForPie : totalBookingsForPie}
                    </p>
                    <p className="text-xs text-foreground-muted">Total</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {((analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? subscriptionPercentages : bookingPercentages).map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-2 rounded-lg hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        (analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 
                          ? (subscriptionStatusColors[item.status] || 'bg-gray-400')
                          : (statusColors[item.status as BookingStatus] || 'bg-gray-400')
                      }`} />
                      <span className="text-sm text-foreground">
                        {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 
                          ? (subscriptionStatusLabels[item.status] || item.status)
                          : (statusLabels[item.status as BookingStatus] || item.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{item.count}</span>
                      <span className="text-xs text-foreground-muted ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-foreground-muted text-sm">No subscription data available</p>
              <p className="text-foreground-muted text-xs mt-1">Start a subscription to see analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? 'Subscription Status Breakdown' : 'Booking Status Breakdown'}
          </h2>
          <div className="space-y-3">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? (
              // Subscription status breakdown
              Object.entries(subscriptionsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${subscriptionStatusColors[status] || 'bg-gray-400'}`} />
                    <span className="text-sm text-foreground">{subscriptionStatusLabels[status] || status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-background-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${subscriptionStatusColors[status] || 'bg-gray-400'}`}
                        style={{
                          width: `${totalSubscriptionsForPie > 0 ? (Number(count) / totalSubscriptionsForPie) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              // Booking status breakdown
              Object.entries(bookingsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as BookingStatus] || 'bg-gray-400'}`} />
                    <span className="text-sm text-foreground">{statusLabels[status as BookingStatus] || status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-background-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[status as BookingStatus] || 'bg-gray-400'}`}
                        style={{
                          width: `${totalBookingsForPie > 0 ? (Number(count) / totalBookingsForPie) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? 'Earnings Summary' : 'Revenue Summary'}
          </h2>
          <div className="space-y-4">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? (
              // Subscription earnings
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-secondary/30">
                  <span className="text-sm text-foreground-muted">Total Investment</span>
                  <span className="text-lg font-bold text-foreground">
                    ${Number(analytics?.subscriptionMetrics?.totalSubscriptionValue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-secondary/30">
                  <span className="text-sm text-foreground-muted">Monthly Earnings</span>
                  <span className="text-lg font-bold text-green">
                    ${Number(analytics?.subscriptionMetrics?.monthlyEarnings || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-secondary/30">
                  <span className="text-sm text-foreground-muted">Daily Earnings</span>
                  <span className="text-lg font-bold text-gold">
                    ${Number(analytics?.subscriptionMetrics?.avgDailyEarnings || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <span className="text-sm font-medium text-foreground">Monthly ROI</span>
                  <span className="text-lg font-bold text-gold">
                    {(analytics?.subscriptionMetrics?.totalSubscriptionValue || 0) > 0
                      ? (((analytics?.subscriptionMetrics?.monthlyEarnings || 0) / (analytics?.subscriptionMetrics?.totalSubscriptionValue || 1)) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                {(analytics?.subscriptionMetrics?.activeSubscriptions || 0) > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-foreground-muted mb-2">Active Mining Power</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {analytics?.subscriptionMetrics?.activeSubscriptions} Active Subscription{(analytics?.subscriptionMetrics?.activeSubscriptions || 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-semibold text-gold">
                        Earning ${Number(analytics?.subscriptionMetrics?.avgDailyEarnings || 0).toFixed(2)}/day
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Booking revenue
              <>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-secondary/30">
                  <span className="text-sm text-foreground-muted">Total Investment</span>
                  <span className="text-lg font-bold text-foreground">
                    ${Number(analytics?.totalInvestment || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background-secondary/30">
                  <span className="text-sm text-foreground-muted">Total Revenue</span>
                  <span className="text-lg font-bold text-green">
                    ${Number(analytics?.totalRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <span className="text-sm font-medium text-foreground">ROI</span>
                  <span className="text-lg font-bold text-gold">
                    {(analytics?.totalInvestment || 0) > 0
                      ? (((analytics?.totalRevenue || 0) / (analytics?.totalInvestment || 1)) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                {revenueByMonth.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-foreground-muted mb-2">Best Performing Month</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {revenueByMonth.reduce((max, item) => 
                          item.revenue > max.revenue ? item : max
                        ).month}
                      </span>
                      <span className="text-sm font-semibold text-gold">
                        ${Math.max(...revenueByMonth.map(r => r.revenue)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {((analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 || (analytics?.totalBookings || 0) > 0) && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? 'Key Mining Insights' : 'Key Booking Insights'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0 ? (
              // Subscription insights
              <>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Active Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0
                      ? (((analytics?.subscriptionMetrics?.activeSubscriptions || 0) / (analytics?.subscriptionMetrics?.totalSubscriptions || 1)) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Avg Investment</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(analytics?.subscriptionMetrics?.totalSubscriptions || 0) > 0
                      ? ((analytics?.subscriptionMetrics?.totalSubscriptionValue || 0) / (analytics?.subscriptionMetrics?.totalSubscriptions || 1)).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Payback Period</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(analytics?.subscriptionMetrics?.avgDailyEarnings || 0) > 0 && (analytics?.subscriptionMetrics?.totalSubscriptionValue || 0) > 0
                      ? Math.ceil((analytics?.subscriptionMetrics?.totalSubscriptionValue || 0) / (analytics?.subscriptionMetrics?.avgDailyEarnings || 1))
                      : '∞'} days
                  </p>
                </div>
              </>
            ) : (
              // Booking insights
              <>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(analytics?.totalBookings || 0) > 0
                      ? (((analytics?.activeBookings || 0) / (analytics?.totalBookings || 1)) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Avg Booking Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(analytics?.totalBookings || 0) > 0
                      ? ((analytics?.totalInvestment || 0) / (analytics?.totalBookings || 1)).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background-secondary/30">
                  <p className="text-xs text-foreground-muted mb-1">Avg Revenue per Booking</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(analytics?.activeBookings || 0) > 0
                      ? ((analytics?.totalRevenue || 0) / (analytics?.activeBookings || 1)).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Getting Started Section for Users with No Subscriptions */}
      {(analytics?.subscriptionMetrics?.totalSubscriptions || 0) === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Start Your Mining Journey</h3>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            You don&apos;t have any active mining subscriptions yet. Start mining cryptocurrency to see real earnings data and analytics.
          </p>
          <Link
            href="/dashboard/machines"
            className="btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Browse Mining Machines
          </Link>
        </div>
      )}
    </div>
  );
}


