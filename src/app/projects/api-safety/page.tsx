import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const supported = [
  ["Top items", "GET /me/top/{type}", "Endpoint is supported; avoid deprecated response fields like artist genres and popularity."],
  ["Recently played", "GET /me/player/recently-played", "Supported for tracks, useful for calendar and habit views."],
  ["Saved tracks", "GET /me/tracks", "Supported, but nested track objects may still contain deprecated fields. Use added_at, album, artists, duration, explicit, and release dates."],
  ["Saved albums", "GET /me/albums", "Supported for library timelines and release-year analysis."],
  ["Current playlists", "GET /me/playlists", "Supported for playlists owned or followed by the current user."],
  ["Playlist items", "GET /playlists/{id}/items", "Use this newer route. Item contents are limited to owned or collaborative playlists."],
  ["Now playing", "GET /me/player/currently-playing", "Supported for live metadata; avoid preview URLs and content synchronization features."],
  ["Library actions", "PUT/DELETE /me/library", "Use these generic URI-based endpoints instead of old save/follow/remove routes."],
  ["Saved checks", "GET /me/library/contains", "Use this generic URI-based endpoint instead of type-specific contains routes."],
];

const avoid = [
  "GET /recommendations",
  "GET /audio-features",
  "GET /audio-analysis",
  "Related artists",
  "Featured playlists and category playlists",
  "30-second preview URLs",
  "GET /playlists/{id}/tracks",
  "POST/PUT/DELETE playlist /tracks routes",
  "Batch metadata endpoints such as GET /tracks?ids=...",
  "Type-specific save/remove/follow/contains endpoints such as /me/tracks/contains or /me/following",
  "Removed response fields such as track popularity, artist popularity, available_markets, linked_from, user country, user product, and user email",
];

export default async function ApiSafetyPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>API Safety</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        A local checklist for keeping these Spotify visualizations away from deprecated endpoints and fields.
      </p>

      <div style={{ background: "#101010", border: "1px solid #262626", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem", color: "#aaa", fontSize: "0.9rem" }}>
        Important nuance: an endpoint can be supported while individual fields in its response are deprecated or removed.
        New visualizations should check both the route and the fields they rely on.
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Good Building Blocks</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {supported.map(([name, endpoint, note]) => (
              <div key={endpoint} style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 8, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.4rem" }}>
                  <strong>{name}</strong>
                  <code style={{ color: "#1db954", fontSize: "0.78rem", textAlign: "right" }}>{endpoint}</code>
                </div>
                <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.5 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Avoid</h2>
          <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 8, padding: "1rem" }}>
            {avoid.map((item) => (
              <div key={item} style={{ display: "flex", gap: "0.65rem", marginBottom: "0.75rem", color: "#ddd", fontSize: "0.9rem" }}>
                <span style={{ color: "#ef4444" }}>x</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
