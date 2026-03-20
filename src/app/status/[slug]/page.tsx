import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

export const revalidate = 0;

export default async function PublicStatusPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  // Find the status page by slug
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("*, status_page_monitors(monitor_id)")
    .eq("slug", params.slug)
    .single();

  if (!statusPage) {
    notFound();
  }

  const monitorIds = (statusPage.status_page_monitors || []).map(
    (m: any) => m.monitor_id
  );

  let allMonitors: any[] = [];
  if (monitorIds.length > 0) {
    const { data: monitors } = await supabase
      .from("monitors")
      .select("id, name, url, pings(id, is_success, latency_ms, created_at), incidents(id, resolved_at, created_at)")
      .in("id", monitorIds);
    allMonitors = monitors || [];
  }

  // Calculate stats
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let globalUp = true;
  let totalPings = 0;
  let successPings = 0;

  const processedMonitors = allMonitors.map((monitor) => {
    const pings = (monitor.pings || [])
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    
    const recentPings = pings.filter((p: any) => p.created_at > since24h);
    totalPings += recentPings.length;
    const monitorSuccessPings = recentPings.filter((p: any) => p.is_success).length;
    successPings += monitorSuccessPings;

    const uptime24h =
      recentPings.length > 0
        ? ((monitorSuccessPings / recentPings.length) * 100).toFixed(1)
        : null;

    const lastPing = pings[pings.length - 1];
    const isUp = lastPing ? lastPing.is_success : null;
    if (isUp === false) globalUp = false;

    // For chart, we just need the last 60 pings to not overload the SVG
    const chartPings = pings.slice(-60);

    return { ...monitor, isUp, uptime24h, chartPings };
  });

  const aggregateUptime =
    totalPings > 0 ? ((successPings / totalPings) * 100).toFixed(2) : "100.00";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-12 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {statusPage.title}
          </h1>
          {statusPage.description && (
            <p className="text-muted">{statusPage.description}</p>
          )}
        </header>

        {/* Global Status Banner */}
        <div
          className={`rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border ${
            globalUp
              ? "bg-success/10 border-success/30"
              : "bg-danger/10 border-danger/30"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full ${
                globalUp ? "bg-success" : "bg-danger"
              }`}
            />
            <h2
              className={`text-xl font-bold ${
                globalUp ? "text-success" : "text-danger"
              }`}
            >
              {globalUp
                ? "All systems are operational"
                : "Some systems are experiencing issues"}
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 text-sm font-mono text-muted uppercase tracking-wider">
            {aggregateUptime}% Uptime (24h)
          </div>
        </div>

        {/* Monitors */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
            System Metrics
          </h3>

          {processedMonitors.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted">
              No monitors have been added to this status page yet.
            </div>
          ) : (
            processedMonitors.map((monitor) => (
              <div
                key={monitor.id}
                className="bg-card border border-border rounded-lg p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-foreground text-lg">
                      {monitor.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        monitor.isUp === null
                          ? "text-muted"
                          : monitor.isUp
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {monitor.isUp === null
                        ? "Unknown"
                        : monitor.isUp
                        ? "Operational"
                        : "Outage"}
                    </div>
                    <div className="text-xs text-muted font-mono mt-1">
                      {monitor.uptime24h !== null
                        ? `${monitor.uptime24h}% uptime`
                        : "No data"}
                    </div>
                  </div>
                </div>

                {/* Mini chart */}
                {monitor.chartPings && monitor.chartPings.length > 1 ? (
                  <div className="h-16 mt-4 w-full">
                    {/* @ts-ignore - Recharts server components workaround */}
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
                  </div>
                ) : (
                  <div className="h-16 mt-4 flex items-center justify-center border border-dashed border-border rounded text-xs text-muted">
                    Awaiting data
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="pt-16 border-t border-border text-center">
          <p className="text-xs text-muted">
            Powered by{" "}
            <a
              href="/"
              className="font-semibold text-accent hover:underline"
            >
              ScopeX
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
