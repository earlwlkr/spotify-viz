import { getRecentlyPlayed } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Heatmap from "@/components/viz/Heatmap";

export default async function ListeningCalendarPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  // Compute the date 28 days ago so pagination knows when to stop
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - 27);
  const minDateIso = minDate.toISOString().slice(0, 10);

  const recent = await getRecentlyPlayed(50, minDateIso);

  const counts = new Map<string, number>();
  for (const item of recent.items) {
    const date = item.played_at.slice(0, 10);
    counts.set(date, (counts.get(date) || 0) + 1);
  }

  const data = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    data.push({
      date: iso,
      count: counts.get(iso) || 0,
      label: iso,
    });
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Listening Calendar</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        Last 28 days of listening activity.
      </p>
      <Heatmap data={data} />
    </div>
  );
}
