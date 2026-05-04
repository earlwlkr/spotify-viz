import { cookies } from "next/headers";
import Link from "next/link";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const isAuthed = !!cookieStore.get("spotify_access_token")?.value;

  const projects = [
    { slug: "vibe-check", name: "Vibe Check", desc: "Your listening profile at a glance" },
    { slug: "mood-weather", name: "Mood Weather", desc: "Energy vs valence of your top tracks" },
    { slug: "audio-scatter", name: "Audio Scatter", desc: "Danceability vs tempo, colored by energy" },
    { slug: "listening-calendar", name: "Listening Calendar", desc: "Last 28 days of listening activity" },
    { slug: "genre-galaxy", name: "Genre Galaxy", desc: "Genres from your top artists" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontWeight: 700 }}>
        Spotify Viz
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        A collection of data experiments.
      </p>

      {!isAuthed ? (
        <a
          href="/api/auth/spotify"
          style={{
            display: "inline-block",
            background: "#1db954",
            color: "#000",
            padding: "0.75rem 1.5rem",
            borderRadius: 999,
            fontWeight: 600,
            marginBottom: "2rem",
            transition: "opacity 0.2s",
          }}
        >
          Connect Spotify
        </a>
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#1db954",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1db954", display: "inline-block" }} />
          Connected
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={isAuthed ? `/projects/${p.slug}` : "#"}
            style={{
              display: "block",
              padding: "1.5rem",
              borderRadius: 12,
              background: "#141414",
              border: "1px solid #1f1f1f",
              opacity: isAuthed ? 1 : 0.4,
              pointerEvents: isAuthed ? "auto" : "none",
              transition: "border-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#333";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1f1f1f";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <h3 style={{ marginBottom: "0.4rem", fontWeight: 600 }}>{p.name}</h3>
            <p style={{ color: "#888", fontSize: "0.85rem", lineHeight: 1.5 }}>{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
