"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

export function MonitorList({
  initialMonitors,
}: {
  initialMonitors: any[];
}) {
  if (initialMonitors.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <div className="font-mono text-sm text-muted mb-4">
          [ 0 endpoints tracked ]
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          No monitors configured
        </h3>
        <p className="text-sm text-muted max-w-sm mb-6">
          Get started by adding an endpoint to monitor its uptime and response latency.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-12 border-b border-border bg-background px-5 py-3 hidden md:grid">
        <div className="col-span-1 text-xs font-semibold text-muted">
          Status
        </div>
        <div className="col-span-4 text-xs font-semibold text-muted">
          Endpoint
        </div>
        <div className="col-span-2 text-xs font-semibold text-muted">
          Uptime 24h
        </div>
        <div className="col-span-1 text-xs font-semibold text-muted">
          Avg ms
        </div>
        <div className="col-span-4 text-xs font-semibold text-muted">
          Latency history
        </div>
      </div>

      {initialMonitors.map((monitor, idx) => {
        const pings = monitor.pings || [];
        const lastPing = pings.length > 0 ? pings[pings.length - 1] : null;
        const isUp = lastPing ? lastPing.is_success : true;
        const avgLatency =
          pings.length > 0
            ? Math.round(
                pings.reduce(
                  (acc: number, curr: any) => acc + curr.latency_ms,
                  0
                ) / pings.length
              )
            : 0;

        return (
          <motion.div
            key={monitor.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.04 }}
            className={`grid grid-cols-12 items-center ${
              idx < initialMonitors.length - 1
                ? "border-b border-border"
                : ""
            } hover:bg-background/50 transition-colors`}
          >
            {/* Status dot */}
            <div className="col-span-1 flex items-center justify-center py-4">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  lastPing === null
                    ? "bg-[#8b949e]"
                    : isUp
                    ? "bg-success"
                    : "bg-danger"
                }`}
              />
            </div>

            {/* Name + URL */}
            <div className="col-span-7 md:col-span-4 px-3 py-4">
              <div className="font-semibold text-sm text-foreground mb-0.5">
                {monitor.name}
              </div>
              <div className="text-xs text-muted truncate font-mono">
                {monitor.url}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
                <span className="font-medium bg-[#30363d] px-1.5 py-0.5 rounded text-foreground">{monitor.method}</span>
                <span>every {monitor.interval_minutes}m</span>
              </div>
            </div>

            {/* Uptime 24h */}
            <div className="hidden md:flex col-span-2 px-3 py-4 flex-col">
              <div
                className={`text-lg font-bold tracking-tight ${
                  monitor.uptime24h === null
                    ? "text-muted"
                    : Number(monitor.uptime24h) >= 99
                    ? "text-success"
                    : Number(monitor.uptime24h) >= 95
                    ? "text-[#d29922]"
                    : "text-danger"
                }`}
              >
                {monitor.uptime24h !== null ? `${monitor.uptime24h}%` : "—"}
              </div>
              <div className="text-[11px] text-muted mt-0.5">
                {pings.length} pings
              </div>
            </div>

            {/* Avg latency */}
            <div className="hidden md:flex col-span-1 px-3 py-4">
              <div className="text-sm font-medium text-[#c9d1d9]">
                {avgLatency > 0 ? `${avgLatency}ms` : "—"}
              </div>
            </div>

            {/* Chart */}
            <div className="col-span-4 px-4 py-3 flex items-center">
              {pings.length > 1 ? (
                <ResponsiveContainer width="100%" height={48}>
                  <AreaChart data={pings}>
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
                          stopColor={isUp ? "#3fb950" : "#f85149"}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor={isUp ? "#3fb950" : "#f85149"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={["auto", "auto"]} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161b22",
                        border: "1px solid #30363d",
                        fontSize: "12px",
                        color: "#e6edf3",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                      itemStyle={{ color: "#e6edf3" }}
                      formatter={(v: number) => [`${v}ms`, "Latency"]}
                      labelFormatter={() => ""}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency_ms"
                      stroke={isUp ? "#3fb950" : "#f85149"}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill={`url(#g-${monitor.id})`}
                      isAnimationActive={false}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full text-center text-xs text-muted">
                  Awaiting data
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

