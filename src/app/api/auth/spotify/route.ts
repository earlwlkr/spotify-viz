import { NextResponse } from "next/server";
import { getAppOrigin, getAuthUrl, getRedirectUri, useSecureCookies } from "@/lib/auth";

export async function GET(req: Request) {
  const appOrigin = getAppOrigin();
  const appHost = new URL(appOrigin).host;
  const reqHost = req.headers.get("host");

  if (reqHost !== appHost) {
    return NextResponse.redirect(`${appOrigin}/api/auth/spotify`);
  }

  const state = crypto.randomUUID();
  const redirectUri = getRedirectUri(appOrigin);
  const url = getAuthUrl(state, redirectUri);
  const response = NextResponse.redirect(url);
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
