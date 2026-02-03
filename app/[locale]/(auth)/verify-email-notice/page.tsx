"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { authApi, ApiError } from "@/app/lib/api";

// Disable static generation for auth pages
export const dynamic = 'force-dynamic';

export default function VerifyEmailNoticePage() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authApi.resendVerificationEmail(user.email);
      setResendSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errorDescription || err.message);
      } else {
        setError("Failed to resend verification email. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen main-bg relative overflow-hidden">
      <div className="starfield" />
      <div className="golden-particles" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-gold-light to-gold flex items-center justify-center glow-gold">
                <svg className="w-7 h-7 text-background" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
                <span className="text-3xl font-bold gradient-text tracking-wider">X-BIN</span>
            </Link>
          </div>

          {/* Email Sent Card */}
          <div className="glass rounded-2xl p-8 animate-fade-in-up">
            {/* Email Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h1>
            <p className="text-foreground-muted text-sm mb-6">
              We&apos;ve sent a verification link to
              {user?.email && (
                <span className="block text-gold font-medium mt-1">{user.email}</span>
              )}
            </p>

            <div className="bg-background-secondary/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-foreground-muted">
                Click the link in the email to verify your account. The link will expire in 24 hours.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red/10 border border-red/30 text-red text-sm">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green/10 border border-green/30 text-green text-sm">
                Verification email sent successfully!
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="btn-outline w-full py-3 rounded-lg text-sm font-semibold tracking-wide disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </button>

              <Link
                href="/dashboard"
                className="btn-gold w-full py-3 rounded-lg text-sm font-semibold tracking-wide block"
              >
                Continue to Dashboard
              </Link>
            </div>

            <p className="mt-6 text-xs text-foreground-muted">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/contact" className="text-gold hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
