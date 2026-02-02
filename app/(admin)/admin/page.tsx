"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { miningMachinesApi, MiningMachine } from "@/app/lib/api";

export default function AdminDashboardPage() {
  const [machines, setMachines] = useState<MiningMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await miningMachinesApi.getAll();
        setMachines(response.data || []);
      } catch (error) {
        console.error("Failed to fetch machines:", error);
        setMachines([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const stats = [
    {
      label: "Total Machines",
      value: machines?.length || 0,
      icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
      color: "gold",
    },
    {
      label: "Active Machines",
      value: machines?.filter((m) => m.isActive).length || 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "green",
    },
    {
      label: "Featured",
      value: machines?.filter((m) => m.isFeatured).length || 0,
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      color: "gold",
    },
    {
      label: "Available Units",
      value: machines?.reduce((acc, m) => acc + (m.totalUnits - m.rentedUnits), 0) || 0,
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      color: "gold",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-foreground-muted text-sm">
          Manage your mining machines and monitor platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
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
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-xl p-6 animate-fade-in-up stagger-2">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/machines"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <p className="text-sm font-medium text-foreground">Manage Machines</p>
            </Link>
            <Link
              href="/admin/machines?action=new"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium text-foreground">Add New Machine</p>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium text-foreground">Manage Users</p>
            </Link>
            <Link
              href="/"
              className="p-4 rounded-lg bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group"
            >
              <svg className="w-8 h-8 text-gold mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm font-medium text-foreground">View Site</p>
            </Link>
          </div>
        </div>

        {/* Recent Machines */}
        <div className="glass rounded-xl p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Machines</h2>
            <Link href="/admin/machines" className="text-sm text-gold hover:underline">
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-background-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (machines?.length || 0) === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background-secondary flex items-center justify-center">
                <svg className="w-6 h-6 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <p className="text-foreground-muted text-sm">No machines yet</p>
              <Link href="/admin/machines?action=new" className="text-gold text-sm hover:underline">
                Add your first machine
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {machines.slice(0, 5).map((machine) => (
                <Link
                  key={machine.id}
                  href={`/admin/machines?edit=${machine.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50 hover:bg-gold/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{machine.name}</p>
                    <p className="text-xs text-foreground-muted">
                      {machine.hashRate} {machine.hashRateUnit} • ${machine.pricePerDay}/day
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${machine.isActive ? "bg-green" : "bg-foreground-muted"}`} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

