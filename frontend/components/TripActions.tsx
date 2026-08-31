"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Trip } from "@/types/trip"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface TripActionsProps {
  trip: Trip
}

export function TripActions({ trip }: TripActionsProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    destination: trip.destination,
    days: String(trip.days ?? ""),
    budget: String(trip.budget),
    travel_style: trip.travel_style,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleDelete() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/trips/${trip.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? `Failed to delete trip (${res.status})`)
      }

      router.push("/trips")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip.")
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/trips/${trip.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: form.destination,
          days: parseInt(form.days),
          budget: parseFloat(form.budget),
          travel_style: form.travel_style,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? `Failed to update trip (${res.status})`)
      }

      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update trip.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!editing && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 border border-sky-400 hover:border-sky-600 dark:text-sky-400 dark:hover:text-white dark:border-sky-500/40 dark:hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ✏️ Edit Trip
          </button>

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 dark:text-red-400 dark:hover:text-red-300 dark:border-red-500/40 dark:hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              🗑️ Delete Trip
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Delete this trip?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {editing && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/5 p-4 flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Destination
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Travel Style
              <input
                name="travel_style"
                value={form.travel_style}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Days
              <input
                name="days"
                type="number"
                min="1"
                value={form.days}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Budget (USD)
              <input
                name="budget"
                type="number"
                min="1"
                step="any"
                value={form.budget}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && !editing && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
