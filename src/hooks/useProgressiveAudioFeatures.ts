"use client";

import { useEffect, useState } from "react";
import { AudioFeatures, Track } from "@/lib/spotify";

export interface ProgressiveFeatures {
  features: AudioFeatures[];
  estimated: boolean;
  acousticBrainz: boolean;
  loading: boolean;
  error: string | null;
}

export function useProgressiveAudioFeatures(
  tracks: Track[],
  initialFeatures: AudioFeatures[]
): ProgressiveFeatures {
  const [data, setData] = useState<ProgressiveFeatures>({
    features: initialFeatures,
    estimated: true,
    acousticBrainz: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch("/api/audio-features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errText = await res.text().catch(() => `HTTP ${res.status}`);
          throw new Error(errText);
        }

        const json = await res.json();
        if (cancelled) return;

        setData({
          features: json.audio_features as AudioFeatures[],
          estimated: json.estimated ?? true,
          acousticBrainz: json.acousticBrainz ?? false,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("[useProgressiveAudioFeatures] failed:", err);
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.name === "AbortError"
                ? "AcousticBrainz lookup timed out. Showing estimates."
                : `AcousticBrainz error: ${err.message}`
              : "Unknown error fetching audio features.";
          setData((prev) => ({ ...prev, loading: false, error: message }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tracks]);

  return data;
}
