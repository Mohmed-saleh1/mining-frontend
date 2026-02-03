import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { locales, defaultLocale } from "@/i18n";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X-BIN - Rent Mining Machines & Earn Daily Crypto Profits",
  description: "Access enterprise-grade mining hardware without the hassle. Rent professional ASIC miners and GPU rigs to earn passive crypto income with X-BIN.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={defaultLocale} dir="ltr" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
