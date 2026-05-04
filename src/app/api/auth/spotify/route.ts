import { NextResponse } from "next/server";
import { getAuthUrl, getRedirectUri } from "@/lib/auth";

export async function GET(req: Request) {
  const state = crypto.randomUUID();
  const redirectUri = getRedirectUri(new URL(req.url).origin);
  const url = getAuthUrl(state, redirectUri);
  const response = NextResponse.redirect(url);
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
