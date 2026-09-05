import ReactMarkdown from "react-markdown"
import type { Trip } from "@/types/trip"

interface TripCardProps {
  trip: Trip
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#161b22] dark:shadow-lg p-6 space-y-2">
      <h2 className="text-xl font-semibold text-sky-600 dark:text-sky-400">{trip.destination}</h2>
      <p className="text-sm text-emerald-600 dark:text-emerald-400 capitalize">{trip.category} Â· {trip.travel_style}</p>
      <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
        <span>Budget: <strong className="text-orange-600 dark:text-orange-400">${trip.budget.toLocaleString()}</strong></span>
        <span>Daily: <strong className="text-orange-600 dark:text-orange-400">${trip.daily_budget.toLocaleString()}</strong></span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Transport: <span className="text-sky-600 dark:text-sky-400 font-medium">{trip.recommended_transportation}</span>
      </p>
      {trip.ai_recommendation && (
        <div className="chat-md text-sm text-gray-700 dark:text-gray-300">
          <ReactMarkdown>{trip.ai_recommendation}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

