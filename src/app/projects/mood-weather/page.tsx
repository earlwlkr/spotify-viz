import { getTopTracks } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScatterPlot from "@/components/viz/ScatterPlot";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function MoodWeatherPage({
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
  const points = top.items.map((track, i) => ({
    x: i + 1,
    y: track.popularity,
    label: `${track.name} — ${track.artists[0].name}`,
    color: `hsl(${120 - track.popularity * 1.2}, 70%, 50%)`,
  }));

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Mood Weather</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Your top tracks plotted by rank and Spotify popularity.
      </p>
      <TimeRangeSelector />
      <ScatterPlot
        data={points}
        xLabel="Top track rank"
        yLabel="Popularity"
      />
    </div>
  );
}
