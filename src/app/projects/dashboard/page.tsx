import { getTopTracks, getTopArtists, getRecentlyPlayed } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  const totalMs = recent.items.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0);
  const hours = Math.round((totalMs / 1000 / 60 / 60) * 10) / 10;
  const uniqueRecentTracks = new Set(recent.items.map((i) => i.track.id)).size;

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Your listening profile at a glance.
      </p>

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

        {/* Quick stats */}
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Quick Stats</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1db954" }}>{topTracks.items.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>Top tracks analyzed</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{topArtists.items.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>Top artists</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{hours}h</div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>Recent listening (est.)</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a855f7" }}>{uniqueRecentTracks}</div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>Unique recent tracks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
