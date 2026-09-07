"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook up a real error-reporting service (Sentry, etc.) here if one
    // is ever added — for now this at least surfaces it in server logs.
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 dark:border-white/8 dark:bg-[#161b22] dark:shadow-black/40 p-10 flex flex-col items-center text-center gap-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          An unexpected error occurred while loading this page. You can try again, or head back
          to safety.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="w-full max-h-32 overflow-auto rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-[11px] text-left p-3">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </pre>
        )}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border border-gray-200 dark:border-white/10 px-5 py-2.5 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
