import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: "✨",
    title: "AI Itinerary Generation",
    description:
      "Tell KelanaAI your destination, trip length, budget, and travel style — it builds a full day-by-day itinerary, budget breakdown, and transportation recommendation using Amazon Bedrock.",
  },
  {
    icon: "💬",
    title: "Ask Assistant (RAG Chat)",
    description:
      "A retrieval-augmented chat assistant grounded in a dedicated travel knowledge base, so answers about packing, documents, and budgeting come with real sourced references.",
  },
  {
    icon: "🗂️",
    title: "Trip Management",
    description:
      "Every generated trip is saved to your account — view, edit, or soft-delete past trips at any time, all scoped privately to your own login.",
  },
  {
    icon: "🔒",
    title: "Secure by Default",
    description:
      "JWT-based authentication, per-user data isolation on every endpoint, and password changes — your trips are visible only to you.",
  },
];

const STACK = [
  { label: "Frontend", value: "Next.js (App Router), React, Tailwind CSS" },
  { label: "Backend", value: "FastAPI, SQLAlchemy, PostgreSQL" },
  { label: "AI / ML", value: "Amazon Bedrock (Nova), Bedrock Knowledge Bases (RAG)" },
  { label: "Auth", value: "JWT bearer tokens, bcrypt password hashing" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 dark:border-white/8 dark:bg-[#0d1117]/80 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-extrabold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent"
          >
            KelanaAI
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-5 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="text-5xl mb-4">🧭</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              About{" "}
              <span className="bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
                KelanaAI
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              KelanaAI is an AI-powered travel planning app — it turns a destination, a budget, and
              a travel style into a complete itinerary in seconds, and answers your travel
              questions with a retrieval-grounded assistant.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white dark:border-white/8 dark:bg-[#161b22] shadow-sm p-6 flex flex-col gap-2"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/8 dark:bg-[#161b22] shadow-sm overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                Built With
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/8">
              {STACK.map((s) => (
                <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-6 py-3">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:w-28 shrink-0">
                    {s.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              Start Planning →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-white/8 dark:bg-[#0d1117] px-5 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} KelanaAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
