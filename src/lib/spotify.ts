import { cookies } from "next/headers";
import { refreshAccessToken } from "./auth";

const API_BASE = "https://api.spotify.com/v1";

async function getValidToken(): Promise<string> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("spotify_access_token")?.value;
  const refreshToken = cookieStore.get("spotify_refresh_token")?.value;
  const expiresAt = Number(cookieStore.get("spotify_expires_at")?.value || "0");

  if (!accessToken) throw new Error("Not authenticated");

  if (Date.now() > expiresAt - 60000 && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    cookieStore.set("spotify_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: refreshed.expires_in,
      path: "/",
    });
    cookieStore.set(
      "spotify_expires_at",
      String(Date.now() + refreshed.expires_in * 1000),
      { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" }
    );
  }

  return accessToken;
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify API error: ${res.status} ${err}`);
  }

  return res.json() as Promise<T>;
}

// --- Types ---

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number; height: number }[] };
  duration_ms: number;
  popularity: number;
}

export interface TopTracksResponse {
  items: Track[];
}

// --- Helpers ---

export function getTopTracks(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 50
) {
  return spotifyFetch<TopTracksResponse>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
}

export interface RecentlyPlayedItem {
  track: Track;
  played_at: string;
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[];
}

export function getRecentlyPlayed(limit = 50) {
  return spotifyFetch<RecentlyPlayedResponse>(`/me/player/recently-played?limit=${limit}`);
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
}

export interface TopArtistsResponse {
  items: Artist[];
}

export function getTopArtists(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 50
) {
  return spotifyFetch<TopArtistsResponse>(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
}
