import { getRecentlyPlayed, getAudioFeatures } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TimelineChart from "@/components/viz/TimelineChart";

export default async function MoodJourneyPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const recent = await getRecentlyPlayed(50);
  const features = await getAudioFeatures(recent.items.map((i) => i.track));

  const valid = recent.items
    .map((item, i) => ({
      track: item.track,
      playedAt: item.played_at,
      features: features.audio_features[i],
    }))
    .filter((d) => d.features);

  const energyPoints = valid.map((d, i) => ({
    x: i,
    y: d.features!.energy,
    label: `${d.track.name} — ${d.track.artists[0].name}`,
  }));

  const valencePoints = valid.map((d, i) => ({
    x: i,
    y: d.features!.valence,
    label: `${d.track.name} — ${d.track.artists[0].name}`,
  }));

  const totalDuration = valid.reduce((sum, d) => sum + (d.track.duration_ms || 0), 0);
  const hours = Math.round((totalDuration / 1000 / 60 / 60) * 10) / 10;

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Mood Journey</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Your last {valid.length} plays, plotted by energy and valence over time.
      </p>

      <div style={{ display: "grid", gap: "2rem", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Energy Arc</h3>
          <TimelineChart data={energyPoints} xLabel="Play order" yLabel="Energy" />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Valence Arc</h3>
          <TimelineChart data={valencePoints} xLabel="Play order" yLabel="Valence" />
        </div>
      </div>

      <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
        <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Recent Session</h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1db954" }}>{valid.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>Tracks analyzed</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{hours}h</div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>Total listening</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>
              {Math.round(energyPoints.reduce((a, b) => a + b.y, 0) / energyPoints.length * 100)}%
            </div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>Avg energy</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a855f7" }}>
              {Math.round(valencePoints.reduce((a, b) => a + b.y, 0) / valencePoints.length * 100)}%
            </div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>Avg valence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
