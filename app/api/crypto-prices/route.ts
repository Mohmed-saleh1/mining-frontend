import { NextResponse } from "next/server";

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

// CoinMarketCap API endpoint
const CMC_API_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
const CMC_API_KEY = process.env.CMC_API_KEY || "";

// Coin image URLs from CoinMarketCap
const symbolToImage: Record<string, string> = {
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  SOL: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  XRP: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
  ADA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
  DOGE: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
};

// Fallback data in case API fails or no key is provided
const fallbackData: CoinData[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 43250.50,
    change24h: 2.35,
    marketCap: 847000000000,
    volume24h: 28500000000,
    image: symbolToImage.BTC,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 2280.75,
    change24h: 1.82,
    marketCap: 274000000000,
    volume24h: 15200000000,
    image: symbolToImage.ETH,
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    price: 1.00,
    change24h: 0.01,
    marketCap: 95000000000,
    volume24h: 52000000000,
    image: symbolToImage.USDT,
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    price: 312.45,
    change24h: -0.85,
    marketCap: 48000000000,
    volume24h: 890000000,
    image: symbolToImage.BNB,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 98.32,
    change24h: 4.21,
    marketCap: 42000000000,
    volume24h: 2100000000,
    image: symbolToImage.SOL,
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    price: 0.62,
    change24h: -1.23,
    marketCap: 34000000000,
    volume24h: 1200000000,
    image: symbolToImage.XRP,
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.58,
    change24h: 3.15,
    marketCap: 20000000000,
    volume24h: 450000000,
    image: symbolToImage.ADA,
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.082,
    change24h: 1.95,
    marketCap: 11500000000,
    volume24h: 520000000,
    image: symbolToImage.DOGE,
  },
];

export const dynamic = "force-dynamic"; // Disable caching for this route
export const revalidate = 0; // Don't cache

export async function GET() {
  const timestamp = Date.now();

  // If no API key, return fallback data
  if (!CMC_API_KEY) {
    console.log("No CoinMarketCap API key found, using fallback data");
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: "fallback",
      timestamp,
    });
  }

  try {
    const symbols = "BTC,ETH,USDT,BNB,SOL,XRP,ADA,DOGE";
    
    const response = await fetch(`${CMC_API_URL}?symbol=${symbols}`, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
        "Accept": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      console.error("CoinMarketCap API error:", response.status, response.statusText);
      throw new Error(`CoinMarketCap API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status?.error_code !== 0 && data.status?.error_code !== undefined) {
      console.error("CoinMarketCap API error:", data.status?.error_message);
      throw new Error(data.status?.error_message || "API error");
    }

    // Sort coins by market cap to maintain consistent order
    const sortOrder = ["BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "ADA", "DOGE"];
    
    const coins: CoinData[] = sortOrder
      .map((symbol) => {
        const coin = data.data[symbol];
        if (!coin) return null;
        
        return {
          id: coin.id.toString(),
          name: coin.name,
          symbol: coin.symbol,
          price: coin.quote.USD.price,
          change24h: coin.quote.USD.percent_change_24h,
          marketCap: coin.quote.USD.market_cap,
          volume24h: coin.quote.USD.volume_24h,
          image: symbolToImage[coin.symbol] || "",
        };
      })
      .filter((coin): coin is CoinData => coin !== null);

    console.log(`Fetched ${coins.length} coins from CoinMarketCap at ${new Date(timestamp).toISOString()}`);

    return NextResponse.json({
      success: true,
      data: coins,
      source: "coinmarketcap",
      timestamp,
    });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: "fallback",
      timestamp,
    });
  }
}
