"use client";

import { useContainerSize } from "@/hooks/useContainerSize";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  width?: number;
  height?: number;
}

export default function BarChart({ data, width: propWidth, height: propHeight }: Props) {
  const { ref, width: measuredW, height: measuredH } = useContainerSize(2, 220);
  const width = propWidth ?? measuredW;
  const height = propHeight ?? measuredH;

  if (width === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 220, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  const padding = 36;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barSlot = chartW / data.length;
  const barWidth = barSlot * 0.65;
  const gap = barSlot * 0.35;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8, maxWidth: "100%", display: "block" }}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" />

        {data.map((d, i) => {
          const barH = (d.value / maxValue) * chartH;
          const x = padding + i * barSlot + gap / 2;
          const y = height - padding - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={d.color || "#1db954"}
                rx={3}
                opacity={0.85}
              />
              <text
                x={x + barWidth / 2}
                y={height - padding + 14}
                fill="#888"
                fontSize={Math.max(8, Math.min(10, width / 60))}
                textAnchor="middle"
              >
                {d.label}
              </text>
              {barH > 18 && (
                <text
                  x={x + barWidth / 2}
                  y={y + 12}
                  fill="#fff"
                  fontSize={Math.max(8, Math.min(10, width / 60))}
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
