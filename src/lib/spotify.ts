import { cookies } from "next/headers";
import { refreshAccessToken, useSecureCookies } from "./auth";

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
      secure: useSecureCookies(),
      maxAge: refreshed.expires_in,
      path: "/",
    });
    cookieStore.set(
      "spotify_expires_at",
      String(Date.now() + refreshed.expires_in * 1000),
      { httpOnly: true, secure: useSecureCookies(), path: "/" }
    );
  }

  return accessToken;
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getValidToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Spotify API error: ${res.status} ${err}`);
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Types ---

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number; height: number }[] };
  duration_ms?: number;
  popularity?: number;
  external_ids?: { isrc?: string };
}

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

export interface TopTracksResponse {
  items: Track[];
}

export interface AudioFeaturesResponse {
  audio_features: (AudioFeatures | null)[];
  estimated?: boolean;
  acousticBrainz?: boolean;
}

// --- Helpers ---

export function getTopTracks(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 50
) {
  return spotifyFetch<TopTracksResponse>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
}

// Fast metadata-only estimates for immediate server-side render.
// AcousticBrainz enrichment happens progressively on the client via /api/audio-features.
export async function getAudioFeatures(tracks: Track[]): Promise<AudioFeaturesResponse> {
  const { generateEstimatedFeatures } = await import("./acousticbrainz");
  return {
    audio_features: tracks.map((t) => generateEstimatedFeatures(t)),
    estimated: true,
    acousticBrainz: false,
  };
}

export interface RecentlyPlayedItem {
  track: Track;
  played_at: string;
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[];
}

export async function getRecentlyPlayed(
  limit = 50,
  minDate?: string
): Promise<RecentlyPlayedResponse> {
  const allItems: RecentlyPlayedItem[] = [];
  let before: string | undefined;
  const MAX_PAGES = 3;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);

    const res = await spotifyFetch<RecentlyPlayedResponse & {
      cursors?: { before?: string; after?: string };
    }>(`/me/player/recently-played?${params.toString()}`);

    allItems.push(...res.items);

    if (minDate && res.items.length > 0) {
      const oldest = res.items[res.items.length - 1].played_at.slice(0, 10);
      if (oldest <= minDate) break;
    }

    if (!res.cursors?.before || res.items.length < limit) break;
    before = res.cursors.before;
  }

  return { items: allItems };
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  popularity?: number;
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

export interface RecommendationTrack extends Track {
  preview_url: string | null;
}

export interface RecommendationsResponse {
  tracks: RecommendationTrack[];
}

export function getRecommendations(seedTrackIds: string[], limit = 20) {
  const seeds = seedTrackIds.slice(0, 5).join(",");
  return spotifyFetch<RecommendationsResponse>(`/recommendations?seed_tracks=${seeds}&limit=${limit}`);
}
