"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Authentication failed. No token received.");
      return;
    }

    const completeAuth = async () => {
      try {
        localStorage.setItem("accessToken", token);
        await refreshUser();
        router.push("/");
      } catch (err) {
        console.error("Google auth callback error:", err);
        setError("Failed to complete sign in. Please try again.");
      }
    };

    completeAuth();
  }, [searchParams, refreshUser, router]);

  if (error) {
    return (
      <div className="min-h-screen main-bg flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-red mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Sign In Failed
          </h2>
          <p className="text-foreground-muted text-sm mb-6">{error}</p>
          <Link
            href="/login"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto" />
        <p className="mt-4 text-foreground-muted">Completing sign in...</p>
      </div>
    </div>
  );
}
