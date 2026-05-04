"use client";

import { Track, AudioFeatures } from "@/lib/spotify";
import { useProgressiveAudioFeatures } from "@/hooks/useProgressiveAudioFeatures";
import BarMeter from "@/components/viz/BarMeter";

interface Props {
  tracks: Track[];
  initialFeatures: AudioFeatures[];
}

export default function ProgressiveVibeCheck({ tracks, initialFeatures }: Props) {
  const { features, acousticBrainz, loading, error } = useProgressiveAudioFeatures(
    tracks,
    initialFeatures
  );

  const validFeatures = features.filter(Boolean) as AudioFeatures[];

  const avg = (key: keyof AudioFeatures) =>
    validFeatures.reduce((sum, f) => sum + (f[key] as number), 0) / validFeatures.length;

  return (
    <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
      <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Audio Profile</h3>

      <p style={{ color: "#b45309", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
        Values come from AcousticBrainz when available, otherwise from track metadata heuristics.
        Spotify deprecated the exact audio-features endpoint in Nov 2024.
      </p>

      <BarMeter label="Energy" value={avg("energy")} color="#f59e0b" />
      <BarMeter label="Valence (Happiness)" value={avg("valence")} color="#1db954" />
      <BarMeter label="Danceability" value={avg("danceability")} color="#3b82f6" />
      <BarMeter label="Acousticness" value={avg("acousticness")} color="#a855f7" />
      <BarMeter label="Instrumentalness" value={avg("instrumentalness")} color="#ec4899" />

      {loading && (
        <p style={{ color: "#666", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          Enriching with AcousticBrainz data…
        </p>
      )}
      {error && (
        <p style={{ color: "#b45309", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
      {!loading && !error && acousticBrainz && (
        <p style={{ color: "#1db954", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          Audio features enriched via AcousticBrainz.
        </p>
      )}
      {!loading && !error && !acousticBrainz && (
        <p style={{ color: "#b45309", fontSize: "0.75rem", marginTop: "0.5rem" }}>
          AcousticBrainz data unavailable — showing metadata-based estimates.
        </p>
      )}
    </div>
  );
}
