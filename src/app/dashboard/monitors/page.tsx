import { createClient } from "@/utils/supabase/server";
import { MonitorList } from "../monitor-list";
import { AddMonitorModal } from "../add-monitor-modal";

export const revalidate = 0;

export default async function MonitorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*, pings(id, status_code, latency_ms, is_success, created_at)")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const processedMonitors = (monitors || []).map((monitor) => {
    const recentPings = monitor.pings
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 48)
      .reverse();
    return { ...monitor, pings: recentPings };
  });

  // Per-monitor uptime stats
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const monitorsWithStats = processedMonitors.map((monitor) => {
    const last24h = monitor.pings.filter((p: any) => p.created_at > since24h);
    const uptime24h =
      last24h.length > 0
        ? ((last24h.filter((p: any) => p.is_success).length / last24h.length) * 100).toFixed(1)
        : null;
    return { ...monitor, uptime24h };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitors</h1>
          <p className="text-sm text-muted mt-1">
            {processedMonitors.length} endpoint{processedMonitors.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <AddMonitorModal />
      </div>

      <MonitorList initialMonitors={monitorsWithStats} />
    </div>
  );
}

