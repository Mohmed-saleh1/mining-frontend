"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { bookingsAdminApi, BookingReceivingAddress } from "@/app/lib/api";

export const dynamic = "force-dynamic";

export default function ManagerReceivingAddressesPage() {
  const t = useTranslations("manager.receivingAddresses");
  const [items, setItems] = useState<BookingReceivingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newQrFile, setNewQrFile] = useState<File | null>(null);
  const [form, setForm] = useState({ cryptoName: "", networkType: "", address: "" });

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsAdminApi.getReceivingAddresses();
      const actualData = (response.data as any)?.data || response.data;
      setItems(Array.isArray(actualData) ? actualData : []);
    } catch (error) {
      console.error("Failed to load receiving addresses:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cryptoName.trim() || !form.networkType.trim() || !form.address.trim()) return;

    setIsSaving(true);
    try {
      const created = await bookingsAdminApi.createReceivingAddress({
        cryptoName: form.cryptoName.trim(),
        networkType: form.networkType.trim(),
        address: form.address.trim(),
      });
      const createdAddress =
        ((created.data as any)?.data || created.data) as BookingReceivingAddress;

      if (newQrFile && createdAddress?.id) {
        await bookingsAdminApi.uploadReceivingAddressQr(createdAddress.id, newQrFile);
      }

      setForm({ cryptoName: "", networkType: "", address: "" });
      setNewQrFile(null);
      await loadItems();
    } catch (error) {
      console.error("Failed to create receiving address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (item: BookingReceivingAddress) => {
    try {
      await bookingsAdminApi.updateReceivingAddress(item.id, {
        isActive: !item.isActive,
      });
      await loadItems();
    } catch (error) {
      console.error("Failed to update receiving address:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      await bookingsAdminApi.deleteReceivingAddress(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete receiving address:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-foreground-muted mt-1">{t("subtitle")}</p>
      </div>

      <div className="glass rounded-2xl p-5 border border-border space-y-4">
        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            value={form.cryptoName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, cryptoName: e.target.value }))
            }
            placeholder={t("cryptoPlaceholder")}
            className="input-gold px-4 py-3 rounded-xl bg-background-secondary/50"
            required
          />
          <input
            type="text"
            value={form.networkType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, networkType: e.target.value }))
            }
            placeholder={t("networkPlaceholder")}
            className="input-gold px-4 py-3 rounded-xl bg-background-secondary/50"
            required
          />
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder={t("addressPlaceholder")}
            className="input-gold px-4 py-3 rounded-xl bg-background-secondary/50 md:col-span-2"
            required
          />
          <div className="md:col-span-3">
            <p className="text-xs text-foreground-muted mb-2">{t("qrPlaceholder")}</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewQrFile(e.target.files?.[0] || null)}
              className="input-gold px-4 py-3 rounded-xl bg-background-secondary/50 w-full text-sm text-foreground-muted"
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {isSaving ? t("saving") : t("addButton")}
            </button>
          </div>
        </form>

        {isLoading ? (
          <p className="text-sm text-foreground-muted">{t("loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-foreground-muted">{t("empty")}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap gap-3 items-center justify-between rounded-xl border border-border bg-background-secondary/40 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.cryptoName ? `${item.cryptoName} - ` : ""}{item.networkType}
                  </p>
                  <p className="text-xs text-foreground-muted break-all">
                    {item.address}
                  </p>
                </div>
                {item.qrImageUrl && (
                  <a href={item.qrImageUrl} target="_blank" rel="noreferrer">
                    <img
                      src={item.qrImageUrl}
                      alt="Address QR"
                      className="h-14 w-14 rounded-md border border-border object-cover"
                    />
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className="px-3 py-2 rounded-lg text-xs border border-border hover:border-gold/40"
                  >
                    {item.isActive ? t("disable") : t("enable")}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 rounded-lg text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
