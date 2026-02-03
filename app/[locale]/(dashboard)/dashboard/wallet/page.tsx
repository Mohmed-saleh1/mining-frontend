"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { walletsApi, Wallet, CryptoType, ApiError } from "@/app/lib/api";

// Crypto icons as SVG components
const CryptoIcons: Record<CryptoType, React.FC<{ className?: string }>> = {
  BTC: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
    </svg>
  ),
  ETH: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z"/>
    </svg>
  ),
  USDT: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm1.922-18.207v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117zm0 3.59v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657z"/>
    </svg>
  ),
  LTC: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.063-9.873l1.145-3.943-1.76.532.42-1.388 1.76-.533 1.25-4.31 1.76-.532-.42 1.388 1.42-.43-.354 1.21-1.42.428-1.075 3.707 2.38-.72-.356 1.21-2.38.72-.888 3.058-1.482 1.533z"/>
    </svg>
  ),
  XRP: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM8.624 8h2.433l4.96 5.098L20.97 8h2.433l-6.394 6.56 6.406 6.56h-2.433l-4.97-5.104-4.972 5.104H8.605l6.406-6.56L8.624 8z"/>
    </svg>
  ),
  DOGE: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.884-17.596h3.402V12.43h-3.402V8.5h4.212c3.857 0 6.504 2.665 6.504 7.5s-2.647 7.5-6.504 7.5h-4.212v-9.096zm3.402 6.596h.81c2.123 0 3.504-1.312 3.504-4.5s-1.381-4.5-3.504-4.5h-.81v9z"/>
    </svg>
  ),
  BNB: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.884-17.596L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26 2.26L10.52 16l-2.26-2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26 2.26L26 16l-2.26-2.26L21.48 16zm-3.188-.002h.002L16 13.706 14.294 15.4l-.002.002-.196.196-.394.395L16 18.286l2.293-2.293-.001-.001z"/>
    </svg>
  ),
  SOL: ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM9.925 19.687l.78-.818a.418.418 0 01.302-.131h12.919c.19 0 .286.232.152.367l-2.03 2.126a.418.418 0 01-.302.131H8.727c-.19 0-.286-.232-.152-.367l1.35-1.308zm.78-7.118a.418.418 0 01.302-.131h12.919c.19 0 .286.232.152.367l-2.03 2.126a.418.418 0 01-.302.131H8.727c-.19 0-.286-.232-.152-.367l2.13-2.126zm11.343 3.485a.418.418 0 00-.302-.131H8.827c-.19 0-.286.232-.152.367l2.03 2.126c.08.084.19.131.302.131h12.919c.19 0 .286-.232.152-.367l-2.03-2.126z"/>
    </svg>
  ),
};

// Crypto background colors
const cryptoBgColors: Record<CryptoType, string> = {
  BTC: "bg-[#F7931A]/10",
  ETH: "bg-[#627EEA]/10",
  USDT: "bg-[#26A17B]/10",
  LTC: "bg-[#BFBBBB]/10",
  XRP: "bg-[#23292F]/20",
  DOGE: "bg-[#C2A633]/10",
  BNB: "bg-[#F3BA2F]/10",
  SOL: "bg-[#9945FF]/10",
};

// Crypto text colors
const cryptoTextColors: Record<CryptoType, string> = {
  BTC: "text-[#F7931A]",
  ETH: "text-[#627EEA]",
  USDT: "text-[#26A17B]",
  LTC: "text-[#BFBBBB]",
  XRP: "text-[#8A939B]",
  DOGE: "text-[#C2A633]",
  BNB: "text-[#F3BA2F]",
  SOL: "text-[#9945FF]",
};

export default function WalletPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await walletsApi.getAll();
      setWallets(response.data.wallets);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch wallets");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const handleOpenModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setNewAddress(wallet.walletAddress || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedWallet(null);
    setNewAddress("");
    setIsModalOpen(false);
    setIsUpdating(false);
  };

  const handleUpdateAddress = async () => {
    if (!selectedWallet || !newAddress.trim()) return;

    try {
      setIsUpdating(true);
      await walletsApi.updateAddress({
        cryptoType: selectedWallet.cryptoType,
        walletAddress: newAddress.trim(),
      });
      await fetchWallets();
      handleCloseModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update wallet address");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const formatBalance = (balance: number, decimals: number = 8) => {
    if (balance === 0) return "0.00";
    return balance.toFixed(Math.min(decimals, 8));
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-background-secondary rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-background-secondary rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 h-48 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-background-secondary" />
                <div>
                  <div className="h-5 w-24 bg-background-secondary rounded mb-1" />
                  <div className="h-4 w-16 bg-background-secondary rounded" />
                </div>
              </div>
              <div className="h-8 w-32 bg-background-secondary rounded mb-4" />
              <div className="h-10 w-full bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          My <span className="gradient-text">Wallet</span>
        </h1>
        <p className="text-foreground-muted text-sm">
          View and manage your cryptocurrency wallets
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red hover:text-red/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Total Portfolio Value Card */}
      <div className="glass rounded-xl p-6 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-foreground-muted text-sm mb-1">Total Portfolio Value</p>
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text">$0.00</h2>
            <p className="text-foreground-muted text-xs mt-1">
              {wallets.length} cryptocurrencies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchWallets}
              className="btn-outline px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wallets.map((wallet, index) => {
          const Icon = CryptoIcons[wallet.cryptoType];
          return (
            <div
              key={wallet.id}
              className="glass rounded-xl p-5 card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Crypto Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${cryptoBgColors[wallet.cryptoType]} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${cryptoTextColors[wallet.cryptoType]}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{wallet.name}</h3>
                  <p className="text-xs text-foreground-muted">{wallet.symbol}</p>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <p className="text-xs text-foreground-muted mb-1">Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatBalance(wallet.balance)}
                  <span className="text-sm text-foreground-muted ml-1">{wallet.symbol}</span>
                </p>
                {wallet.pendingBalance > 0 && (
                  <p className="text-xs text-gold mt-1">
                    +{formatBalance(wallet.pendingBalance)} pending
                  </p>
                )}
              </div>

              {/* Wallet Address Section */}
              <div className="border-t border-border pt-4">
                {wallet.walletAddress ? (
                  <div>
                    <p className="text-xs text-foreground-muted mb-2">Receive Address</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-foreground bg-background-secondary/50 px-2 py-1.5 rounded truncate">
                        {wallet.walletAddress}
                      </code>
                      <button
                        onClick={() => handleCopyAddress(wallet.walletAddress!)}
                        className={`p-2 rounded-lg transition-all ${
                          copiedAddress === wallet.walletAddress
                            ? "bg-green/20 text-green"
                            : "bg-background-secondary/50 text-foreground-muted hover:text-gold hover:bg-gold/10"
                        }`}
                        title="Copy address"
                      >
                        {copiedAddress === wallet.walletAddress ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenModal(wallet)}
                        className="p-2 rounded-lg bg-background-secondary/50 text-foreground-muted hover:text-gold hover:bg-gold/10 transition-all"
                        title="Edit address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenModal(wallet)}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed border-gold/30 text-gold text-sm font-medium hover:border-gold/60 hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Receive Address
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {wallets.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-background-secondary flex items-center justify-center">
            <svg className="w-10 h-10 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No Wallets Found</h3>
          <p className="text-foreground-muted text-sm">Your crypto wallets will appear here</p>
        </div>
      )}

      {/* Update Address Modal */}
      {isModalOpen && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Content */}
          <div className="relative glass rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = CryptoIcons[selectedWallet.cryptoType];
                  return (
                    <div className={`w-10 h-10 rounded-full ${cryptoBgColors[selectedWallet.cryptoType]} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cryptoTextColors[selectedWallet.cryptoType]}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedWallet.walletAddress ? "Update" : "Add"} {selectedWallet.symbol} Address
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Enter your {selectedWallet.name} wallet address to receive funds
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-background-secondary/50 text-foreground-muted hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Address Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder={`Enter your ${selectedWallet.symbol} wallet address`}
                className="input-gold w-full px-4 py-3 rounded-lg text-sm"
              />
              <p className="text-xs text-foreground-muted mt-2">
                Make sure to enter the correct {selectedWallet.symbol} address. Funds sent to wrong addresses cannot be recovered.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 btn-outline px-4 py-3 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAddress}
                disabled={!newAddress.trim() || isUpdating}
                className="flex-1 btn-gold px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

