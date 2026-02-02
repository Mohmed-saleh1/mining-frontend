"use client";

import { useEffect, useState, useCallback } from "react";
import {
  contactAdminApi,
  ContactSubmission,
  ContactStatus,
  ContactStatistics,
} from "@/app/lib/api";

const statusColors: Record<ContactStatus, string> = {
  new: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-gold/20 text-gold",
  resolved: "bg-green/20 text-green",
  closed: "bg-foreground-muted/20 text-foreground-muted",
};

const statusLabels: Record<ContactStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [statistics, setStatistics] = useState<ContactStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const [contactsRes, statsRes] = await Promise.all([
        contactAdminApi.getAll({
          page,
          limit: 20,
          status: filterStatus === "all" ? undefined : filterStatus,
        }),
        contactAdminApi.getStatistics(),
      ]);
      
      setContacts(contactsRes.data?.data || []);
      setTotalPages(contactsRes.data?.totalPages || 1);
      setStatistics(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to load contact requests");
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusChange = async (id: string, status: ContactStatus) => {
    try {
      await contactAdminApi.update(id, { status });
      fetchContacts();
      if (selectedContact?.id === id) {
        setSelectedContact((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactAdminApi.markAsRead(id);
      fetchContacts();
      if (selectedContact?.id === id) {
        setSelectedContact((prev) => prev ? { ...prev, isRead: true } : null);
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact request?")) return;
    try {
      await contactAdminApi.delete(id);
      fetchContacts();
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const openContact = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      handleMarkAsRead(contact.id);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Contact <span className="gradient-text">Requests</span>
        </h1>
        <p className="text-foreground-muted text-sm">
          Manage and respond to contact form submissions.
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-foreground-muted mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-foreground-muted mb-1">Unread</p>
            <p className="text-2xl font-bold text-red">{statistics.unread}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-foreground-muted mb-1">New</p>
            <p className="text-2xl font-bold text-blue-400">{statistics.new}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-foreground-muted mb-1">In Progress</p>
            <p className="text-2xl font-bold text-gold">{statistics.inProgress}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-foreground-muted mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green">{statistics.resolved}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "all", label: "All" },
          { value: "new", label: "New" },
          { value: "in_progress", label: "In Progress" },
          { value: "resolved", label: "Resolved" },
          { value: "closed", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilterStatus(tab.value as ContactStatus | "all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === tab.value
                ? "bg-gold text-background"
                : "glass border border-border text-foreground-muted hover:text-gold hover:border-gold/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="lg:col-span-1 glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Messages</h2>
          </div>
          
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red text-sm">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-background-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-foreground-muted text-sm">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => openContact(contact)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gold/5 ${
                    selectedContact?.id === contact.id ? "bg-gold/10" : ""
                  } ${!contact.isRead ? "border-l-4 border-l-gold" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium truncate ${!contact.isRead ? "text-foreground" : "text-foreground-muted"}`}>
                      {contact.firstName} {contact.lastName}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[contact.status]}`}>
                      {statusLabels[contact.status]}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted truncate mb-1">{contact.email}</p>
                  <p className="text-xs text-foreground-muted truncate">{contact.message}</p>
                  <p className="text-[10px] text-foreground-muted mt-2">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm rounded-lg bg-background-secondary disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs text-foreground-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm rounded-lg bg-background-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-2 glass rounded-xl">
          {selectedContact ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    <p className="text-sm text-foreground-muted">{selectedContact.email}</p>
                    {selectedContact.phone && (
                      <p className="text-sm text-foreground-muted">{selectedContact.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedContact.status}
                      onChange={(e) => handleStatusChange(selectedContact.id, e.target.value as ContactStatus)}
                      className="px-3 py-2 rounded-lg bg-background-secondary border border-border text-sm text-foreground"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(selectedContact.id)}
                      className="p-2 rounded-lg hover:bg-red/10 text-red transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold capitalize">
                      {selectedContact.subject}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background-secondary/50">
                    <p className="text-foreground whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-background-secondary/30">
                    <p className="text-foreground-muted mb-1">IP Address</p>
                    <p className="text-foreground font-mono">{selectedContact.ipAddress || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background-secondary/30">
                    <p className="text-foreground-muted mb-1">Submitted</p>
                    <p className="text-foreground">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-border">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Message</h3>
                <p className="text-sm text-foreground-muted">
                  Choose a message from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

