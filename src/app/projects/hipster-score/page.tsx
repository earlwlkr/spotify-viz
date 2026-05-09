import { getTopTracks, getTopArtists } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function HipsterScorePage({
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

  const [tracks, artists] = await Promise.all([
    getTopTracks(timeRange, 50),
    getTopArtists(timeRange, 50),
  ]);

  const uniqueTrackArtists = new Set(tracks.items.flatMap((t) => t.artists.map((a) => a.name))).size;
  const uniqueLeadArtists = new Set(tracks.items.map((t) => t.artists[0]?.name).filter(Boolean)).size;
  const albumTypes = new Map<string, number>();
  for (const track of tracks.items) {
    const type = track.album.album_type ?? "unknown";
    albumTypes.set(type, (albumTypes.get(type) || 0) + 1);
  }
  const totalDurationMs = tracks.items.reduce((sum, track) => sum + (track.duration_ms || 0), 0);
  const avgDurationMin = tracks.items.length > 0
    ? Math.round((totalDurationMs / tracks.items.length / 60000) * 10) / 10
    : 0;
  const explicitRate = tracks.items.length > 0
    ? Math.round((tracks.items.filter((track) => track.explicit).length / tracks.items.length) * 100)
    : 0;
  const spreadScore = Math.min(100, Math.round((uniqueLeadArtists / Math.max(tracks.items.length, 1)) * 100));
  const artistRangeScore = Math.min(100, Math.round((uniqueTrackArtists / Math.max(artists.items.length, 1)) * 80));
  const tasteSpreadScore = Math.round((spreadScore + artistRangeScore) / 2);
  const dominantFormat = Array.from(albumTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Taste Spread</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        How broad your current rotation feels.
      </p>
      <TimeRangeSelector />

      <div style={{
        background: "#141414",
        borderRadius: 12,
        padding: "2rem",
        border: "1px solid #1f1f1f",
        textAlign: "center",
        marginBottom: "2rem",
        marginTop: "1rem"
      }}>
        <div style={{ fontSize: "3rem", fontWeight: 700, color: tasteSpreadScore > 60 ? "#1db954" : "#f59e0b" }}>
          {tasteSpreadScore}
          <span style={{ fontSize: "1.2rem", color: "#888" }}>/100</span>
        </div>
        <div style={{ color: "#888", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {tasteSpreadScore > 70 ? "Wide rotation" :
           tasteSpreadScore > 40 ? "Balanced rotation" :
           "Deep repeat mode"}
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Signal Mix</h3>
          {[
            ["Unique lead artists", uniqueLeadArtists],
            ["All credited artists", uniqueTrackArtists],
            ["Dominant release type", dominantFormat],
            ["Average track length", `${avgDurationMin} min`],
            ["Explicit tracks", `${explicitRate}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.65rem", fontSize: "0.9rem" }}>
              <span style={{ color: "#aaa" }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Top Tracks by Affinity</h3>
          {tracks.items.slice(0, 5).map((track, i) => (
            <div key={track.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", minWidth: 0 }}>
              <span style={{ color: "#888", fontSize: "0.8rem", width: 16 }}>{i + 1}</span>
              {track.album.images[0] && (
                <img src={track.album.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>{track.artists[0].name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
