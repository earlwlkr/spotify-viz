import { getTopTracks } from "@/lib/spotify";
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
  const points = top.items.map((track) => ({
    x: Math.round(track.duration_ms / 1000),
    y: track.popularity,
    label: `${track.name} — ${track.artists[0].name}`,
    color: `hsl(${200 + track.popularity * 1.4}, 75%, 55%)`,
  }));

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Audio Scatter</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Track length vs Spotify popularity for your top tracks.
      </p>
      <TimeRangeSelector />
      <ScatterPlot
        data={points}
        xLabel="Duration (seconds)"
        yLabel="Popularity"
      />
    </div>
  );
}
