import { getTopTracks, getTopArtists } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function HipsterScorePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("spotify_access_token")?.value) {
    redirect("/");
  }

  const { range } = await searchParams;
  const timeRange = (range as "short_term" | "medium_term" | "long_term") || "medium_term";

  const [tracks, artists] = await Promise.all([
    getTopTracks(timeRange, 50),
    getTopArtists(timeRange, 50),
  ]);

  const trackPops = tracks.items.map((t) => t.popularity ?? 0);
  const artistPops = artists.items.map((a) => a.popularity ?? 0);
  const avgTrackPop = trackPops.reduce((a, b) => a + b, 0) / trackPops.length;
  const avgArtistPop = artistPops.reduce((a, b) => a + b, 0) / artistPops.length;
  const hipsterScore = Math.round((1 - (avgTrackPop + avgArtistPop) / 200) * 100);

  const sortedTracks = [...tracks.items].sort((a, b) => (a.popularity ?? 0) - (b.popularity ?? 0));
  const sortedArtists = [...artists.items].sort((a, b) => (a.popularity ?? 0) - (b.popularity ?? 0));

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Hipster Score</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Mainstream vs underground. Lower popularity = higher hipster score.
      </p>
      <TimeRangeSelector />

      <div style={{
        background: "#141414",
        borderRadius: 12,
        padding: "2rem",
        border: "1px solid #1f1f1f",
        textAlign: "center",
        marginBottom: "2rem",
        marginTop: "1rem"
      }}>
        <div style={{ fontSize: "3rem", fontWeight: 700, color: hipsterScore > 50 ? "#1db954" : "#f59e0b" }}>
          {hipsterScore}
          <span style={{ fontSize: "1.2rem", color: "#888" }}>/100</span>
        </div>
        <div style={{ color: "#888", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {hipsterScore > 70 ? "Certified obscurist" :
           hipsterScore > 40 ? "Balanced taste" :
           "Top 40 enthusiast"}
        </div>
      </div>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Most Obscure Tracks</h3>
          {sortedTracks.slice(0, 5).map((track, i) => (
            <div key={track.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "#888", fontSize: "0.8rem", width: 16 }}>{i + 1}</span>
              {track.album.images[0] && (
                <img src={track.album.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>{track.artists[0].name}</div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#1db954", fontWeight: 500 }}>{track.popularity}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#141414", borderRadius: 12, padding: "1.25rem", border: "1px solid #1f1f1f" }}>
          <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>Most Mainstream Tracks</h3>
          {sortedTracks.slice(-5).reverse().map((track, i) => (
            <div key={track.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ color: "#888", fontSize: "0.8rem", width: 16 }}>{i + 1}</span>
              {track.album.images[0] && (
                <img src={track.album.images[0].url} alt="" width={36} height={36} style={{ borderRadius: 4, objectFit: "cover" }} />
              )}
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>{track.artists[0].name}</div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 500 }}>{track.popularity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
