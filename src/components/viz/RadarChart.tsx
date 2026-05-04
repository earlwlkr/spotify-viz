"use client";

interface RadarData {
  label: string;
  value: number; // 0-1
}

interface Props {
  data: RadarData[];
  width?: number;
  height?: number;
}

export default function RadarChart({ data, width = 360, height = 360 }: Props) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 40;
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
    <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8 }}>
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
            fontSize={11}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
