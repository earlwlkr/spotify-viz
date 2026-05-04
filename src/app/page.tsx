import { cookies } from "next/headers";
import ProjectCard from "@/components/ProjectCard";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const isAuthed = !!cookieStore.get("spotify_access_token")?.value;

  const projects = [
    { slug: "vibe-check", name: "Vibe Check", desc: "Your listening profile at a glance" },
    { slug: "mood-weather", name: "Mood Weather", desc: "Energy vs valence of your top tracks" },
    { slug: "audio-scatter", name: "Audio Scatter", desc: "Danceability vs tempo, colored by energy" },
    { slug: "listening-calendar", name: "Listening Calendar", desc: "Last 28 days of listening activity" },
    { slug: "genre-galaxy", name: "Genre Galaxy", desc: "Genres from your top artists" },
    { slug: "sonic-signature", name: "Sonic Signature", desc: "Your 6-dimensional audio profile" },
    { slug: "temporal-patterns", name: "Temporal Patterns", desc: "When do you listen? Hour & day breakdown" },
    { slug: "hipster-score", name: "Hipster Score", desc: "Mainstream vs underground analysis" },
    { slug: "mood-journey", name: "Mood Journey", desc: "Energy & valence arc of recent plays" },
    { slug: "genre-evolution", name: "Genre Evolution", desc: "How your taste shifts over time" },
    { slug: "discovery-roulette", name: "Discovery Roulette", desc: "Recommendations from your top tracks" },
    { slug: "listening-efficiency", name: "Listening Efficiency", desc: "Deep dive stats on your habits" },
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
          <ProjectCard
            key={p.slug}
            href={isAuthed ? `/projects/${p.slug}` : "#"}
            name={p.name}
            desc={p.desc}
            disabled={!isAuthed}
          />
        ))}
      </div>
    </div>
  );
}
