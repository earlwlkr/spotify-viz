import { getTopTracks, getTopArtists, getRecentlyPlayed } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarChart from "@/components/viz/BarChart";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const [topTracks, topArtists, recent] = await Promise.all([
    getTopTracks("medium_term", 50),
    getTopArtists("medium_term", 50),
    getRecentlyPlayed(50),
  ]);

  // --- Efficiency stats ---
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

  // --- Temporal patterns ---
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (const item of recent.items) {
    const date = new Date(item.played_at);
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
  }

  const hourData = hourCounts.map((value, i) => ({
    label: `${i}`,
    value,
    color: "#3b82f6",
  }));

  const dayData = dayCounts.map((value, i) => ({
    label: dayNames[i],
    value,
    color: "#f59e0b",
  }));

  const statCards = [
    { label: "Total Hours", value: `${Math.round(totalHours * 10) / 10}h`, color: "#1db954" },
    { label: "Unique Tracks", value: uniqueTracks, color: "#3b82f6" },
    { label: "Unique Artists", value: uniqueArtists, color: "#f59e0b" },
    { label: "Deep Diver", value: `${deepDiver}h/artist`, color: "#a855f7" },
    { label: "Explorer", value: explorer, color: "#ec4899" },
    { label: "Repeat Rate", value: `${repeatRate}%`, color: "#ef4444" },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Your listening profile at a glance.
      </p>

      {/* Efficiency stats */}
      <div style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        marginBottom: "2rem"
      }}>
        {statCards.map((block) => (
          <div key={block.label} style={{
            background: "#141414",
            borderRadius: 12,
            padding: "1.25rem",
            border: "1px solid #1f1f1f",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: block.color }}>{block.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{block.label}</div>
          </div>
        ))}
      </div>

      {/* Temporal patterns charts */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Hour of Day</h3>
          <BarChart data={hourData} />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Day of Week</h3>
          <BarChart data={dayData} />
        </div>
      </div>

      {/* Lists */}
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {/* Top artists */}
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Top Artists</h3>
          {topArtists.items.slice(0, 5).map((artist, i) => (
            <div key={artist.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "#888", fontSize: "0.8rem", width: 16 }}>{i + 1}</span>
              {artist.images[0] && (
                <img src={artist.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <span style={{ fontSize: "0.9rem" }}>{artist.name}</span>
            </div>
          ))}
        </div>

        {/* Top tracks */}
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Top Tracks</h3>
          {topTracks.items.slice(0, 5).map((track, i) => (
            <div key={track.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "#888", fontSize: "0.8rem", width: 16 }}>{i + 1}</span>
              {track.album.images[0] && (
                <img src={track.album.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.artists[0].name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Most repeated */}
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Most Repeated</h3>
          {sortedRepeats.map(([name, count], i) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span><span style={{ color: "#888", marginRight: "0.5rem" }}>{i + 1}.</span>{name}</span>
              <span style={{ color: "#f59e0b", fontWeight: 500 }}>{count} plays</span>
            </div>
          ))}
          {sortedRepeats.length === 0 && (
            <p style={{ color: "#888", fontSize: "0.85rem" }}>No repeats yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
