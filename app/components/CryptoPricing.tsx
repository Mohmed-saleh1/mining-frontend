"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  image: string;
}

interface ApiResponse {
  success: boolean;
  data: CoinData[];
  source: "coinmarketcap" | "fallback";
  timestamp?: number;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const CryptoPricing = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<"coinmarketcap" | "fallback">("fallback");
  const [nextRefresh, setNextRefresh] = useState<number>(REFRESH_INTERVAL);

  const fetchPrices = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      
      const response = await fetch("/api/crypto-prices", {
        cache: "no-store", // Ensure fresh data
      });
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setCoins(data.data);
        setDataSource(data.source);
        setLastUpdated(new Date());
        setNextRefresh(REFRESH_INTERVAL);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 5 minutes
  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(() => {
      fetchPrices();
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Countdown timer for next refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1000) return REFRESH_INTERVAL;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    if (!refreshing) {
      fetchPrices(true);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatChange = (change: number) => {
    const formatted = Math.abs(change).toFixed(2);
    return change >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  const formatCountdown = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <section className="py-20 relative">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Live <span className="gradient-text">Crypto Prices</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Track real-time cryptocurrency prices from CoinMarketCap
            </p>
          </div>
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground-muted">Fetching live prices...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 hero-pattern opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Live <span className="gradient-text">Crypto Prices</span>
          </h2>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            Track real-time cryptocurrency prices from CoinMarketCap
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-fade-in-up">
          {/* Data Source & Last Updated */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-secondary border border-border">
              {dataSource === "coinmarketcap" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <span className="text-xs font-medium text-foreground-muted">CoinMarketCap</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs font-medium text-foreground-muted">Cached Data</span>
                </>
              )}
            </div>
            {lastUpdated && (
              <span className="text-xs text-foreground-muted">
                Updated {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </div>

          {/* Refresh Controls */}
          <div className="flex items-center gap-3">
            {/* Next refresh countdown */}
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Next refresh in {formatCountdown(nextRefresh)}</span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-500 ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm font-medium">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* Price Table */}
        <div className={`glass rounded-2xl overflow-hidden animate-fade-in-up stagger-2 transition-opacity duration-300 ${refreshing ? "opacity-70" : "opacity-100"}`}>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-foreground-muted font-medium text-sm">
                    #
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-muted font-medium text-sm">
                    Coin
                  </th>
                  <th className="text-right py-4 px-6 text-foreground-muted font-medium text-sm">
                    Price
                  </th>
                  <th className="text-right py-4 px-6 text-foreground-muted font-medium text-sm">
                    24h Change
                  </th>
                  <th className="text-right py-4 px-6 text-foreground-muted font-medium text-sm">
                    Market Cap
                  </th>
                  <th className="text-right py-4 px-6 text-foreground-muted font-medium text-sm">
                    Volume (24h)
                  </th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    className="border-b border-border/50 hover:bg-background-secondary/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-foreground-muted">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-background-secondary">
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">
                            {coin.name}
                          </span>
                          <span className="text-foreground-muted text-sm ml-2">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-foreground">
                      {formatPrice(coin.price)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`font-semibold inline-flex items-center gap-1 ${
                          coin.change24h >= 0 ? "price-up" : "price-down"
                        }`}
                      >
                        {coin.change24h >= 0 ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {formatChange(coin.change24h)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-foreground-muted">
                      {formatMarketCap(coin.marketCap)}
                    </td>
                    <td className="py-4 px-6 text-right text-foreground-muted">
                      {formatMarketCap(coin.volume24h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {coins.map((coin, index) => (
              <div
                key={coin.id}
                className="p-4 hover:bg-background-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground-muted text-sm">
                      #{index + 1}
                    </span>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-background-secondary">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {coin.name}
                      </span>
                      <span className="text-foreground-muted text-sm ml-2">
                        {coin.symbol}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-sm inline-flex items-center gap-1 ${
                      coin.change24h >= 0 ? "price-up" : "price-down"
                    }`}
                  >
                    {coin.change24h >= 0 ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {formatChange(coin.change24h)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {formatPrice(coin.price)}
                  </div>
                  <div className="text-foreground-muted text-xs">
                    MCap: {formatMarketCap(coin.marketCap)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 text-foreground-muted text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span>Live prices from {dataSource === "coinmarketcap" ? "CoinMarketCap" : "cache"}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Auto-refreshes every 5 minutes</span>
        </div>
      </div>
    </section>
  );
};

export default CryptoPricing;
