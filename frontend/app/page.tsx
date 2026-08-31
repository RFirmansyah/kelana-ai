"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";

interface TripResult {
  id: number;
  destination: string;
  budget: number;
  daily_budget: number;
  category: string;
  travel_style: string;
  recommended_transportation: string;
  ai_recommendation: string;
}

// Unsplash destination → query keyword map for hero images
function getDestinationImageUrl(destination: string): string {
  const keyword = encodeURIComponent(destination.split(",")[0].trim());
  return `https://source.unsplash.com/1600x900/?${keyword},travel,landscape`;
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({
  id,
  label,
  icon,
  accent,
  children,
}: {
  id: string;
  label: string;
  icon: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${accent}`}
      >
        <span>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition duration-200 focus:border-transparent focus:ring-2 dark:bg-white/5 dark:border-white/10 dark:text-gray-100 dark:placeholder-gray-500";

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon,
  label,
  value,
  ring,
}: {
  icon: string;
  label: string;
  value: string;
  ring: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border bg-white shadow-sm dark:bg-[#161b22] dark:shadow-none p-4 ${ring}`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [form, setForm] = useState({
    destination: "",
    budget: "",
    days: "",
    travel_style: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TripResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          destination: form.destination,
          budget: parseFloat(form.budget),
          days: parseInt(form.days),
          travel_style: form.travel_style,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Something went wrong.");
      }

      const data: TripResult = await response.json();
      setResult(data);
      window.location.href = "/trips";
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117]">
        <div className="w-8 h-8 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 antialiased transition-colors duration-200">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 dark:border-white/8 dark:bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
            KelanaAI
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#plan" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Plan Trip</a>
            <a href="/trips" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">My Trips</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <GithubIcon />
              GitHub
            </a>
            <ThemeToggle />
          <UserMenu />
          </nav>
          {/* Mobile toggle */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&q=80"
            alt="Travel destination aerial"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/30 to-gray-100 dark:to-[#0d1117]" />
        </div>

        {/* Badge */}
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300 backdrop-blur-sm">
          ✈ AI-Powered Travel Planner
        </span>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-white">
            Discover the World
          </span>
          <br />
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">with KelanaAI</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-gray-300 leading-relaxed sm:text-lg">
          Enter your dream destination, set your budget, and let our AI craft a
          fully personalized travel itinerary — in seconds.
        </p>

        <a
          href="#plan"
          className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-violet-900/40 transition-all hover:scale-105 hover:shadow-violet-700/50 active:scale-95"
        >
          Start Planning ↓
        </a>

        {/* Floating stats row */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-center">
          {[
            { value: "150+", label: "Destinations" },
            { value: "10K+", label: "Trips Planned" },
            { value: "AI", label: "Powered by AWS" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-3xl font-extrabold text-white">{s.value}</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plan Section ───────────────────────────────────────────────── */}
      <section id="plan" className="flex-1 px-5 py-16">
        <div className="mx-auto max-w-6xl">

          {/* Section header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-gray-100">
              Plan Your{" "}
              <span className="bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
                Next Adventure
              </span>
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
              Fill in the details and our AI will generate a tailored itinerary,
              budget breakdown, and transport recommendations.
            </p>
          </div>

          {/* Two-column layout on desktop, single column on mobile */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">

            {/* ── Form Card ── */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 dark:border-white/8 dark:bg-[#161b22] dark:shadow-black/40 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                <Field id="destination" label="Destination" icon="🌍" accent="text-sky-400">
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    required
                    placeholder="e.g. Bali, Indonesia"
                    value={form.destination}
                    onChange={handleChange}
                    className={`${inputCls} focus:ring-sky-500`}
                  />
                </Field>

                {/* Budget + Days: always 2 cols */}
                <div className="grid grid-cols-2 gap-4">
                  <Field id="budget" label="Budget (USD)" icon="💰" accent="text-indigo-400">
                    <input
                      id="budget"
                      name="budget"
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="e.g. 2000"
                      value={form.budget}
                      onChange={handleChange}
                      className={`${inputCls} focus:ring-indigo-500`}
                    />
                  </Field>

                  <Field id="days" label="Days" icon="📅" accent="text-violet-400">
                    <input
                      id="days"
                      name="days"
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 7"
                      value={form.days}
                      onChange={handleChange}
                      className={`${inputCls} focus:ring-violet-500`}
                    />
                  </Field>
                </div>

                <Field id="travel_style" label="Travel Style" icon="🎒" accent="text-pink-400">
                  <input
                    id="travel_style"
                    name="travel_style"
                    type="text"
                    required
                    placeholder="e.g. Adventure, Luxury, Backpacker, Family"
                    value={form.travel_style}
                    onChange={handleChange}
                    className={`${inputCls} focus:ring-pink-500`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-4 text-base font-bold tracking-wide text-white shadow-lg shadow-indigo-900/50 transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Planning your trip…
                    </span>
                  ) : (
                    "✨ Plan My Trip"
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 px-4 py-3.5 text-sm">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* ── Right panel: hero image or result ── */}
            <div className="flex flex-col gap-6">

              {/* Destination hero image */}
              <div className="relative w-full overflow-hidden rounded-3xl border border-white/8 shadow-2xl shadow-black/40" style={{ aspectRatio: "16/9" }}>
                {result ? (
                  <>
                    <Image
                      src={getDestinationImageUrl(result.destination)}
                      alt={result.destination}
                      fill
                      className="object-cover object-center transition-all duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xl font-extrabold text-white drop-shadow-lg">
                        {result.destination}
                      </p>
                      <p className="text-xs text-slate-300">Trip #{result.id} · {result.travel_style}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80"
                      alt="Travel inspiration"
                      fill
                      className="object-cover object-center"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-lg font-bold text-white drop-shadow-lg">
                        Where will you go next?
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Enter your destination to see it come alive.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Stats grid */}
              {result && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  <StatChip icon="💵" label="Total Budget" value={`$${result.budget.toLocaleString()}`} ring="border-sky-500/20" />
                  <StatChip icon="📆" label="Daily Budget" value={`$${result.daily_budget.toLocaleString()}`} ring="border-indigo-500/20" />
                  <StatChip icon="🏷️" label="Category" value={result.category} ring="border-violet-500/20" />
                  <StatChip icon="🚌" label="Transport" value={result.recommended_transportation} ring="border-pink-500/20" />
                </div>
              )}
            </div>
          </div>

          {/* ── AI Itinerary (full width below) ── */}
          {result?.ai_recommendation && (
            <div className="mt-10 rounded-3xl border border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/5 shadow-sm dark:shadow-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-lg shadow-indigo-900/50">
                  🤖
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">AI Itinerary</p>
                  <p className="text-xs text-gray-500">Generated by AWS Bedrock</p>
                </div>
              </div>

              <div className="space-y-1">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3 border-b border-gray-200 dark:border-white/10 pb-2 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-6 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-4 mb-1">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-7 mb-3">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 space-y-2 pl-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 space-y-2 pl-5 list-decimal">{children}</ol>
                    ),
                    li: ({ children, ...props }) => {
                      const ordered = (props as { ordered?: boolean }).ordered;
                      return ordered ? (
                        <li className="text-sm text-gray-700 dark:text-gray-300 leading-6 pl-1">{children}</li>
                      ) : (
                        <li className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300 leading-6">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                          <span>{children}</span>
                        </li>
                      );
                    },
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-500 dark:text-gray-400">{children}</em>
                    ),
                    hr: () => <hr className="my-5 border-gray-200 dark:border-white/10" />,
                    blockquote: ({ children }) => (
                      <blockquote className="my-4 border-l-4 border-indigo-400 pl-4 text-sm text-gray-500 dark:text-gray-400 italic">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 font-mono text-xs text-sky-600 dark:text-sky-400">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {result.ai_recommendation}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white dark:border-white/8 dark:bg-[#0d1117] px-5 py-10">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-6 sm:flex-row sm:justify-between">

          {/* Brand */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-lg font-extrabold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
              KelanaAI
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">AI-Powered Travel Planner</p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <GithubIcon />
              GitHub
            </a>
            <span className="text-gray-200 dark:text-white/10">|</span>
            <a href="#plan" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Plan a Trip
            </a>
            <span className="text-gray-200 dark:text-white/10">|</span>
            <a href="/trips" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              My Trips
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} KelanaAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── GitHub SVG Icon ──────────────────────────────────────────────────────────
function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
