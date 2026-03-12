"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { adminUsersApi, User } from "@/app/lib/api";

// Disable static generation for manager pages
export const dynamic = 'force-dynamic';

export default function ManagerReportsPage() {
  const t = useTranslations('manager.reports');
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
    unverified: users.filter((u) => !u.emailVerified).length,
  };

  // Calculate percentages
  const percentages = {
    active: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
    verified: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0,
    admins: stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0,
    managers: stats.total > 0 ? Math.round((stats.managers / stats.total) * 100) : 0,
    regularUsers: stats.total > 0 ? Math.round((stats.regularUsers / stats.total) * 100) : 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-foreground-muted">{t('subtitle')}</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground-muted">{t('overview.totalUsers')}</h3>
            <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">{isLoading ? "..." : stats.total}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green">+{isLoading ? "..." : stats.active}</span>
            <span className="text-xs text-foreground-muted">{t('overview.active')}</span>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground-muted">{t('overview.activeRate')}</h3>
            <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green mb-2">{isLoading ? "..." : percentages.active}%</p>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div 
              className="bg-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentages.active}%` }}
            ></div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground-muted">{t('overview.verificationRate')}</h3>
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gold mb-2">{isLoading ? "..." : percentages.verified}%</p>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div 
              className="bg-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentages.verified}%` }}
            ></div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground-muted">{t('overview.newThisMonth')}</h3>
            <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple mb-2">
            {isLoading ? "..." : users.filter(u => {
              const userDate = new Date(u.createdAt);
              const now = new Date();
              const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              return userDate >= thisMonth;
            }).length}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple">+12%</span>
            <span className="text-xs text-foreground-muted">{t('overview.fromLastMonth')}</span>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">{t('roleDistribution.title')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue"></div>
              <span className="text-foreground">{t('roleDistribution.users')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">{stats.regularUsers}</span>
              <span className="text-foreground-muted text-sm">{percentages.regularUsers}%</span>
            </div>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div 
              className="bg-blue h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentages.regularUsers}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple"></div>
              <span className="text-foreground">{t('roleDistribution.managers')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">{stats.managers}</span>
              <span className="text-foreground-muted text-sm">{percentages.managers}%</span>
            </div>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div 
              className="bg-purple h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentages.managers}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gold"></div>
              <span className="text-foreground">{t('roleDistribution.admins')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">{stats.admins}</span>
              <span className="text-foreground-muted text-sm">{percentages.admins}%</span>
            </div>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div 
              className="bg-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentages.admins}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('statusSummary.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('statusSummary.active')}</span>
              <span className="text-green font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('statusSummary.inactive')}</span>
              <span className="text-red font-medium">{stats.inactive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('statusSummary.verified')}</span>
              <span className="text-green font-medium">{stats.verified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('statusSummary.unverified')}</span>
              <span className="text-foreground-muted font-medium">{stats.unverified}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('quickStats.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('quickStats.totalAccounts')}</span>
              <span className="text-foreground font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('quickStats.activeToday')}</span>
              <span className="text-gold font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('quickStats.newRegistrations')}</span>
              <span className="text-blue font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">{t('quickStats.pendingVerifications')}</span>
              <span className="text-purple font-medium">{stats.unverified}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}