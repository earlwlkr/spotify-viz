import { getTopTracks, getAudioFeatures } from "@/lib/spotify";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RadarChart from "@/components/viz/RadarChart";
import TimeRangeSelector from "@/components/TimeRangeSelector";

export default async function SonicSignaturePage({
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

  const top = await getTopTracks(timeRange, 50);
  const features = await getAudioFeatures(top.items);

  const valid = features.audio_features.filter(Boolean) as NonNullable<typeof features.audio_features[0]>[];
  const avg = (key: keyof typeof valid[0]) =>
    valid.reduce((sum, f) => sum + (f[key] as number), 0) / valid.length;

  const radarData = [
    { label: "Energy", value: avg("energy") },
    { label: "Valence", value: avg("valence") },
    { label: "Danceability", value: avg("danceability") },
    { label: "Acousticness", value: avg("acousticness") },
    { label: "Instrumentalness", value: avg("instrumentalness") },
    { label: "Tempo", value: Math.max(0, Math.min(1, (avg("tempo") - 40) / 180)) },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 700 }}>Sonic Signature</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>
        Your average audio profile across 6 dimensions.
      </p>
      <TimeRangeSelector />
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <RadarChart data={radarData} />
        <div style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
          {radarData.map((d) => (
            <div key={d.label} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "#888" }}>{d.label}</span>
                <span style={{ color: "#e5e5e5", fontWeight: 500 }}>{Math.round(d.value * 100)}%</span>
              </div>
              <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${d.value * 100}%`, height: "100%", background: "#1db954", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
