"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { adminUsersApi, User } from "@/app/lib/api";
import Link from "next/link";

// Disable static generation for manager pages
export const dynamic = 'force-dynamic';

export default function ManagerDashboardPage() {
  const t = useTranslations('manager.dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminUsersApi.getAll();
        setUsers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === "admin").length,
    managers: users.filter((u) => u.role === "manager").length,
    regularUsers: users.filter((u) => u.role === "user").length,
    verified: users.filter((u) => u.emailVerified).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.totalUsers')}</p>
              <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.activeUsers')}</p>
              <p className="text-2xl font-bold text-green">{isLoading ? "..." : stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.admins')}</p>
              <p className="text-2xl font-bold text-gold">{isLoading ? "..." : stats.admins}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.managers')}</p>
              <p className="text-2xl font-bold text-purple">{isLoading ? "..." : stats.managers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('quickActions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/manager/users"
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-gold transition-colors">{t('quickActions.manageUsers')}</h3>
              <p className="text-sm text-foreground-muted">{t('quickActions.manageUsersDesc')}</p>
            </div>
          </Link>

          <Link
            href="/manager/users?action=create"
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-green/50 hover:bg-green/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center group-hover:bg-green/20 transition-colors">
              <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-green transition-colors">{t('quickActions.createUser')}</h3>
              <p className="text-sm text-foreground-muted">{t('quickActions.createUserDesc')}</p>
            </div>
          </Link>

          <Link
            href="/manager/reports"
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-blue/50 hover:bg-blue/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-blue transition-colors">{t('quickActions.viewReports')}</h3>
              <p className="text-sm text-foreground-muted">{t('quickActions.viewReportsDesc')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('recentUsers.title')}</h2>
          <Link
            href="/manager/users"
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            {t('recentUsers.viewAll')}
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 rounded-full bg-foreground-muted/20"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-foreground-muted/20 rounded w-1/3"></div>
                  <div className="h-3 bg-foreground-muted/20 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-foreground-muted/20 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-foreground-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-gold/20 text-gold' :
                    user.role === 'manager' ? 'bg-purple/20 text-purple' :
                    'bg-blue/20 text-blue'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green' : 'bg-red'}`}></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}