import { getTopTracks, getRecommendations } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DiscoveryRoulettePage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const top = await getTopTracks("short_term", 5);
  const seedIds = top.items.map((t) => t.id);
  const recs = await getRecommendations(seedIds, 20);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Discovery Roulette</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Recommendations seeded from your current top tracks.
      </p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {recs.tracks.map((track) => (
          <div
            key={track.id}
            style={{
              background: "#141414",
              borderRadius: 12,
              padding: "1rem",
              border: "1px solid #1f1f1f",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#333"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1f1f1f"; }}
          >
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt=""
                width={56}
                height={56}
                style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
              />
            )}
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {track.name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {track.artists.map((a) => a.name).join(", ")}
              </div>
              {track.preview_url && (
                <audio controls style={{ width: "100%", height: 28, marginTop: "0.4rem" }}>
                  <source src={track.preview_url} type="audio/mpeg" />
                </audio>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
