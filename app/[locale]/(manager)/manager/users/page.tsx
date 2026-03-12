"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  adminUsersApi,
  User,
} from "@/app/lib/api";
import { useTranslations } from "next-intl";
import CreateUserModal from "./components/CreateUserModal";

// Disable static generation for manager pages
export const dynamic = 'force-dynamic';

export default function ManagerUsersPage() {
  const t = useTranslations('manager.users');
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Check if create action is requested via URL
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminUsersApi.getAll();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(t('errors.failedToLoad'));
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await adminUsersApi.delete(id);
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(t('deleteFailed'));
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await adminUsersApi.activate(id);
      fetchUsers();
      if (selectedUser?.id === id) {
        const updated = await adminUsersApi.getOne(id);
        setSelectedUser(updated.data);
      }
    } catch (err) {
      console.error("Failed to activate user:", err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await adminUsersApi.deactivate(id);
      fetchUsers();
      if (selectedUser?.id === id) {
        const updated = await adminUsersApi.getOne(id);
        setSelectedUser(updated.data);
      }
    } catch (err) {
      console.error("Failed to deactivate user:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      searchQuery === "" ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gold px-6 py-3 rounded-lg text-sm font-semibold tracking-wide flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('createUser')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.total')}</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.active')}</p>
              <p className="text-xl font-bold text-green">{stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.admins')}</p>
              <p className="text-xl font-bold text-gold">{stats.admins}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t('stats.managers')}</p>
              <p className="text-xl font-bold text-purple">{stats.managers}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-foreground placeholder-foreground-muted"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-foreground"
            >
              <option value="all">{t('filters.allRoles')}</option>
              <option value="admin">{t('filters.admin')}</option>
              <option value="manager">{t('filters.manager')}</option>
              <option value="user">{t('filters.user')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">{t('table.user')}</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">{t('table.role')}</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">{t('table.status')}</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">{t('table.verified')}</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted">{t('table.joined')}</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-foreground-muted w-48">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-foreground-muted/20"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-foreground-muted/20 rounded w-32"></div>
                          <div className="h-3 bg-foreground-muted/20 rounded w-40"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-6 bg-foreground-muted/20 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-foreground-muted/20 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-foreground-muted/20 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-foreground-muted/20 rounded w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-8 bg-foreground-muted/20 rounded w-40"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-red">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-foreground-muted">
                    {t('noUsers')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-foreground/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-foreground-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-gold/20 text-gold' :
                        user.role === 'manager' ? 'bg-purple/20 text-purple' :
                        'bg-blue/20 text-blue'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-2 text-sm ${user.isActive ? 'text-green' : 'text-red'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green' : 'bg-red'}`}></span>
                        {user.isActive ? t('status.active') : t('status.inactive')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.emailVerified ? (
                        <span className="flex items-center gap-2 text-green text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('verified.yes')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-foreground-muted text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {t('verified.no')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gold hover:text-gold-light hover:bg-gold/10 rounded transition-colors"
                          title={t('actions.view')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="p-2 text-orange hover:text-orange-light hover:bg-orange/10 rounded transition-colors"
                            title={t('actions.deactivate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-2 text-green hover:text-green-light hover:bg-green/10 rounded transition-colors"
                            title={t('actions.activate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red hover:text-red-light hover:bg-red/10 rounded transition-colors"
                          title={t('actions.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchUsers();
          setShowCreateModal(false);
        }}
      />

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t('userDetails.title')}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xl">
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p className="text-foreground-muted">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.role')}</p>
                  <p className={`text-sm font-semibold ${
                    selectedUser.role === 'admin' ? "text-gold" :
                    selectedUser.role === 'manager' ? "text-purple" :
                    "text-blue"
                  }`}>
                    {selectedUser.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.status')}</p>
                  <p className={`text-sm font-semibold ${selectedUser.isActive ? "text-green" : "text-red"}`}>
                    {selectedUser.isActive ? t('status.active') : t('status.inactive')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.emailVerified')}</p>
                  <p className={`text-sm font-semibold ${selectedUser.emailVerified ? "text-green" : "text-foreground-muted"}`}>
                    {selectedUser.emailVerified ? t('verified.yes') : t('verified.no')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.joined')}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.phone && (
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.phone')}</p>
                  <p className="text-sm font-semibold text-foreground">{selectedUser.phone}</p>
                </div>
              )}

              {selectedUser.lastLoginAt && (
                <div>
                  <p className="text-sm text-foreground-muted mb-1">{t('details.lastLogin')}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(selectedUser.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedUser.isActive ? (
                  <button
                    onClick={() => {
                      handleDeactivate(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 text-orange hover:text-orange-light hover:bg-orange/10 border border-orange/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('actions.deactivate')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivate(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 text-green hover:text-green-light hover:bg-green/10 border border-green/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('actions.activate')}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(t('deleteConfirm'))) {
                      handleDelete(selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 text-red hover:text-red-light hover:bg-red/10 border border-red/30 rounded-lg transition-colors text-sm font-medium"
                >
                  {t('actions.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}