import { getTopArtists } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarChart from "@/components/viz/BarChart";

export default async function GenreEvolutionPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const [short, medium, long] = await Promise.all([
    getTopArtists("short_term", 50),
    getTopArtists("medium_term", 50),
    getTopArtists("long_term", 50),
  ]);

  function getGenreCounts(items: typeof short.items) {
    const counts = new Map<string, number>();
    for (const artist of items) {
      for (const genre of artist.genres ?? []) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      }
    }
    return counts;
  }

  const shortCounts = getGenreCounts(short.items);
  const mediumCounts = getGenreCounts(medium.items);
  const longCounts = getGenreCounts(long.items);

  const allGenres = new Set([...shortCounts.keys(), ...mediumCounts.keys(), ...longCounts.keys()]);
  const sortedGenres = Array.from(allGenres)
    .map((g) => ({
      genre: g,
      short: shortCounts.get(g) || 0,
      medium: mediumCounts.get(g) || 0,
      long: longCounts.get(g) || 0,
      total: (shortCounts.get(g) || 0) + (mediumCounts.get(g) || 0) + (longCounts.get(g) || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const shortData = sortedGenres.map((d) => ({ label: d.genre, value: d.short, color: "#1db954" }));
  const mediumData = sortedGenres.map((d) => ({ label: d.genre, value: d.medium, color: "#3b82f6" }));
  const longData = sortedGenres.map((d) => ({ label: d.genre, value: d.long, color: "#f59e0b" }));

  const gained = sortedGenres.filter((d) => d.short > d.long);
  const lost = sortedGenres.filter((d) => d.short < d.long);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Genre Evolution</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        How your top genres shift across short, medium, and long term.
      </p>

      <div style={{ display: "grid", gap: "2rem", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "1rem", color: "#1db954" }}>4 Weeks</h3>
          <BarChart data={shortData} />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "1rem", color: "#3b82f6" }}>6 Months</h3>
          <BarChart data={mediumData} />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "1rem", color: "#f59e0b" }}>All Time</h3>
          <BarChart data={longData} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, color: "#1db954" }}>Gaining Traction</h3>
          {gained.slice(0, 5).map((d) => (
            <div key={d.genre} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span>{d.genre}</span>
              <span style={{ color: "#1db954" }}>+{d.short - d.long}</span>
            </div>
          ))}
          {gained.length === 0 && <p style={{ color: "#888", fontSize: "0.85rem" }}>No major gains detected.</p>}
        </div>
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, color: "#f59e0b" }}>Fading Away</h3>
          {lost.slice(0, 5).map((d) => (
            <div key={d.genre} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span>{d.genre}</span>
              <span style={{ color: "#f59e0b" }}>-{d.long - d.short}</span>
            </div>
          ))}
          {lost.length === 0 && <p style={{ color: "#888", fontSize: "0.85rem" }}>No major losses detected.</p>}
        </div>
      </div>
    </div>
  );
}
