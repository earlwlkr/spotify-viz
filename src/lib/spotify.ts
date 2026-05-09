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

    if (res.status === 204) {
      return null as T;
    }

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
  type?: "track";
  uri?: string;
  external_urls?: { spotify?: string };
  artists: { id?: string; name: string; uri?: string; external_urls?: { spotify?: string } }[];
  album: {
    id?: string;
    name?: string;
    album_type?: "album" | "single" | "compilation";
    release_date?: string;
    release_date_precision?: "year" | "month" | "day";
    images: { url: string; width: number; height: number }[];
    uri?: string;
    external_urls?: { spotify?: string };
  };
  duration_ms?: number;
  explicit?: boolean;
  is_local?: boolean;
  external_ids?: { isrc?: string };
}

export interface TopTracksResponse {
  items: Track[];
}

// --- Helpers ---

export interface CurrentUserProfile {
  id: string;
  display_name: string | null;
  images?: { url: string; width?: number; height?: number }[];
  uri?: string;
  external_urls?: { spotify?: string };
}

export function getCurrentUserProfile() {
  return spotifyFetch<CurrentUserProfile>("/me");
}

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
  uri?: string;
  external_urls?: { spotify?: string };
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

export interface SavedTrackItem {
  added_at: string;
  track: Track | null;
}

export interface SavedTracksResponse {
  items: SavedTrackItem[];
  next: string | null;
  total: number;
}

export interface SavedAlbum {
  id: string;
  name: string;
  album_type: "album" | "single" | "compilation";
  release_date?: string;
  release_date_precision?: "year" | "month" | "day";
  total_tracks?: number;
  images: { url: string; width?: number; height?: number }[];
  artists: { id?: string; name: string; uri?: string }[];
  uri?: string;
  external_urls?: { spotify?: string };
}

export interface SavedAlbumItem {
  added_at: string;
  album: SavedAlbum;
}

export interface SavedAlbumsResponse {
  items: SavedAlbumItem[];
  next: string | null;
  total: number;
}

async function getPagedByOffset<T extends { items: unknown[]; next: string | null }>(
  path: string,
  limit = 50,
  maxPages = 3
): Promise<T["items"]> {
  const allItems: T["items"] = [];
  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    const res = await spotifyFetch<T>(`${path}?${params.toString()}`);
    allItems.push(...res.items);
    if (!res.next || res.items.length < limit) break;
  }
  return allItems;
}

export async function getSavedTracks(limit = 50, maxPages = 3): Promise<SavedTracksResponse> {
  const items = await getPagedByOffset<SavedTracksResponse>("/me/tracks", limit, maxPages);
  return { items: items as SavedTrackItem[], next: null, total: items.length };
}

export async function getSavedAlbums(limit = 50, maxPages = 3): Promise<SavedAlbumsResponse> {
  const items = await getPagedByOffset<SavedAlbumsResponse>("/me/albums", limit, maxPages);
  return { items: items as SavedAlbumItem[], next: null, total: items.length };
}

export interface PlaylistSummary {
  id: string;
  name: string;
  description?: string | null;
  collaborative: boolean;
  public: boolean | null;
  owner: { id: string; display_name?: string | null };
  images: { url: string; width?: number; height?: number }[];
  items?: { total: number };
  uri: string;
  external_urls?: { spotify?: string };
}

export interface CurrentUserPlaylistsResponse {
  items: PlaylistSummary[];
  next: string | null;
  total: number;
}

export interface PlaylistItem {
  added_at: string | null;
  is_local: boolean;
  item: Track | null;
}

export interface PlaylistItemsResponse {
  items: PlaylistItem[];
  next: string | null;
  total: number;
}

export async function getCurrentUserPlaylists(
  limit = 50,
  maxPages = 2
): Promise<CurrentUserPlaylistsResponse> {
  const items = await getPagedByOffset<CurrentUserPlaylistsResponse>("/me/playlists", limit, maxPages);
  return { items: items as PlaylistSummary[], next: null, total: items.length };
}

export function getPlaylistItems(playlistId: string, limit = 50) {
  const params = new URLSearchParams({
    limit: String(limit),
    fields:
      "total,items(added_at,is_local,item(id,name,type,uri,duration_ms,explicit,is_local,artists(name,uri,external_urls),album(id,name,album_type,release_date,release_date_precision,images,uri,external_urls),external_urls))",
  });
  return spotifyFetch<PlaylistItemsResponse>(`/playlists/${playlistId}/items?${params.toString()}`);
}

export interface CurrentlyPlayingResponse {
  is_playing: boolean;
  progress_ms?: number;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  item: Track | null;
  context?: { type: string; uri: string; external_urls?: { spotify?: string } } | null;
}

export function getCurrentlyPlaying() {
  return spotifyFetch<CurrentlyPlayingResponse | null>("/me/player/currently-playing");
}
