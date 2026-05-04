const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
const APP_ORIGIN = new URL(APP_URL).origin;
const DEFAULT_REDIRECT_URI = `${APP_ORIGIN}/api/auth/callback/spotify`;

export const SCOPES = [
  "user-read-private",
  "user-top-read",
  "playlist-read-private",
  "user-read-recently-played",
  "user-library-read",
];

export function getRedirectUri(origin: string) {
  return `${origin}/api/auth/callback/spotify`;
}

export function getAppOrigin() {
  return APP_ORIGIN;
}

export function useSecureCookies() {
  return APP_ORIGIN.startsWith("https://");
}

export function getAuthUrl(state: string, redirectUri = DEFAULT_REDIRECT_URI) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: redirectUri,
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
  timeoutMs = 10000
): Promise<Response> {
  let lastErr: Error | undefined;
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (i < retries - 1) {
        const delay = 500 * (i + 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr ?? new Error("Network request failed after retries");
}

export async function exchangeCode(code: string, redirectUri = DEFAULT_REDIRECT_URI) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetchWithRetry(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Token exchange failed");
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetchWithRetry(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Refresh failed");
  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }>;
}
