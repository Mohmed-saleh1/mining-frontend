"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminUsersApi,
  User,
} from "@/app/lib/api";
import { useTranslations } from "next-intl";

// Disable static generation for admin pages
export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    users: users.filter((u) => u.role === "user").length,
    verified: users.filter((u) => u.emailVerified).length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {(() => {
              const titleTemplate = t('title', { management: '{management}' });
              const parts = titleTemplate.split('{management}');
              return parts.length > 1 ? (
                <>
                  {parts[0]}
                  <span className="gradient-text">{t('managementText')}</span>
                  {parts[1]}
                </>
              ) : t('title', { management: t('managementText') });
            })()}
          </h1>
          <p className="text-foreground-muted text-sm">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('addUser')}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.total')}</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.active')}</p>
          <p className="text-2xl font-bold text-green">{stats.active}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.inactive')}</p>
          <p className="text-2xl font-bold text-red">{stats.inactive}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.admins')}</p>
          <p className="text-2xl font-bold text-gold">{stats.admins}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.regularUsers')}</p>
          <p className="text-2xl font-bold text-foreground">{stats.users}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-foreground-muted mb-1">{t('stats.verified')}</p>
          <p className="text-2xl font-bold text-blue-400">{stats.verified}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-background-secondary border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: t('filters.all') },
            { value: "admin", label: t('filters.admins') },
            { value: "user", label: t('filters.users') },
            { value: "manager", label: t('filters.managers') },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterRole(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterRole === tab.value
                  ? "bg-gold text-background"
                  : "glass border border-border text-foreground-muted hover:text-gold hover:border-gold/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-xl overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red text-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-background-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('emptyState.noUsers')}</h3>
            <p className="text-foreground-muted text-sm mb-4">
              {searchQuery || filterRole !== "all"
                ? t('emptyState.adjustFilters')
                : t('emptyState.createFirstUser')}
            </p>
            {!searchQuery && filterRole === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
              >
                {t('createUser')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.user')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.email')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.role')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.verified')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gold/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-foreground-muted">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-gold/20 text-gold"
                            : user.role === "manager"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-foreground-muted/20 text-foreground-muted"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green/20 text-green"
                            : "bg-red/20 text-red"
                        }`}
                      >
                        {user.isActive ? t('status.active') : t('status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.emailVerified ? (
                        <span className="text-green text-sm">✓ {t('table.verified')}</span>
                      ) : (
                        <span className="text-foreground-muted text-sm">{t('details.notVerified')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-gold/10 text-gold transition-colors"
                          title={t('editUser')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="p-2 rounded-lg hover:bg-red/10 text-red transition-colors"
                            title={t('deactivate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="p-2 rounded-lg hover:bg-green/10 text-green transition-colors"
                            title={t('activate')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-red/10 text-red transition-colors"
                          title={t('deleteUser')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && !showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{t('details.title')}</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xl">
                  {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-foreground-muted">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">{t('details.role')}</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{selectedUser.role}</p>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">{t('details.status')}</p>
                  <p className={`text-sm font-semibold ${selectedUser.isActive ? "text-green" : "text-red"}`}>
                    {selectedUser.isActive ? t('status.active') : t('status.inactive')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary/50">
                  <p className="text-xs text-foreground-muted mb-1">{t('details.emailVerified')}</p>
                  <p className={`text-sm font-semibold ${selectedUser.emailVerified ? "text-green" : "text-foreground-muted"}`}>
                    {selectedUser.emailVerified ? t('details.verified') : t('details.notVerified')}
                  </p>
                </div>
                {selectedUser.phone && (
                  <div className="p-4 rounded-xl bg-background-secondary/50">
                    <p className="text-xs text-foreground-muted mb-1">{t('details.phone')}</p>
                    <p className="text-sm font-semibold text-foreground">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.createdAt && (
                  <div className="p-4 rounded-xl bg-background-secondary/50 col-span-2">
                    <p className="text-xs text-foreground-muted mb-1">{t('details.joined')}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                  }}
                  className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
                >
                  {t('editUser')}
                </button>
                {selectedUser.isActive ? (
                  <button
                    onClick={() => handleDeactivate(selectedUser.id)}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-red/10 text-red hover:bg-red/20 transition-colors"
                  >
                    {t('deactivate')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(selectedUser.id)}
                    className="px-6 py-3 rounded-xl text-sm font-semibold bg-green/10 text-green hover:bg-green/20 transition-colors"
                  >
                    {t('activate')}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold bg-red/10 text-red hover:bg-red/20 transition-colors"
                >
                  {t('deleteUser')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal - Simplified for now */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {showCreateModal ? t('createUser') : t('editUser')}
            </h2>
            <p className="text-foreground-muted mb-6">
              {t('details.formNotImplemented')}
            </p>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}
              className="btn-gold w-full px-6 py-3 rounded-xl text-sm font-semibold"
            >
              {t('details.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

