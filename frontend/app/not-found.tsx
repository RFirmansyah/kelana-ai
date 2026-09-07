import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] px-4 py-16 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 dark:border-white/8 dark:bg-[#161b22] dark:shadow-black/40 p-10 flex flex-col items-center text-center gap-4">
        <div className="text-6xl">🧭</div>
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Looks like you&apos;ve wandered off the map
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved somewhere else.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
