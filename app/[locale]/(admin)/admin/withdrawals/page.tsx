"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ClientOnly from "@/app/components/ClientOnly";
import {
  walletsAdminApi,
  WalletWithdrawalRequest,
  WalletWithdrawalStatus,
} from "@/app/lib/api";

export const dynamic = "force-dynamic";

export default function AdminWithdrawalsPage() {
  const t = useTranslations("admin.withdrawals");
  const router = useRouter();

  const [items, setItems] = useState<WalletWithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<WalletWithdrawalStatus | "all">(
    "pending",
  );
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>(
    {},
  );
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await walletsAdminApi.getWithdrawals(
        status === "all" ? undefined : status,
      );
      const data = (res.data as any)?.data || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load withdrawals:", e);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const counts = useMemo(() => {
    const c = { pending: 0, sent: 0, rejected: 0 };
    items.forEach((i) => {
      if (i.status === "pending") c.pending++;
      if (i.status === "sent") c.sent++;
      if (i.status === "rejected") c.rejected++;
    });
    return c;
  }, [items]);

  const handleFile = (id: string, file: File | null) => {
    setSelectedFiles((p) => ({ ...p, [id]: file }));
  };

  const handleMarkSent = async (id: string) => {
    const file = selectedFiles[id];
    if (!file) return;
    setSendingId(id);
    try {
      await walletsAdminApi.markWithdrawalSent(id, file, adminNotes[id]);
      setSelectedFiles((p) => ({ ...p, [id]: null }));
      setAdminNotes((p) => ({ ...p, [id]: "" }));
      await load();
    } catch (e) {
      console.error("Failed to mark sent:", e);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-foreground-muted mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin")}
              className="btn-outline px-4 py-2 rounded-lg text-sm"
            >
              {t("back")}
            </button>
            <button
              onClick={load}
              className="btn-outline px-4 py-2 rounded-lg text-sm"
            >
              {t("refresh")}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["pending", "sent", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s
                  ? "bg-gold text-background"
                  : "bg-background-secondary text-foreground-muted hover:text-foreground"
              }`}
            >
              {t(`filters.${s}`)}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-foreground-muted">{t("empty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((w) => (
                <div key={w.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {w.cryptoType} • {w.networkType}
                      </p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {t("amount")}:{" "}
                        <span className="text-foreground font-medium">
                          {w.amount}
                        </span>
                      </p>
                      <p className="text-xs text-foreground-muted break-all mt-2">
                        {t("address")}: {w.address}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${
                        w.status === "pending"
                          ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10"
                          : w.status === "sent"
                            ? "border-green/30 text-green bg-green/10"
                            : "border-red-500/40 text-red-400 bg-red-500/10"
                      }`}
                    >
                      {t(`status.${w.status}`)}
                    </span>
                  </div>

                  {w.status === "sent" && w.screenshotUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href={w.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gold hover:underline"
                      >
                        {t("viewScreenshot")}
                      </a>
                      <a href={w.screenshotUrl} target="_blank" rel="noreferrer">
                        <img
                          src={w.screenshotUrl}
                          alt="Payout screenshot"
                          className="h-12 w-12 rounded-lg border border-border object-cover"
                        />
                      </a>
                    </div>
                  )}

                  {w.status === "pending" && (
                    <div className="mt-4 grid gap-3">
                      <textarea
                        value={adminNotes[w.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((p) => ({ ...p, [w.id]: e.target.value }))
                        }
                        placeholder={t("notesPlaceholder")}
                        className="input-gold w-full px-4 py-3 rounded-xl bg-background-secondary/50 resize-none text-sm"
                        rows={2}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFile(w.id, e.target.files?.[0] || null)}
                          className="text-xs text-foreground-muted"
                        />
                        <button
                          onClick={() => handleMarkSent(w.id)}
                          disabled={!selectedFiles[w.id] || sendingId === w.id}
                          className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                        >
                          {sendingId === w.id ? t("sending") : t("markSent")}
                        </button>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {t("deductHint")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}

