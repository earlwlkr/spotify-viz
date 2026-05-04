"use client";

import { Track, AudioFeatures } from "@/lib/spotify";
import { useProgressiveAudioFeatures } from "@/hooks/useProgressiveAudioFeatures";
import ScatterPlot from "@/components/viz/ScatterPlot";

type Variant = "audio-scatter" | "mood-weather";

interface Props {
  tracks: Track[];
  initialFeatures: AudioFeatures[];
  xLabel: string;
  yLabel: string;
  xKey: keyof AudioFeatures;
  yKey: keyof AudioFeatures;
  variant: Variant;
  width?: number;
  height?: number;
}

function getColor(variant: Variant, f: AudioFeatures): string {
  if (variant === "audio-scatter") {
    return `hsl(${200 + f.energy * 160}, 75%, 55%)`;
  }
  return `hsl(${f.valence * 120}, 70%, 50%)`;
}

export default function ProgressiveScatterPlot({
  tracks,
  initialFeatures,
  xLabel,
  yLabel,
  xKey,
  yKey,
  variant,
  width,
  height,
}: Props) {
  const { features, acousticBrainz, loading, error } = useProgressiveAudioFeatures(
    tracks,
    initialFeatures
  );

  const points = tracks
    .map((track, i) => {
      const f = features[i];
      if (!f) return null;
      return {
        x: f[xKey] as number,
        y: f[yKey] as number,
        label: `${track.name} — ${track.artists[0]?.name ?? "Unknown"}`,
        color: getColor(variant, f),
      };
    })
    .filter(Boolean) as { x: number; y: number; label: string; color: string }[];

  return (
    <div>
      <ScatterPlot data={points} xLabel={xLabel} yLabel={yLabel} width={width} height={height} />
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
