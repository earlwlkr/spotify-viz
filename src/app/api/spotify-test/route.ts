import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = "https://api.spotify.com/v1";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") || "/me";

  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const duration = Date.now() - startTime;
    const bodyText = await res.text();
    let bodyJson = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = bodyText;
    }

    return NextResponse.json({
      request: {
        url,
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.slice(0, 8)}...${accessToken.slice(-4)}`,
        },
      },
      response: {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: bodyJson,
        duration: `${duration}ms`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Request failed", message: err.message },
      { status: 500 }
    );
  }
}
