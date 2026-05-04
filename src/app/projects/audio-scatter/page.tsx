import { getTopTracks, getAudioFeatures } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProgressiveScatterPlot from "@/components/ProgressiveScatterPlot";
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
  const features = await getAudioFeatures(top.items);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Audio Scatter</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Danceability vs tempo. Color = energy level.
      </p>
      <TimeRangeSelector />
      <ProgressiveScatterPlot
        tracks={top.items}
        initialFeatures={features.audio_features.filter(Boolean) as NonNullable<typeof features.audio_features[0]>[]}
        xLabel="Danceability"
        yLabel="Tempo (BPM)"
        xKey="danceability"
        yKey="tempo"
        variant="audio-scatter"
      />
    </div>
  );
}
