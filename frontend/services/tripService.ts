import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function serverAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value ?? null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`, {
    headers: await serverAuthHeaders(),
  })
  if (!res.ok) throw new ApiError(`Failed to fetch trips (${res.status})`, res.status)
  return res.json()
}

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    headers: await serverAuthHeaders(),
  })
  if (!res.ok) throw new ApiError(`Failed to fetch trip (${res.status})`, res.status)
  return res.json()
}

export async function generateTrip(data: unknown) {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: await serverAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new ApiError(`Failed to create trip (${res.status})`, res.status)
  return res.json()
}