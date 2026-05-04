"use client";

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

export default function BubblePack({ data, width = 600, height = 400 }: Props) {
  // Simple circle packing: sort by size, place greedily
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sorted.map((d) => d.value), 1);

  const bubbles = sorted.map((d, i) => {
    const baseRadius = 15 + (d.value / maxValue) * 50;
    const angle = (i / sorted.length) * Math.PI * 2;
    const dist = Math.min(width, height) * 0.15 + (i % 3) * 40;
    const x = width / 2 + Math.cos(angle) * dist;
    const y = height / 2 + Math.sin(angle) * dist;
    return { ...d, x, y, r: baseRadius };
  });

  return (
    <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8 }}>
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} opacity={0.75} stroke="#222" strokeWidth={1}>
            <title>{`${b.label}: ${b.value} artists`}</title>
          </circle>
          {b.r > 20 && (
            <text
              x={b.x}
              y={b.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#e5e5e5"
              fontSize={Math.max(10, b.r / 3)}
              style={{ pointerEvents: "none" }}
            >
              {b.label.length > b.r / 3 ? b.label.slice(0, Math.floor(b.r / 3)) + "…" : b.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
