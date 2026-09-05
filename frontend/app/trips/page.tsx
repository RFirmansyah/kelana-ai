import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTrips } from "@/services/tripService"
import TripsList from "@/components/TripsList"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserMenu } from "@/components/UserMenu"
import type { Trip } from "@/types/trip"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export default async function TripsPage() {
  const cookieStore = await cookies()
  if (!cookieStore.get("access_token")?.value) {
    redirect("/login")
  }
  const trips: Trip[] = await getTrips()
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 px-5 py-10 transition-colors duration-200">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 to-violet-500 dark:from-sky-400 dark:to-violet-400 bg-clip-text text-transparent">
            My Trips
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Planner
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <TripsList trips={trips} />
      </div>
    </div>
  )
}
