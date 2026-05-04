import { getRecentlyPlayed, getTopTracks, getTopArtists } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ListeningEfficiencyPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const [recent, topTracks, topArtists] = await Promise.all([
    getRecentlyPlayed(50),
    getTopTracks("short_term", 50),
    getTopArtists("short_term", 50),
  ]);

  const totalMs = recent.items.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0);
  const totalHours = totalMs / 1000 / 60 / 60;

  const uniqueTracks = new Set(recent.items.map((i) => i.track.id)).size;
  const uniqueArtists = new Set(recent.items.map((i) => i.track.artists[0].name)).size;

  const deepDiver = uniqueArtists > 0 ? Math.round((totalHours / uniqueArtists) * 10) / 10 : 0;
  const explorer = uniqueArtists;
  const repeatRate = recent.items.length > 0
    ? Math.round(((recent.items.length - uniqueTracks) / recent.items.length) * 100)
    : 0;

  const topTrackRepeats = new Map<string, number>();
  for (const item of recent.items) {
    topTrackRepeats.set(item.track.name, (topTrackRepeats.get(item.track.name) || 0) + 1);
  }
  const sortedRepeats = Array.from(topTrackRepeats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Listening Efficiency</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        How you spend your listening time. Based on recent plays.
      </p>

      <div style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        marginBottom: "2rem"
      }}>
        {[
          { label: "Total Hours", value: `${Math.round(totalHours * 10) / 10}h`, color: "#1db954" },
          { label: "Unique Tracks", value: uniqueTracks, color: "#3b82f6" },
          { label: "Unique Artists", value: uniqueArtists, color: "#f59e0b" },
          { label: "Deep Diver Score", value: `${deepDiver}h/artist`, color: "#a855f7" },
          { label: "Explorer Score", value: explorer, color: "#ec4899" },
          { label: "Repeat Rate", value: `${repeatRate}%`, color: "#ef4444" },
        ].map((block) => (
          <div key={block.label} style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: block.color }}>{block.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{block.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
        <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Most Repeated Recently</h3>
        {sortedRepeats.map(([name, count], i) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span><span style={{ color: "#888", marginRight: "0.5rem" }}>{i + 1}.</span>{name}</span>
            <span style={{ color: "#f59e0b", fontWeight: 500 }}>{count} plays</span>
          </div>
        ))}
      </div>
    </div>
  );
}
