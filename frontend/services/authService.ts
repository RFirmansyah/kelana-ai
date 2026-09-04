const API_URL = process.env.NEXT_PUBLIC_API_URL; // "http://localhost:8000/api/v1"

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface RecentTrip {
  id: number;
  destination: string;
  travel_style: string;
  created_at: string;
}

export interface MeResponse {
  id: number;
  name: string;
  email: string;
  created_at: string;
  total_trips: number;
  recent_trips: RecentTrip[];
}

export async function login(
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Login failed (${res.status})`);
  }

  return res.json();
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Registration failed (${res.status})`);
  }

  return res.json();
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Failed to fetch profile (${res.status})`);
  }

  return res.json();
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
  }

  // Clear the application session through Next.js so the server-rendered
  // routes and browser-side auth state are cleared together.
  await fetch("/api/auth/session", { method: "DELETE", cache: "no-store" }).catch(() => {});
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail;
    // FastAPI validation errors (e.g. min length) come back as an array
    const message = Array.isArray(detail)
      ? detail.map((d: { msg: string }) => d.msg).join(" ")
      : detail ?? `Failed to change password (${res.status})`;
    throw new Error(message);
  }
}
