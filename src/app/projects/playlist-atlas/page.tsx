import { getCurrentUserPlaylists, getCurrentUserProfile, getPlaylistItems } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarChart from "@/components/viz/BarChart";

function minutes(ms: number) {
  return Math.round(ms / 60000);
}

export default async function PlaylistAtlasPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const [profile, playlists] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentUserPlaylists(50, 2),
  ]);

  const ownOrCollaborative = playlists.items.filter(
    (playlist) => playlist.owner.id === profile.id || playlist.collaborative
  );
  const sampled = ownOrCollaborative.slice(0, 6);
  const playlistDetails = await Promise.all(
    sampled.map(async (playlist) => {
      try {
        const items = await getPlaylistItems(playlist.id, 50);
        const tracks = items.items
          .map((item) => item.item)
          .filter((item) => item?.id) ?? [];
        const duration = tracks.reduce((sum, track) => sum + (track?.duration_ms || 0), 0);
        const explicit = tracks.filter((track) => track?.explicit).length;
        return {
          playlist,
          trackCount: tracks.length,
          duration,
          explicit,
          unavailable: false,
        };
      } catch {
        return {
          playlist,
          trackCount: 0,
          duration: 0,
          explicit: 0,
          unavailable: true,
        };
      }
    })
  );

  const sizeData = playlistDetails.map(({ playlist, trackCount }) => ({
    label: playlist.name.length > 10 ? `${playlist.name.slice(0, 9)}...` : playlist.name,
    value: trackCount,
    color: "#1db954",
  }));

  const publicCount = playlists.items.filter((playlist) => playlist.public).length;
  const privateCount = playlists.items.filter((playlist) => playlist.public === false).length;
  const collaborativeCount = playlists.items.filter((playlist) => playlist.collaborative).length;

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Playlist Atlas</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        A map of your own and collaborative playlists.
      </p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: "2rem" }}>
        {[
          ["Playlists scanned", playlists.items.length],
          ["Item-readable", ownOrCollaborative.length],
          ["Public", publicCount],
          ["Private", privateCount],
          ["Collaborative", collaborativeCount],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#141414", borderRadius: 8, padding: "1rem", border: "1px solid #1f1f1f" }}>
            <div style={{ color: "#1db954", fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
            <div style={{ color: "#888", fontSize: "0.8rem" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Sampled Playlist Sizes</h3>
        <BarChart data={sizeData} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {playlistDetails.map(({ playlist, trackCount, duration, explicit, unavailable }) => (
          <div key={playlist.id} style={{ background: "#141414", borderRadius: 8, padding: "1rem", border: "1px solid #1f1f1f" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem", minWidth: 0 }}>
              {playlist.images[0] && (
                <img src={playlist.images[0].url} alt="" width={44} height={44} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playlist.name}</div>
                <div style={{ color: "#888", fontSize: "0.75rem" }}>{playlist.public ? "Public" : "Private"} playlist</div>
              </div>
            </div>
            {unavailable ? (
              <p style={{ color: "#888", fontSize: "0.85rem" }}>Items unavailable for this playlist.</p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#aaa" }}>Tracks sampled</span>
                  <span>{trackCount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                  <span style={{ color: "#aaa" }}>Minutes sampled</span>
                  <span>{minutes(duration)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "#aaa" }}>Explicit tracks</span>
                  <span>{explicit}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
