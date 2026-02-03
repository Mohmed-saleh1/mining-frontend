"use client";

import { useState } from "react";
import { useAuth, ApiError } from "@/app/lib/auth-context";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setProfileError(null);
    setProfileSuccess(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.firstName.trim()) {
      setProfileError("First name is required");
      return;
    }
    if (!profileForm.lastName.trim()) {
      setProfileError("Last name is required");
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || undefined,
      });
      setProfileSuccess(true);
      await refreshUser();
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.errorDescription || err.message);
      } else {
        setProfileError("Failed to update profile. Please try again.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.errorDescription || err.message);
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-foreground-muted text-sm">
          Manage your account settings and security preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-xl overflow-hidden animate-fade-in-up mb-6">
        {/* Profile Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-foreground-muted text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green/10 text-green text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <Link
                    href="/verify-email-notice"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs hover:bg-gold/20 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Verify Email
                  </Link>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background-secondary text-foreground-muted text-xs capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "profile"
                  ? "text-gold"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Profile Information
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === "security"
                  ? "text-gold"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Security
              {activeTab === "security" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-5 animate-fade-in-up">
              {profileError && (
                <div className="p-4 rounded-lg bg-red/10 border border-red/30 text-red text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{profileError}</span>
                  </div>
                </div>
              )}

              {profileSuccess && (
                <div className="p-4 rounded-lg bg-green/10 border border-green/30 text-green text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Profile updated successfully!</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input-gold w-full px-4 py-3 rounded-lg text-sm opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-foreground-muted mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-gold px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {profileLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Changes</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>

                {passwordError && (
                  <div className="p-4 rounded-lg bg-red/10 border border-red/30 text-red text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{passwordError}</span>
                    </div>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 rounded-lg bg-green/10 border border-green/30 text-green text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Password changed successfully!</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-foreground-muted mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-gold w-full px-4 py-3 rounded-lg text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-gold px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <span>Change Password</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Account Info */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background-secondary/50">
                    <p className="text-xs text-foreground-muted mb-1">Member Since</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background-secondary/50">
                    <p className="text-xs text-foreground-muted mb-1">Last Login</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-background-secondary/50">
                    <p className="text-xs text-foreground-muted mb-1">Account Status</p>
                    <p className="text-sm font-medium text-green">Active</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background-secondary/50">
                    <p className="text-xs text-foreground-muted mb-1">Account ID</p>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {user?.id?.slice(0, 8)}...{user?.id?.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
