import { getCurrentlyPlaying } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function formatMs(ms = 0) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default async function NowPlayingPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const current = await getCurrentlyPlaying();
  const track = current?.currently_playing_type === "track" ? current.item : null;
  const progress = track?.duration_ms && current?.progress_ms
    ? Math.min(100, Math.round((current.progress_ms / track.duration_ms) * 100))
    : 0;

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Now Playing</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Live playback metadata from Spotify&apos;s current-player endpoint.
      </p>

      <div style={{ background: "#101010", border: "1px solid #262626", borderRadius: 8, padding: "0.9rem", marginBottom: "1.5rem", color: "#aaa", fontSize: "0.85rem" }}>
        This view uses `GET /me/player/currently-playing`. It avoids preview URLs, audio analysis, audio features,
        playback control actions, and fields Spotify marks as removed or deprecated.
      </div>

      {!current || !track ? (
        <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 8, padding: "2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Nothing playing right now</h2>
          <p style={{ color: "#888" }}>Start a Spotify track and refresh this page to see the live metadata.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(180px, 260px) minmax(0, 1fr)", alignItems: "center" }}>
          {track.album.images[0] && (
            <img
              src={track.album.images[0].url}
              alt=""
              width={260}
              height={260}
              style={{ width: "100%", aspectRatio: "1", borderRadius: 8, objectFit: "cover", border: "1px solid #1f1f1f" }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: current.is_playing ? "#1db954" : "#f59e0b", fontSize: "0.85rem", marginBottom: "1rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: current.is_playing ? "#1db954" : "#f59e0b", display: "inline-block" }} />
              {current.is_playing ? "Playing" : "Paused"}
            </div>
            <h2 style={{ fontSize: "2rem", lineHeight: 1.1, marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track.name}
            </h2>
            <p style={{ color: "#aaa", marginBottom: "1.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
            <div style={{ height: 8, borderRadius: 999, background: "#1f1f1f", overflow: "hidden", marginBottom: "0.5rem" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#1db954" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
              <span>{formatMs(current.progress_ms)}</span>
              <span>{formatMs(track.duration_ms)}</span>
            </div>
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
              {[
                ["Album", track.album.name ?? "Unknown"],
                ["Release", track.album.release_date ?? "Unknown"],
                ["Explicit", track.explicit ? "Yes" : "No"],
                ["Local file", track.is_local ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 8, padding: "0.85rem", minWidth: 0 }}>
                  <div style={{ color: "#888", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{label}</div>
                  <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
