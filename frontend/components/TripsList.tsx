"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Trip } from "@/types/trip"
import { formatUSD, getCategoryMeta, getTravelStyleIcon, getDestinationIcon } from "@/lib/tripMeta"

const PAGE_SIZE = 10
const RECENT_COUNT = 3

interface TripsListProps {
  trips: Trip[]
}

export default function TripsList({ trips }: TripsListProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const isSearching = query.trim().length > 0

  const recentTrips = useMemo(
    () => [...trips].sort((a, b) => b.id - a.id).slice(0, RECENT_COUNT),
    [trips]
  )

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = query.trim().toLowerCase()
    return [...trips]
      .sort((a, b) => b.id - a.id)
      .filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          t.travel_style.toLowerCase().includes(q)
      )
  }, [trips, query, isSearching])

  const totalPages = Math.ceil(searchResults.length / PAGE_SIZE)
  const pagedResults = searchResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const displayList = isSearching ? pagedResults : recentTrips

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setPage(1)
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="text-5xl">🗺️</div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No trips yet</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          You haven&apos;t planned any trips. Head back to the planner and create your first adventure.
        </p>
        <Link
          href="/"
          className="mt-2 text-sm font-semibold text-sky-600 hover:text-sky-800 border border-sky-400 hover:border-sky-600 dark:text-sky-400 dark:hover:text-sky-200 dark:border-sky-500/40 dark:hover:border-sky-400 px-4 py-2 rounded-lg transition-colors"
        >
          Plan your first trip →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Search input */}
      <input
        type="search"
        placeholder="Search by destination or travel style…"
        value={query}
        onChange={handleQuery}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-sky-500 dark:focus:ring-sky-500/20 transition"
      />

      {/* Section label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {isSearching
          ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query.trim()}"`
          : "Recent trips"}
      </p>

      {/* List */}
      {displayList.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          No trips match your search.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-white/8">
          {displayList.map((t) => {
            const catMeta = getCategoryMeta(t.category)
            const styleIcon = getTravelStyleIcon(t.travel_style)
            const destIcon = getDestinationIcon(t.destination)

            return (
              <li key={t.id} className="flex items-center justify-between py-4 gap-4">
                <div className="min-w-0 space-y-1.5">

                  {/* Destination */}
                  <p className="font-semibold text-sky-600 dark:text-sky-400 truncate flex items-center gap-1.5">
                    <span>{destIcon}</span>
                    {t.destination}
                  </p>

                  {/* Category + Travel Style */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${catMeta.colorClass}`}>
                      {catMeta.icon} {t.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 border border-gray-200 dark:text-gray-300 dark:bg-white/5 dark:border-white/10 px-2 py-0.5 rounded-full capitalize">
                      {styleIcon} {t.travel_style}
                    </span>
                  </div>

                  {/* Budget */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">$</span>
                    <span>
                      Total: <strong className="text-orange-600 dark:text-orange-400">{formatUSD(t.budget)}</strong>
                      <span className="mx-1 text-gray-300 dark:text-white/20">·</span>
                      Daily: <strong className="text-orange-600 dark:text-orange-400">{formatUSD(t.daily_budget)}</strong>
                    </span>
                  </p>

                </div>
                <Link
                  href={`/trips/${t.id}`}
                  className="shrink-0 text-xs font-semibold text-sky-600 hover:text-sky-800 border border-sky-400 hover:border-sky-600 dark:text-sky-400 dark:hover:text-white dark:border-sky-500/40 dark:hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  View Details →
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {/* Pagination */}
      {isSearching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500/50 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                p === page
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500/50 dark:hover:text-sky-400"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500/50 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
