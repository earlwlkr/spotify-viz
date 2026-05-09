import { getSavedAlbums, getSavedTracks } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarChart from "@/components/viz/BarChart";

function byMonth(iso: string) {
  return iso.slice(0, 7);
}

function byReleaseYear(date?: string) {
  return date?.slice(0, 4) || "Unknown";
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

export default async function LibraryTimelinePage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const [savedTracks, savedAlbums] = await Promise.all([
    getSavedTracks(50, 4),
    getSavedAlbums(50, 3),
  ]);

  const trackAddsByMonth = new Map<string, number>();
  const releaseYears = new Map<string, number>();
  const albumTypes = new Map<string, number>();

  for (const item of savedTracks.items) {
    increment(trackAddsByMonth, byMonth(item.added_at));
    increment(releaseYears, byReleaseYear(item.track?.album.release_date));
  }

  for (const item of savedAlbums.items) {
    increment(albumTypes, item.album.album_type);
    increment(releaseYears, byReleaseYear(item.album.release_date));
  }

  const monthData = Array.from(trackAddsByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([label, value]) => ({ label: label.slice(5), value, color: "#1db954" }));

  const releaseData = Array.from(releaseYears.entries())
    .filter(([year]) => year !== "Unknown")
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(-12)
    .map(([label, value]) => ({ label, value, color: "#3b82f6" }));

  const albumTypeRows = Array.from(albumTypes.entries()).sort((a, b) => b[1] - a[1]);
  const newestTracks = savedTracks.items.slice(0, 6).filter((item) => item.track);

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Library Timeline</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>
        How your saved music collection has grown.
      </p>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: "2rem" }}>
        {[
          ["Saved tracks scanned", savedTracks.items.length],
          ["Saved albums scanned", savedAlbums.items.length],
          ["Add months", trackAddsByMonth.size],
          ["Release years", releaseYears.size],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#141414", borderRadius: 8, padding: "1rem", border: "1px solid #1f1f1f" }}>
            <div style={{ color: "#1db954", fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
            <div style={{ color: "#888", fontSize: "0.8rem" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Saved Tracks by Month</h3>
          <BarChart data={monthData} />
        </div>
        <div>
          <h3 style={{ marginBottom: "0.75rem", fontWeight: 600, fontSize: "1rem" }}>Release Years in Library</h3>
          <BarChart data={releaseData} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div style={{ background: "#141414", borderRadius: 8, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Album Formats</h3>
          {albumTypeRows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ textTransform: "capitalize" }}>{label}</span>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#141414", borderRadius: 8, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Newest Saved Tracks</h3>
          {newestTracks.map((item) => item.track && (
            <div key={`${item.added_at}-${item.track.id}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", minWidth: 0 }}>
              {item.track.album.images[0] && (
                <img src={item.track.album.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.track.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>{item.added_at.slice(0, 10)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
