import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/auth";

export async function GET() {
  const state = crypto.randomUUID();
  const url = getAuthUrl(state);
  const response = NextResponse.redirect(url);
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
