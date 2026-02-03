"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi, ApiError } from "@/app/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setError("Invalid verification link. No token provided.");
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus("success");
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.errorDescription || err.message);
        } else {
          setError("Failed to verify email. The link may be expired or invalid.");
        }
      }
    };

    verifyEmail();
  }, [token, router]);

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

          {/* Verification Card */}
          <div className="glass rounded-2xl p-8 animate-fade-in-up">
            {status === "loading" && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Verifying Your Email</h1>
                <p className="text-foreground-muted text-sm">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green/10 border-2 border-green/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Email Verified!</h1>
                <p className="text-foreground-muted text-sm mb-6">
                  Your email has been successfully verified. You will be redirected to your dashboard shortly.
                </p>
                <Link
                  href="/dashboard"
                  className="btn-gold w-full py-3 rounded-lg text-sm font-semibold tracking-wide block"
                >
                  Go to Dashboard
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red/10 border-2 border-red/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">Verification Failed</h1>
                <p className="text-foreground-muted text-sm mb-6">{error}</p>
                <div className="space-y-3">
                  <Link
                    href="/verify-email-notice"
                    className="btn-outline w-full py-3 rounded-lg text-sm font-semibold tracking-wide block"
                  >
                    Request New Verification Link
                  </Link>
                  <Link
                    href="/login"
                    className="btn-gold w-full py-3 rounded-lg text-sm font-semibold tracking-wide block"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen main-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
