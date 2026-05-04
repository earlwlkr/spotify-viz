import { Track, AudioFeatures } from "./spotify";

// --- AcousticBrainz / MusicBrainz types ---

interface AcousticBrainzHighLevel {
  metadata?: {
    tags?: {
      musicbrainz_recordingid?: string[];
      bpm?: string[];
    };
    audio_properties?: {
      bpm?: number;
    };
  };
  highlevel?: {
    danceability?: {
      all?: { danceable: number; not_danceable: number };
      value?: string;
      probability?: number;
    };
    rhythm?: {
      bpm?: number;
    };
    mood_happy?: {
      all?: { happy: number; not_happy: number };
      value?: string;
      probability?: number;
    };
    mood_sad?: {
      all?: { sad: number; not_sad: number };
      value?: string;
      probability?: number;
    };
    mood_relaxed?: {
      all?: { relaxed: number; not_relaxed: number };
      value?: string;
      probability?: number;
    };
    mood_aggressive?: {
      all?: { aggressive: number; not_aggressive: number };
      value?: string;
      probability?: number;
    };
    voice_instrumental?: {
      all?: { instrumental: number; voice: number };
      value?: string;
      probability?: number;
    };
  };
}

// --- Metadata-based estimates (fast, deterministic) ---

export function generateEstimatedFeatures(track: Track): AudioFeatures {
  let danceability = 0.5;
  let energy = 0.5;
  let valence = 0.5;
  let tempo = 120;
  let acousticness = 0.3;
  let instrumentalness = 0.1;

  const nameLower = track.name.toLowerCase();
  const artistName = track.artists[0]?.name.toLowerCase() || "";

  if (nameLower.includes("acoustic") || nameLower.includes("unplugged")) {
    acousticness += 0.35;
    energy -= 0.2;
    danceability -= 0.1;
  }
  if (nameLower.includes("remix") || nameLower.includes("club mix") || nameLower.includes("extended")) {
    danceability += 0.2;
    energy += 0.15;
    tempo += 8;
  }
  if (nameLower.includes("live")) {
    energy += 0.08;
    acousticness += 0.08;
  }
  if (nameLower.includes("intro") || nameLower.includes("interlude") || nameLower.includes("outro")) {
    instrumentalness += 0.3;
    energy -= 0.15;
  }
  if (nameLower.includes("piano") || nameLower.includes("guitar") || nameLower.includes("strings")) {
    acousticness += 0.2;
    instrumentalness += 0.1;
  }
  if (nameLower.includes("orchestra") || nameLower.includes("symphony")) {
    acousticness += 0.35;
    instrumentalness += 0.35;
    energy -= 0.15;
  }
  if (nameLower.includes("ambient") || nameLower.includes("drone")) {
    energy -= 0.2;
    instrumentalness += 0.3;
    danceability -= 0.2;
  }
  if (nameLower.includes("house") || nameLower.includes("techno") || nameLower.includes("edm")) {
    danceability += 0.25;
    energy += 0.2;
    tempo += 10;
    acousticness -= 0.15;
    instrumentalness += 0.1;
  }
  if (nameLower.includes("hip hop") || nameLower.includes("rap")) {
    danceability += 0.15;
    energy += 0.1;
    instrumentalness -= 0.05;
  }
  if (nameLower.includes("ballad")) {
    energy -= 0.15;
    valence -= 0.1;
    acousticness += 0.15;
    danceability -= 0.1;
    tempo -= 15;
  }

  if (artistName.includes("acoustic") || artistName.includes("piano") || artistName.includes("chamber")) {
    acousticness += 0.25;
    energy -= 0.15;
    instrumentalness += 0.1;
  }

  if (track.duration_ms) {
    const minutes = track.duration_ms / 60000;
    if (minutes > 5) instrumentalness += 0.1;
    if (minutes < 2) {
      instrumentalness -= 0.05;
      danceability += 0.05;
      tempo += 4;
    }
    if (minutes > 8) {
      energy -= 0.1;
      acousticness += 0.08;
      danceability -= 0.1;
    }
  }

  if (typeof track.popularity === "number") {
    const pop = track.popularity / 100;
    energy = energy * 0.7 + pop * 0.3;
    danceability = danceability * 0.8 + pop * 0.2;
    valence = valence * 0.85 + pop * 0.15;
    tempo = tempo + pop * 8;
  }

  if (danceability > 0.7) energy += 0.04;
  if (acousticness > 0.7) {
    energy -= 0.1;
    danceability -= 0.05;
  }
  if (instrumentalness > 0.6) valence -= 0.05;

  return {
    id: track.id,
    danceability: Math.max(0, Math.min(1, danceability)),
    energy: Math.max(0, Math.min(1, energy)),
    valence: Math.max(0, Math.min(1, valence)),
    tempo: Math.max(40, Math.min(220, tempo)),
    acousticness: Math.max(0, Math.min(1, acousticness)),
    instrumentalness: Math.max(0, Math.min(1, instrumentalness)),
  };
}

// --- AcousticBrainz network helpers ---

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function lookupMusicBrainz(isrc: string, delayMs: number): Promise<string | null> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  try {
    const url = `https://musicbrainz.org/ws2/isrc/${encodeURIComponent(isrc)}?fmt=json`;
    const data = await fetchWithTimeout<{
      isrc: string;
      recordings?: Array<{ id: string; title: string }>;
    }>(
      url,
      {
        headers: {
          "User-Agent": "SpotifyViz/1.0 (spotify-viz-app)",
          Accept: "application/json",
        },
      },
      1500
    );
    return data.recordings?.[0]?.id ?? null;
  } catch (err) {
    console.warn(`[MusicBrainz] ISRC ${isrc} lookup failed:`, err);
    return null;
  }
}

export async function lookupAcousticBrainz(mbid: string): Promise<AudioFeatures | null> {
  try {
    const url = `https://acousticbrainz.org/api/v1/${encodeURIComponent(mbid)}/high-level`;
    const data = await fetchWithTimeout<AcousticBrainzHighLevel>(
      url,
      {
        headers: { Accept: "application/json" },
      },
      3000
    );

    const hl = data.highlevel || {};

    const danceability = hl.danceability?.all?.danceable ?? 0.5;
    const tempo =
      data.metadata?.audio_properties?.bpm ??
      (data.metadata?.tags?.bpm?.[0] ? parseFloat(data.metadata.tags.bpm[0]) : null) ??
      hl.rhythm?.bpm ??
      120;
    const happy = hl.mood_happy?.all?.happy ?? 0.5;
    const sad = hl.mood_sad?.all?.sad ?? 0.5;
    const valence = Math.max(0, Math.min(1, (happy - sad + 1) / 2));
    const aggressive = hl.mood_aggressive?.all?.aggressive ?? 0.3;
    const relaxed = hl.mood_relaxed?.all?.relaxed ?? 0.5;
    const energy = Math.max(0, Math.min(1, (aggressive + (1 - relaxed)) / 2));
    const instrumentalness = hl.voice_instrumental?.all?.instrumental ?? 0.5;
    const acousticness = Math.max(
      0,
      Math.min(1, (1 - energy) * 0.6 + instrumentalness * 0.3 + (1 - danceability) * 0.1)
    );

    return {
      id: mbid,
      danceability,
      energy,
      valence,
      tempo,
      acousticness,
      instrumentalness,
    };
  } catch (err) {
    console.warn(`[AcousticBrainz] MBID ${mbid} lookup failed:`, err);
    return null;
  }
}

export async function getAcousticBrainzFeatures(
  tracks: Track[],
  signal?: AbortSignal
): Promise<{
  features: AudioFeatures[];
  acousticBrainzUsed: boolean;
}> {
  const MAX_TRACKS = 3;
  const STAGGER_MS = 0;

  const tracksWithIsrc = tracks.filter((t) => t.external_ids?.isrc).slice(0, MAX_TRACKS);

  console.log(
    `[AcousticBrainz] Processing ${tracksWithIsrc.length} tracks with ISRC (of ${tracks.length} total)`
  );

  const mbidMap = new Map<string, string>();

  // Staggered ISRC → MBID lookups
  for (let i = 0; i < tracksWithIsrc.length; i++) {
    if (signal?.aborted) break;
    const track = tracksWithIsrc[i];
    const isrc = track.external_ids!.isrc!;
    if (i > 0) await new Promise((r) => setTimeout(r, STAGGER_MS));
    if (signal?.aborted) break;
    const mbid = await lookupMusicBrainz(isrc, 0);
    if (mbid) mbidMap.set(track.id, mbid);
  }

  console.log(`[AcousticBrainz] Found ${mbidMap.size} MBIDs`);

  if (signal?.aborted) {
    console.log("[AcousticBrainz] Aborted after ISRC lookups, returning estimates");
    return {
      features: tracks.map((track) => generateEstimatedFeatures(track)),
      acousticBrainzUsed: false,
    };
  }

  const spotifyToFeatures = new Map<string, AudioFeatures>();

  // Parallel MBID → AcousticBrainz lookups (no rate limit issues here)
  await Promise.all(
    Array.from(mbidMap.entries()).map(async ([spotifyId, mbid]) => {
      if (signal?.aborted) return;
      const features = await lookupAcousticBrainz(mbid);
      if (features) {
        features.id = spotifyId;
        spotifyToFeatures.set(spotifyId, features);
      }
    })
  );

  console.log(`[AcousticBrainz] Enriched ${spotifyToFeatures.size} tracks`);

  const result = tracks.map((track) => {
    if (spotifyToFeatures.has(track.id)) {
      return spotifyToFeatures.get(track.id)!;
    }
    return generateEstimatedFeatures(track);
  });

  return {
    features: result,
    acousticBrainzUsed: spotifyToFeatures.size > 0,
  };
}
