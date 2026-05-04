"use client";

import { useState } from "react";
import { useContainerSize } from "@/hooks/useContainerSize";

interface Point {
  x: number;
  y: number;
  label: string;
  color?: string;
}

interface Props {
  data: Point[];
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

export default function ScatterPlot({
  data,
  xLabel = "x",
  yLabel = "y",
  width: propWidth,
  height: propHeight,
}: Props) {
  const [hovered, setHovered] = useState<Point | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { ref, width: measuredW, height: measuredH } = useContainerSize(1.5, 240);

  const width = propWidth ?? measuredW;
  const height = propHeight ?? measuredH;

  if (width === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 240, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  const padding = 48;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const scaleX = (v: number) =>
    padding + ((v - minX) / (maxX - minX || 1)) * chartW;
  const scaleY = (v: number) =>
    height - padding - ((v - minY) / (maxY - minY || 1)) * chartH;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <svg
        width={width}
        height={height}
        style={{ background: "#0f0f0f", borderRadius: 8, maxWidth: "100%", display: "block" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#333"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#333"
        />
        <text x={width / 2} y={height - 8} fill="#888" fontSize={12} textAnchor="middle">
          {xLabel}
        </text>
        <text
          x={16}
          y={height / 2}
          fill="#888"
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90, 16, ${height / 2})`}
        >
          {yLabel}
        </text>

        {data.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(d.x)}
            cy={scaleY(d.y)}
            r={hovered?.label === d.label ? 7 : 5}
            fill={d.color || "#1db954"}
            opacity={hovered && hovered.label !== d.label ? 0.3 : 0.85}
            style={{ cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={() => setHovered(d)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {hovered && (
        <div
          style={{
            position: "absolute",
            left: mousePos.x + 12,
            top: mousePos.y - 12,
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 12,
            color: "#e5e5e5",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {hovered.label}
        </div>
      )}
    </div>
  );
}
