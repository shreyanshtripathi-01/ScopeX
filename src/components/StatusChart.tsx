"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";

export function StatusChart({ monitor }: { monitor: any }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={monitor.chartPings}>
        <defs>
          <linearGradient
            id={`g-${monitor.id}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={monitor.isUp ? "#3fb950" : "#f85149"}
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor={monitor.isUp ? "#3fb950" : "#f85149"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <YAxis domain={["auto", "auto"]} hide />
        <Area
          type="monotone"
          dataKey="latency_ms"
          stroke={monitor.isUp ? "#3fb950" : "#f85149"}
          strokeWidth={1.5}
          fillOpacity={1}
          fill={`url(#g-${monitor.id})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
