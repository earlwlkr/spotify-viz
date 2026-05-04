import { getTopArtists } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BubblePack from "@/components/viz/BubblePack";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function GenreGalaxyPage({
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

  const top = await getTopArtists(timeRange, 50);

  const genreCounts = new Map<string, number>();
  for (const artist of top.items) {
    for (const genre of artist.genres ?? []) {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    }
  }

  const bubbles = Array.from(genreCounts.entries())
    .map(([label, value], i) => ({
      label,
      value,
      color: `hsl(${(i * 137.5) % 360}, 65%, 45%)`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 40);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Genre Galaxy</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Genres from your top artists, sized by artist count.
      </p>
      <TimeRangeSelector />
      <BubblePack data={bubbles} />
    </div>
  );
}
