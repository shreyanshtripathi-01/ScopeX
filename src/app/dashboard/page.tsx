import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*, pings(id, status_code, latency_ms, is_success, created_at), incidents(id, resolved_at, created_at, error_message)")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const allMonitors = monitors || [];
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let totalPings = 0, successPings = 0, totalLatency = 0, latencyCount = 0, openIncidents = 0;

  for (const m of allMonitors) {
    const recent = (m.pings || []).filter((p: any) => p.created_at > since24h);
    totalPings += recent.length;
    successPings += recent.filter((p: any) => p.is_success).length;
    recent.forEach((p: any) => { totalLatency += p.latency_ms; latencyCount++; });
    openIncidents += (m.incidents || []).filter((i: any) => !i.resolved_at).length;
  }

  const uptime = totalPings > 0 ? ((successPings / totalPings) * 100).toFixed(2) : null;
  const avgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null;

  const processedMonitors = allMonitors.slice(0, 6).map((m) => {
    const sorted = [...(m.pings || [])].sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const last = sorted[0];
    return { ...m, isUp: last ? last.is_success : null, lastLatency: last ? last.latency_ms : null };
  });

  const allIncidents: any[] = [];
  for (const m of allMonitors) {
    for (const inc of m.incidents || []) {
      allIncidents.push({ ...inc, monitorName: m.name });
    }
  }
  const recentIncidents = allIncidents
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const statCards = [
    {
      label: "Endpoints",
      value: allMonitors.length.toString(),
      sub: `${allMonitors.filter(m => m.is_active).length} active`,
      color: "border-[#58a6ff]/30",
      valColor: "text-foreground",
    },
    {
      label: "Uptime 24h",
      value: uptime ? `${uptime}%` : "—",
      sub: `${totalPings} pings`,
      color: uptime === null ? "border-border" : Number(uptime) >= 99 ? "border-success/30" : Number(uptime) >= 95 ? "border-[#d29922]/30" : "border-danger/30",
      valColor: uptime === null ? "text-muted" : Number(uptime) >= 99 ? "text-success" : Number(uptime) >= 95 ? "text-[#d29922]" : "text-danger",
    },
    {
      label: "Avg Latency",
      value: avgLatency ? `${avgLatency}ms` : "—",
      sub: avgLatency === null ? "no data" : avgLatency < 300 ? "fast" : avgLatency < 800 ? "moderate" : "slow",
      color: avgLatency === null ? "border-border" : avgLatency < 300 ? "border-success/30" : avgLatency < 800 ? "border-[#d29922]/30" : "border-danger/30",
      valColor: avgLatency === null ? "text-muted" : avgLatency < 300 ? "text-success" : avgLatency < 800 ? "text-[#d29922]" : "text-danger",
    },
    {
      label: "Open Incidents",
      value: openIncidents.toString(),
      sub: openIncidents === 0 ? "all clear" : "needs attention",
      color: openIncidents === 0 ? "border-success/30" : "border-danger/30",
      valColor: openIncidents === 0 ? "text-success" : "text-danger",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Last 24 hours across all endpoints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-card border ${s.color} rounded-lg p-5`}>
            <div className="text-xs text-muted font-mono uppercase tracking-wider mb-3">{s.label}</div>
            <div className={`text-3xl font-extrabold tracking-tight ${s.valColor}`}>{s.value}</div>
            <div className="text-xs text-muted mt-1.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Endpoints</h2>
            <Link href="/dashboard/monitors" className="text-xs text-accent hover:underline">
              Manage →
            </Link>
          </div>

          {processedMonitors.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted">No endpoints added.</p>
              <Link href="/dashboard/monitors" className="text-xs text-accent hover:underline mt-2 inline-block">
                Add your first monitor →
              </Link>
            </div>
          ) : (
            <div>
              {processedMonitors.map((m, idx) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-5 py-3 ${idx < processedMonitors.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.isUp === null ? "bg-[#8b949e]" : m.isUp ? "bg-success" : "bg-danger"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{m.name}</div>
                    <div className="text-xs text-muted truncate font-mono">{m.url}</div>
                  </div>
                  <div className="text-xs text-muted font-mono flex-shrink-0">
                    {m.lastLatency !== null ? `${m.lastLatency}ms` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incidents */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Incidents</h2>
            <Link href="/dashboard/incidents" className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>

          {recentIncidents.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="text-xs font-mono font-bold text-success mb-2 block">[ ALL CLEAR ]</span>
              <p className="text-sm text-muted">No incidents. Everything looks good.</p>
            </div>
          ) : (
            <div>
              {recentIncidents.map((inc, idx) => (
                <div
                  key={inc.id}
                  className={`flex items-start gap-3 px-5 py-3 ${idx < recentIncidents.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 text-[10px] font-mono font-bold ${inc.resolved_at ? "text-success" : "text-danger"}`}>
                    {inc.resolved_at ? "[ RESOLVED ]" : "[ ACTIVE ]"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{inc.monitorName}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${inc.resolved_at ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                        {inc.resolved_at ? "resolved" : "open"}
                      </span>
                    </div>
                    <div className="text-xs text-muted font-mono mt-0.5">
                      {new Date(inc.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

