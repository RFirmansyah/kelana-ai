"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, changePassword, type MeResponse } from "@/services/authService";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    getMe(token)
      .then((me) => {
        setUser(me);
        localStorage.setItem("username", me.name);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      });
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const header = (
    <div className="w-full max-w-lg flex items-center justify-between mb-2">
      <a
        href="/trips"
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        ← Back to My Trips
      </a>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center px-4 py-10 bg-[var(--background)]">
        {header}
        <div className="w-full max-w-lg rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
          {error}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center px-4 py-10 bg-[var(--background)]">
        {header}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[#e3f0fd] border-t-[#2196F3] animate-spin" />
        </div>
      </main>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10 bg-[var(--background)]">
      {header}
      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-16 h-16 rounded-full bg-[#2196F3] flex items-center justify-center text-white text-xl font-bold select-none">
            {initials}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              {user.name}
            </h1>
            <p className="text-sm text-gray-400">Member since {joinedDate}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="rounded-2xl bg-[#f0f4f8] dark:bg-[#161b22] divide-y divide-gray-200 dark:divide-white/8 shadow-sm overflow-hidden">
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Trips generated" value={String(user.total_trips)} />
        </div>

        {/* Recent trips */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#2196F3] px-1">
            Recent Trips
          </h2>

          {user.recent_trips.length === 0 ? (
            <div className="rounded-2xl bg-[#f0f4f8] dark:bg-[#161b22] px-5 py-4 text-sm text-gray-400 shadow-sm">
              No trips generated yet.
            </div>
          ) : (
            <div className="rounded-2xl bg-[#f0f4f8] dark:bg-[#161b22] divide-y divide-gray-200 dark:divide-white/8 shadow-sm overflow-hidden">
              {user.recent_trips.map((trip) => (
                <a
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {trip.destination}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {trip.travel_style}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(trip.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Change password */}
        <ChangePasswordForm />

      </div>
    </main>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showFields, setShowFields] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You're no longer signed in. Please log in again.");
      return;
    }

    setPending(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          setShowFields((v) => !v);
          setError(null);
          setSuccess(false);
        }}
        className="text-xs font-bold uppercase tracking-widest text-[#2196F3] px-1 text-left cursor-pointer"
      >
        {showFields ? "Change Password ▲" : "Change Password ▼"}
      </button>

      {showFields && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#f0f4f8] dark:bg-[#161b22] px-5 py-4 flex flex-col gap-3 shadow-sm"
        >
          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />
          <PasswordField
            id="confirmNewPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && (
            <p className="text-xs text-emerald-600">Password updated successfully.</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-xl bg-[#2196F3] hover:bg-[#1976D2] active:bg-[#1565C0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm tracking-wide py-3 transition-colors duration-150 cursor-pointer"
          >
            {pending ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-[#2196F3]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-gray-400 hover:text-[#2196F3] transition-colors duration-150 cursor-pointer"
        >
          {show ? "⊘" : "👁"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-bold uppercase tracking-widest text-[#2196F3]">
        {label}
      </span>
      <span className="text-sm text-[var(--foreground)]">{value}</span>
    </div>
  );
}