import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTrip, ApiError } from "@/services/tripService"
import { parseItinerary } from "@/lib/parseItinerary"
import { formatUSD, getCategoryMeta, getTravelStyleIcon, getDestinationIcon } from "@/lib/tripMeta"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserMenu } from "@/components/UserMenu"
import { ItinerarySlider } from "@/components/ItinerarySlider"
import { TripActions } from "@/components/TripActions"
import type { Trip } from "@/types/trip"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

interface Props {
  params: Promise<{ id: string }>
}

function TripPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 px-5 py-10 transition-colors duration-200">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to My Trips
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

function TripErrorCard({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#161b22] dark:shadow-lg p-10 flex flex-col items-center text-center gap-3">
      <div className="text-5xl">{icon}</div>
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
      <Link
        href="/trips"
        className="mt-2 text-sm font-semibold text-sky-600 hover:text-sky-800 border border-sky-400 hover:border-sky-600 dark:text-sky-400 dark:hover:text-sky-200 dark:border-sky-500/40 dark:hover:border-sky-400 px-4 py-2 rounded-lg transition-colors"
      >
        Back to My Trips
      </Link>
    </div>
  )
}

export default async function TripDetailPage({ params }: Props) {
  const cookieStore = await cookies()
  if (!cookieStore.get("access_token")?.value) {
    redirect("/login")
  }

  const { id } = await params


  let trip: Trip
  try {
    trip = await getTrip(Number(id))
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login")
    }
    if (err instanceof ApiError && err.status === 403) {
      return (
        <TripPageShell>
          <TripErrorCard
            icon="🔒"
            title="Access Denied"
            message="This trip belongs to another account, so you don't have permission to view it."
          />
        </TripPageShell>
      )
    }
    if (err instanceof ApiError && err.status === 404) {
      return (
        <TripPageShell>
          <TripErrorCard
            icon="🗺️"
            title="Trip Not Found"
            message="This trip doesn't exist or may have been deleted."
          />
        </TripPageShell>
      )
    }
    throw err
  }

  const days = trip.ai_recommendation ? parseItinerary(trip.ai_recommendation) : []
  const catMeta = getCategoryMeta(trip.category)
  const styleIcon = getTravelStyleIcon(trip.travel_style)
  const destIcon = getDestinationIcon(trip.destination)

  return (
    <TripPageShell>
      {/* Trip summary header */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#161b22] dark:shadow-lg p-6 space-y-3">

        {/* Destination */}
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <span>{destIcon}</span>
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
            {trip.destination}
          </span>
        </h1>

        {/* Category + Travel Style */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${catMeta.colorClass}`}>
            {catMeta.icon} {trip.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 border border-gray-200 dark:text-gray-300 dark:bg-white/5 dark:border-white/10 px-2.5 py-1 rounded-full capitalize">
            {styleIcon} {trip.travel_style}
          </span>
        </div>

        {/* Budget */}
        <div className="flex gap-6 text-sm text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">$</span>
            Total: <strong className="text-orange-600 dark:text-orange-400 ml-1">{formatUSD(trip.budget)}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">$</span>
            Daily: <strong className="text-orange-600 dark:text-orange-400 ml-1">{formatUSD(trip.daily_budget)}</strong>
          </span>
        </div>

        {/* Transport */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          🚌 Transport: <span className="text-sky-600 dark:text-sky-400 font-medium">{trip.recommended_transportation}</span>
        </p>

        {/* Edit / Delete actions */}
        <div className="pt-2 border-t border-gray-100 dark:border-white/8">
          <TripActions trip={trip} />
        </div>
      </div>

      {/* Per-day slider */}
      <ItinerarySlider days={days} />
    </TripPageShell>

  )
}