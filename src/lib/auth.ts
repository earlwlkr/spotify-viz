const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/spotify`;

export const SCOPES = [
  "user-read-private",
  "user-top-read",
  "playlist-read-private",
  "user-read-recently-played",
  "user-library-read",
];

export function getAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
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

  const res = await fetch(SPOTIFY_TOKEN_URL, {
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
