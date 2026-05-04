import { getRecentlyPlayed } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarChart from "@/components/viz/BarChart";

export default async function TemporalPatternsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const recent = await getRecentlyPlayed(50);

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

  const morning = hourCounts.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoon = hourCounts.slice(12, 18).reduce((a, b) => a + b, 0);
  const evening = hourCounts.slice(18, 24).reduce((a, b) => a + b, 0);
  const night = hourCounts.slice(0, 6).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Temporal Patterns</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        When do you listen? Based on your recent 50 plays.
      </p>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Hour of Day</h3>
          <BarChart data={hourData} />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Day of Week</h3>
          <BarChart data={dayData} />
        </div>
      </div>

      <div style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        marginTop: "2rem"
      }}>
        {[
          { label: "Morning (6-12)", value: morning, color: "#f59e0b" },
          { label: "Afternoon (12-18)", value: afternoon, color: "#3b82f6" },
          { label: "Evening (18-24)", value: evening, color: "#a855f7" },
          { label: "Night (0-6)", value: night, color: "#1db954" },
        ].map((block) => (
          <div key={block.label} style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: block.color }}>{block.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{block.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
