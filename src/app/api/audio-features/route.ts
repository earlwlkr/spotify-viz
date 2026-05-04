import { NextRequest, NextResponse } from "next/server";
import { generateEstimatedFeatures, getAcousticBrainzFeatures } from "@/lib/acousticbrainz";
import { Track } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const start = Date.now();

  let tracks: Track[] = [];
  try {
    const body = await req.json();
    tracks = body.tracks as Track[];

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: "Missing tracks" }, { status: 400 });
    }

    // Hard 12 s server-side deadline so we always beat the client 15 s abort.
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 8000);

    console.log(`[api/audio-features] enriching ${tracks.length} tracks…`);
    let result;
    try {
      result = await getAcousticBrainzFeatures(tracks, controller.signal);
    } catch (inner) {
      clearTimeout(deadline);
      throw inner;
    }
    clearTimeout(deadline);

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

    // If we hit the 12 s deadline, return estimates instead of a 500/timeout.
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`[api/audio-features] hit ${elapsed}ms deadline, returning estimates`);
      return NextResponse.json({
        audio_features: tracks.map((t) => generateEstimatedFeatures(t)),
        estimated: true,
        acousticBrainz: false,
      });
    }

    console.error(`[api/audio-features] failed after ${elapsed}ms:`, err);
    return NextResponse.json(
      { error: "Failed to fetch audio features", details: String(err) },
      { status: 500 }
    );
  }
}
