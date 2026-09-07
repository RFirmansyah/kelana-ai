export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border-4 border-sky-100 dark:border-white/10 border-t-sky-500 dark:border-t-sky-400 animate-spin" />
          <span className="text-2xl">🧭</span>
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
          KelanaAI
        </span>
      </div>
    </main>
  );
}
