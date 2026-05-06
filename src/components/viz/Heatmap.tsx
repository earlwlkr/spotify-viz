"use client";

import { useContainerSize } from "@/hooks/useContainerSize";

interface DayData {
  date: string;
  count: number;
  label: string;
}

interface Props {
  data: DayData[];
  width?: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayOfWeek(isoDate: string): number {
  return new Date(isoDate + "T00:00:00").getDay();
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function Heatmap({ data, width: propWidth }: Props) {
  const { ref, width: measuredW } = useContainerSize(4, 180);
  const containerWidth = propWidth ?? measuredW;

  if (containerWidth === 0 || data.length === 0) {
    return <div ref={ref} style={{ width: "100%", height: 180, background: "#0f0f0f", borderRadius: 8 }} />;
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const gap = 3;
  const labelWidth = 38;
  const availableW = Math.max(containerWidth - labelWidth - 16, 0);

  const counts = new Map(data.map((d) => [d.date, d.count]));

  // Find actual date range
  const dates = data.map((d) => d.date).sort();
  const earliest = new Date(dates[0] + "T00:00:00");
  const latest = new Date(dates[dates.length - 1] + "T00:00:00");

  // Build a Monday-start calendar grid covering the full weeks
  const startMonday = getMondayOfWeek(earliest);
  const endMonday = getMondayOfWeek(latest);
  const totalWeeks =
    Math.round((endMonday.getTime() - startMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const cellSize = Math.max(10, Math.min(18, Math.floor((availableW - (totalWeeks - 1) * gap) / totalWeeks)));
  const svgWidth = labelWidth + totalWeeks * (cellSize + gap) + 12;
  const svgHeight = 7 * (cellSize + gap) + 24;

  const grid: { date: string; count: number; outOfRange: boolean }[][] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const weekMonday = addDays(startMonday, w * 7);
    const week: { date: string; count: number; outOfRange: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = addDays(weekMonday, d);
      const iso = formatISO(dayDate);
      const inRange = dayDate >= earliest && dayDate <= latest;
      week.push({
        date: iso,
        count: counts.get(iso) || 0,
        outOfRange: !inRange,
      });
    }
    grid.push(week);
  }

  const colorForCount = (count: number, outOfRange: boolean) => {
    if (outOfRange) return "#0f0f0f";
    if (count === 0) return "#1a1a1a";
    const intensity = Math.min(count / maxCount, 1);
    const g = Math.floor(50 + intensity * 150);
    return `rgb(${Math.floor(intensity * 29)}, ${g}, ${Math.floor(intensity * 84)})`;
  };

  return (
    <div ref={ref} style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ background: "#0f0f0f", borderRadius: 8, padding: 10, display: "inline-block" }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: "block" }}
        >
          {/* Day labels */}
          {DAY_LABELS.map((day, i) => (
            <text
              key={day}
              x={2}
              y={18 + i * (cellSize + gap) + cellSize / 2 + 3}
              fill="#666"
              fontSize={10}
            >
              {day}
            </text>
          ))}

          {grid.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                x={labelWidth + wi * (cellSize + gap)}
                y={14 + di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={colorForCount(day.count, day.outOfRange)}
                opacity={day.outOfRange ? 0.2 : 1}
              >
                <title>{day.outOfRange ? day.date : `${day.date}: ${day.count} plays`}</title>
              </rect>
            ))
          )}
        </svg>
      </div>
    </div>
  );
}
