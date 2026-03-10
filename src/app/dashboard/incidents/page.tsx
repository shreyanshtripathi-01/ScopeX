import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export default async function IncidentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all monitors with their incidents
  const { data: monitors } = await supabase
    .from("monitors")
    .select("id, name, url, incidents(id, created_at, resolved_at, error_message)")
    .eq("user_id", user?.id);

  const allMonitors = monitors || [];

  // Flatten all incidents
  const allIncidents: any[] = [];
  for (const monitor of allMonitors) {
    for (const inc of monitor.incidents || []) {
      allIncidents.push({
        ...inc,
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        monitorId: monitor.id,
      });
    }
  }

  // Sort: open first, then by created_at desc
  const sorted = allIncidents.sort((a, b) => {
    if (!a.resolved_at && b.resolved_at) return -1;
    if (a.resolved_at && !b.resolved_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const openCount = sorted.filter((i) => !i.resolved_at).length;
  const resolvedCount = sorted.filter((i) => i.resolved_at).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
        <p className="text-sm text-muted mt-1">
          {openCount} open · {resolvedCount} resolved
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-16 text-center flex flex-col items-center">
          <div className="font-mono text-sm text-success mb-4">
            [ All clear ]
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            No incidents recorded
          </h3>
          <p className="text-sm text-muted max-w-sm">
            All systems are operating normally. Any future endpoint failures will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 border-b border-border bg-background px-5 py-3 hidden md:grid">
            <div className="col-span-1 text-xs font-semibold text-muted">
              Status
            </div>
            <div className="col-span-4 text-xs font-semibold text-muted">
              Endpoint
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted">
              Started
            </div>
            <div className="col-span-3 text-xs font-semibold text-muted">
              Resolved
            </div>
            <div className="col-span-1 text-xs font-semibold text-muted">
              Duration
            </div>
          </div>

          {sorted.map((incident, idx) => {
            const started = new Date(incident.created_at);
            const resolved = incident.resolved_at
              ? new Date(incident.resolved_at)
              : null;
            const durationMs = resolved
              ? resolved.getTime() - started.getTime()
              : Date.now() - started.getTime();
            const durationMins = Math.round(durationMs / 60000);

            return (
              <div
                key={incident.id}
                className={`grid grid-cols-1 md:grid-cols-12 px-5 py-4 gap-4 md:gap-0 items-center ${
                  idx < sorted.length - 1 ? "border-b border-border" : ""
                } hover:bg-background/50 transition-colors`}
              >
                {/* Status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      incident.resolved_at
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {incident.resolved_at ? "Resolved" : "Open"}
                  </span>
                </div>

                {/* Monitor name */}
                <div className="col-span-4 md:pl-2">
                  <div className="text-sm font-semibold text-foreground">
                    {incident.monitorName}
                  </div>
                  <div className="text-xs text-muted font-mono truncate mt-0.5">
                    {incident.monitorUrl}
                  </div>
                </div>

                {/* Started */}
                <div className="col-span-3 text-xs text-muted font-mono">
                  {started.toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>

                {/* Resolved */}
                <div className="col-span-3 text-xs text-muted font-mono">
                  {resolved
                    ? resolved.toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : <span className="text-danger font-semibold">Ongoing</span>}
                </div>

                {/* Duration */}
                <div className="col-span-1 text-sm font-medium text-[#c9d1d9]">
                  {durationMins < 60
                    ? `${durationMins}m`
                    : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

