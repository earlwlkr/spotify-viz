"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "All time" },
];

export default function TimeRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") || "medium_term";

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("range", r.value);
            router.push(`?${params.toString()}`);
          }}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: 999,
            border: "1px solid #333",
            background: current === r.value ? "#1db954" : "transparent",
            color: current === r.value ? "#000" : "#888",
            fontSize: "0.85rem",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.15s",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
