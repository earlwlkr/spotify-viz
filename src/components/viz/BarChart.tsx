"use client";

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

export default function BarChart({ data, width = 600, height = 300 }: Props) {
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (chartW / data.length) * 0.7;
  const gap = (chartW / data.length) * 0.3;

  return (
    <svg width={width} height={height} style={{ background: "#0f0f0f", borderRadius: 8 }}>
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" />

      {data.map((d, i) => {
        const barH = (d.value / maxValue) * chartH;
        const x = padding + i * (barWidth + gap) + gap / 2;
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
              y={height - padding + 16}
              fill="#888"
              fontSize={10}
              textAnchor="middle"
            >
              {d.label}
            </text>
            {barH > 20 && (
              <text
                x={x + barWidth / 2}
                y={y + 14}
                fill="#fff"
                fontSize={10}
                textAnchor="middle"
              >
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
