import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getAppOrigin, getRedirectUri, useSecureCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("spotify_auth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const tokens = await exchangeCode(code, getRedirectUri(getAppOrigin()));

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("spotify_access_token", tokens.access_token, {
    httpOnly: true,
    secure: useSecureCookies(),
    maxAge: tokens.expires_in,
    path: "/",
  });
  response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: useSecureCookies(),
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  response.cookies.set("spotify_expires_at", String(Date.now() + tokens.expires_in * 1000), {
    httpOnly: true,
    secure: useSecureCookies(),
    path: "/",
  });
  response.cookies.delete("spotify_auth_state");
  response.cookies.set("spotify_authed", "true", {
    httpOnly: false,
    secure: useSecureCookies(),
    maxAge: tokens.expires_in,
    path: "/",
  });

  return response;
}
