"use client";

interface DayData {
  date: string;
  count: number;
  label: string;
}

interface Props {
  data: DayData[];
  width?: number;
}

export default function Heatmap({ data, width = 600 }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const cellSize = Math.min(18, Math.floor((width - 60) / 7));
  const gap = 3;

  const colorForCount = (count: number) => {
    if (count === 0) return "#1a1a1a";
    const intensity = Math.min(count / maxCount, 1);
    const g = Math.floor(50 + intensity * 150);
    return `rgb(${Math.floor(intensity * 29)}, ${g}, ${Math.floor(intensity * 84)})`;
  };

  // Group by week
  const weeks: DayData[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={weeks.length * (cellSize + gap) + 40}
        height={7 * (cellSize + gap) + 30}
        style={{ background: "#0f0f0f", borderRadius: 8, padding: 12 }}
      >
        {/* Day labels */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
          <text
            key={day}
            x={4}
            y={20 + i * (cellSize + gap) + cellSize / 2 + 4}
            fill="#666"
            fontSize={10}
          >
            {day}
          </text>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <rect
              key={`${wi}-${di}`}
              x={40 + wi * (cellSize + gap)}
              y={16 + di * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={3}
              fill={colorForCount(day.count)}
            >
              <title>{`${day.date}: ${day.count} plays`}</title>
            </rect>
          ))
        )}
      </svg>
    </div>
  );
}
