"use client";

import { useContainerSize } from "@/hooks/useContainerSize";

interface LinePoint {
  x: number;
  y: number;
  label: string;
}

interface Props {
  data: LinePoint[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

export default function TimelineChart({ data, xLabel = "Time", yLabel = "Value", width: propWidth, height: propHeight }: Props) {
  const { ref, width: measuredW, height: measuredH } = useContainerSize(2.2, 220);
  const width = propWidth ?? measuredW;
  const height = propHeight ?? measuredH;

  if (width === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 220, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scaleX = (v: number) => padding + ((v - minX) / (maxX - minX || 1)) * chartW;
  const scaleY = (v: number) => height - padding - ((v - minY) / (maxY - minY || 1)) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(d.x)} ${scaleY(d.y)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${scaleX(data[data.length - 1].x)} ${height - padding} L ${scaleX(data[0].x)} ${height - padding} Z`;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8, maxWidth: "100%", display: "block" }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" />
        <text x={width / 2} y={height - 8} fill="#888" fontSize={12} textAnchor="middle">
          {xLabel}
        </text>
        <text
          x={14}
          y={height / 2}
          fill="#888"
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${height / 2})`}
        >
          {yLabel}
        </text>

        <path d={areaD} fill="rgba(29, 185, 84, 0.15)" />
        <path d={pathD} fill="none" stroke="#1db954" strokeWidth={2} />

        {data.map((d, i) => (
          <circle key={i} cx={scaleX(d.x)} cy={scaleY(d.y)} r={3} fill="#1db954" />
        ))}
      </svg>
    </div>
  );
}
