import { NextResponse } from "next/server";

const COOKIE_NAME = "access_token";
const COOKIE_MAX_AGE = 60 * 60 * 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.access_token === "string" ? body.access_token.trim() : "";

    if (!token) {
      return NextResponse.json({ detail: "Access token is required" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
