"use client";

import { useContainerSize } from "@/hooks/useContainerSize";

interface RadarData {
  label: string;
  value: number; // 0-1
}

interface Props {
  data: RadarData[];
  width?: number;
  height?: number;
}

export default function RadarChart({ data, width: propWidth, height: propHeight }: Props) {
  const { ref, width: measuredW, height: measuredH } = useContainerSize(1, 280);
  const width = propWidth ?? measuredW;
  const height = propHeight ?? measuredH;

  if (width === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 280, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 36;
  const levels = 5;

  const angleForIndex = (i: number) => (Math.PI * 2 * i) / data.length - Math.PI / 2;

  const pointFor = (value: number, i: number) => {
    const angle = angleForIndex(i);
    const r = value * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  };

  const gridPolygons = [];
  for (let level = 1; level <= levels; level++) {
    const pts = data.map((_, i) => {
      const p = pointFor(level / levels, i);
      return `${p.x},${p.y}`;
    }).join(" ");
    gridPolygons.push(pts);
  }

  const dataPoints = data.map((d, i) => pointFor(d.value, i));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8, maxWidth: "100%", display: "block" }}>
        {/* Grid */}
        {gridPolygons.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#222" strokeWidth={1} />
        ))}

        {/* Axes */}
        {data.map((d, i) => {
          const end = pointFor(1, i);
          return (
            <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#222" strokeWidth={1} />
          );
        })}

        {/* Data area */}
        <polygon points={dataPolygon} fill="rgba(29, 185, 84, 0.2)" stroke="#1db954" strokeWidth={2} />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1db954" />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const pos = pointFor(1.18, i);
          return (
            <text
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              fill="#888"
              fontSize={Math.max(10, Math.min(12, width / 30))}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
