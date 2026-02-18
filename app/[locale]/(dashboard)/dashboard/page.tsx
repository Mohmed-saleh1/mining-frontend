"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { bookingsApi, BookingAnalytics, BookingStatus } from "@/app/lib/api";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Disable static generation for dashboard pages
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusLabels: Record<BookingStatus, string> = {
    pending: t('status.pending'),
    awaiting_payment: t('status.awaitingPayment'),
    payment_sent: t('status.paymentSent'),
    approved: t('status.approved'),
    rejected: t('status.rejected'),
    cancelled: t('status.cancelled'),
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await bookingsApi.getAnalytics();
      console.log("Analytics response:", response); // Debug log
      if (response?.data) {
        setAnalytics(response.data);
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

  const stats = analytics ? [
    { 
      label: t('stats.totalInvestment'), 
      value: `$${safeNumber(analytics.totalInvestment).toFixed(2)}`, 
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", 
      color: "gold" 
    },
    { 
      label: t('stats.activeBookings'), 
      value: String(safeNumber(analytics.activeBookings)), 
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", 
      color: "gold" 
    },
    { 
      label: t('stats.totalRevenue'), 
      value: `$${safeNumber(analytics.totalRevenue).toFixed(2)}`, 
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", 
      color: "green" 
    },
    { 
      label: t('stats.totalBookings'), 
      value: String(safeNumber(analytics.totalBookings)), 
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", 
      color: "gold" 
    },
  ] : [
    { label: t('stats.totalInvestment'), value: "$0.00", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "gold" },
    { label: t('stats.activeBookings'), value: "0", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "gold" },
    { label: t('stats.totalRevenue'), value: "$0.00", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "green" },
    { label: t('stats.totalBookings'), value: "0", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "gold" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {(() => {
            const titleTemplate = t('welcome.title', { name: '{name}' });
            const parts = titleTemplate.split('{name}');
            return (
              <>
                {parts[0]}
                <span className="gradient-text">{user?.firstName}</span>
                {parts[1]}
              </>
            );
          })()}
        </h1>
        <p className="text-foreground-muted text-sm">
          {t('welcome.subtitle')}
        </p>
      </div>

      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="mb-6 p-4 rounded-xl bg-gold/10 border border-gold/30 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gold">{t('emailVerification.title')}</p>
              <p className="text-xs text-foreground-muted">
                {t('emailVerification.description')}
              </p>
            </div>
            <Link
              href="/verify-email-notice"
              className="btn-outline px-4 py-2 rounded-lg text-xs font-medium"
            >
              {t('emailVerification.verifyNow')}
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="glass rounded-xl p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background-secondary" />
                <div className="flex-1">
                  <div className="h-4 bg-background-secondary rounded mb-2" />
                  <div className="h-6 bg-background-secondary rounded w-20" />
                </div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                  <svg className={`w-6 h-6 text-${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings by Status */}
          <div className="glass rounded-xl p-6 animate-fade-in-up">
            <h2 className="text-lg font-bold text-foreground mb-4">{t('analytics.bookingsByStatus')}</h2>
            <div className="space-y-3">
              {Object.entries(analytics?.bookingsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'approved' ? 'bg-green' :
                      status === 'pending' ? 'bg-yellow-400' :
                      status === 'awaiting_payment' ? 'bg-blue-400' :
                      status === 'payment_sent' ? 'bg-purple-400' :
                      status === 'rejected' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm text-foreground-muted">{statusLabels[status as BookingStatus]}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="glass rounded-xl p-6 animate-fade-in-up">
            <h2 className="text-lg font-bold text-foreground mb-4">{t('analytics.revenueOverTime')}</h2>
            {(analytics?.revenueByMonth || []).length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end gap-2 h-32">
                  {(analytics?.revenueByMonth || []).map((item, index) => {
                    const maxRevenue = Math.max(...(analytics?.revenueByMonth || []).map(r => r.revenue));
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div 
                          className="w-full bg-gold rounded-t transition-all hover:bg-gold/80 cursor-pointer"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                        />
                        <span className="text-xs text-foreground-muted text-center leading-tight">
                          {item.month.split(' ')[0]}
                        </span>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-background-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground z-10 whitespace-nowrap">
                          {item.month}: ${item.revenue.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{t('analytics.totalRevenue')}</span>
                    <span className="font-bold text-gold">${Number(analytics?.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground-muted text-sm">{t('analytics.noRevenueData')}</p>
                <p className="text-foreground-muted text-xs mt-1">{t('analytics.noRevenueDescription')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Get Started Card */}
        <div className="glass rounded-xl p-6 animate-fade-in-up stagger-2">
          <h2 className="text-lg font-bold text-foreground mb-4">{t('getStarted.title')}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-background-secondary/50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.emailVerified ? 'bg-green/20 text-green' : 'bg-gold/20 text-gold'}`}>
                {user?.emailVerified ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">1</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('getStarted.verifyEmail.title')}</p>
                <p className="text-xs text-foreground-muted">
                  {user?.emailVerified ? t('getStarted.verifyEmail.completed') : t('getStarted.verifyEmail.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-background-secondary/50">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <span className="text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('getStarted.fundWallet.title')}</p>
                <p className="text-xs text-foreground-muted">{t('getStarted.fundWallet.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-background-secondary/50">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <span className="text-sm font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('getStarted.choosePackage.title')}</p>
                <p className="text-xs text-foreground-muted">{t('getStarted.choosePackage.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="glass rounded-xl p-6 animate-fade-in-up stagger-3">
          <h2 className="text-lg font-bold text-foreground mb-4">{t('quickActions.title')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/bookings"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium text-foreground">{t('quickActions.myBookings')}</p>
            </Link>
            <Link
              href="/dashboard/wallet"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-sm font-medium text-foreground">{t('quickActions.manageWallet')}</p>
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm font-medium text-foreground">{t('quickActions.subscriptions')}</p>
            </Link>
            <Link
              href="/dashboard/profile"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm font-medium text-foreground">{t('quickActions.editProfile')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-xl p-6 animate-fade-in-up stagger-4">
        <h2 className="text-lg font-bold text-foreground mb-4">{t('recentActivity.title')}</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-secondary flex items-center justify-center">
            <svg className="w-8 h-8 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-foreground-muted text-sm">{t('recentActivity.noActivity')}</p>
          <p className="text-foreground-muted text-xs mt-1">{t('recentActivity.description')}</p>
        </div>
      </div>
    </div>
  );
}
