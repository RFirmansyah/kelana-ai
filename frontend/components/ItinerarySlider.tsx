"use client"

import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import type { DaySection } from "@/lib/parseItinerary"

interface ItinerarySliderProps {
  days: DaySection[]
}

export function ItinerarySlider({ days }: ItinerarySliderProps) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (days.length === 0) return null

  const prev = () => setActive((i) => Math.max(0, i - 1))
  const next = () => setActive((i) => Math.min(days.length - 1, i + 1))

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (delta > 40) next()
    else if (delta < -40) prev()
    touchStartX.current = null
  }

  const section = days[active]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Itinerary
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {active + 1} / {days.length}
        </span>
      </div>

      {/* Day tab strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActive(i)}
            className={`shrink-0 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
              i === active
                ? "bg-sky-500 border-sky-500 text-white"
                : "border-gray-200 text-gray-500 hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Slide card */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#161b22] dark:shadow-lg p-6 space-y-4 min-h-[260px]"
      >
        {/* Card header */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:border dark:border-sky-500/30 dark:text-sky-400">
            Day {section.day}
          </span>
          {section.title && (
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {section.title}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="chat-md text-sm text-gray-700 dark:text-gray-300">
          <ReactMarkdown>{section.content.trim()}</ReactMarkdown>
        </div>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={active === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500 dark:hover:text-sky-400 transition-colors"
        >
          â† Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {days.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all ${
                i === active
                  ? "w-4 h-2 bg-sky-500"
                  : "w-2 h-2 bg-gray-300 hover:bg-sky-300 dark:bg-white/20 dark:hover:bg-sky-500/50"
              }`}
              aria-label={`Go to Day ${days[i].day}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={active === days.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-sky-400 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed dark:border-white/10 dark:text-gray-400 dark:hover:border-sky-500 dark:hover:text-sky-400 transition-colors"
        >
          Next â†’
        </button>
      </div>
    </div>
  )
}

