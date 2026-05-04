import { NextRequest, NextResponse } from "next/server";
import { getAcousticBrainzFeatures } from "@/lib/acousticbrainz";
import { Track } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const tracks = body.tracks as Track[];

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: "Missing tracks" }, { status: 400 });
    }

    console.log(`[api/audio-features] enriching ${tracks.length} tracks…`);
    const result = await getAcousticBrainzFeatures(tracks);
    const elapsed = Date.now() - start;

    console.log(
      `[api/audio-features] done in ${elapsed}ms. ABZ hits: ${
        result.acousticBrainzUsed ? "yes" : "no"
      }`
    );

    return NextResponse.json({
      audio_features: result.features,
      estimated: true,
      acousticBrainz: result.acousticBrainzUsed,
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[api/audio-features] failed after ${elapsed}ms:`, err);
    return NextResponse.json(
      { error: "Failed to fetch audio features", details: String(err) },
      { status: 500 }
    );
  }
}
