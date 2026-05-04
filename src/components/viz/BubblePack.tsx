"use client";

import { useContainerSize } from "@/hooks/useContainerSize";

interface Bubble {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Bubble[];
  width?: number;
  height?: number;
}

export default function BubblePack({ data, width: propWidth, height: propHeight }: Props) {
  const { ref, width: measuredW, height: measuredH } = useContainerSize(1.5, 260);
  const width = propWidth ?? measuredW;
  const height = propHeight ?? measuredH;

  if (width === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 260, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  // Simple circle packing: sort by size, place greedily
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sorted.map((d) => d.value), 1);

  const bubbles = sorted.map((d, i) => {
    const baseRadius = Math.max(12, 15 + (d.value / maxValue) * Math.min(width, height) * 0.12);
    const angle = (i / sorted.length) * Math.PI * 2;
    const dist = Math.min(width, height) * 0.15 + (i % 3) * Math.min(width, height) * 0.08;
    const x = width / 2 + Math.cos(angle) * dist;
    const y = height / 2 + Math.sin(angle) * dist;
    return { ...d, x, y, r: baseRadius };
  });

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8, maxWidth: "100%", display: "block" }}>
        {bubbles.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity={0.75} stroke="#222" strokeWidth={1}>
              <title>{`${b.label}: ${b.value} artists`}</title>
            </circle>
            {b.r > 16 && (
              <text
                x={b.x}
                y={b.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#e5e5e5"
                fontSize={Math.max(9, Math.min(14, b.r / 2.5))}
                style={{ pointerEvents: "none" }}
              >
                {b.label.length > b.r / 2.5 ? b.label.slice(0, Math.floor(b.r / 2.5)) + "…" : b.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
