import { getTopTracks, getAudioFeatures } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScatterPlot from "@/components/viz/ScatterPlot";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function AudioScatterPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const { range } = await searchParams;
  const timeRange = (range as "short_term" | "medium_term" | "long_term") || "medium_term";

  const top = await getTopTracks(timeRange, 50);
  const ids = top.items.map((t) => t.id);
  const features = await getAudioFeatures(ids);

  const points = top.items
    .map((track, i) => {
      const f = features.audio_features[i];
      if (!f) return null;
      return {
        x: f.danceability,
        y: f.tempo,
        label: `${track.name} — ${track.artists[0].name}`,
        color: `hsl(${200 + f.energy * 160}, 75%, 55%)`,
      };
    })
    .filter(Boolean);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Audio Scatter</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Danceability vs tempo. Color = energy level.
      </p>
      <TimeRangeSelector />
      <ScatterPlot
        data={points as { x: number; y: number; label: string; color: string }[]}
        xLabel="Danceability"
        yLabel="Tempo (BPM)"
      />
    </div>
  );
}
