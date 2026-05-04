"use client";

interface Props {
  label: string;
  value: number; // 0-1
  color?: string;
}

export default function BarMeter({ label, value, color = "#1db954" }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
        <span style={{ color: "#888" }}>{label}</span>
        <span style={{ color: "#e5e5e5", fontWeight: 500 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
