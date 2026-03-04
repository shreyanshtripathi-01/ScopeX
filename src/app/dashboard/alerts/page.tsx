import { createClient } from "@/utils/supabase/server";
import { AddAlertModal } from "./add-alert-modal";

export const revalidate = 0;

export default async function AlertsList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: alerts } = await supabase
    .from("alert_integrations")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const integrations = alerts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Integrations</h1>
          <p className="text-sm text-muted mt-1">
            Get notified immediately when an endpoint goes down.
          </p>
        </div>
        <AddAlertModal />
      </div>

      {integrations.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-16 text-center flex flex-col items-center">
          <div className="font-mono text-sm text-muted mb-4">
            [ 0 alerts configured ]
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            No alerts configured
          </h3>
          <p className="text-sm text-muted max-w-sm mb-6">
            Add a webhook to receive alerts in Slack, Discord, or your own system.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 border-b border-border bg-background px-5 py-3 hidden md:grid">
            <div className="col-span-3 text-xs font-semibold text-muted">Name</div>
            <div className="col-span-2 text-xs font-semibold text-muted">Type</div>
            <div className="col-span-7 text-xs font-semibold text-muted">Target</div>
          </div>

          {integrations.map((integration, idx) => (
            <div
              key={integration.id}
              className={`grid grid-cols-1 md:grid-cols-12 items-center px-5 py-4 gap-2 md:gap-0 ${
                idx < integrations.length - 1 ? "border-b border-border" : ""
              } hover:bg-background/50 transition-colors`}
            >
              <div className="col-span-3 font-semibold text-sm text-foreground">
                {integration.name}
              </div>
              <div className="col-span-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent uppercase tracking-wider">
                  {integration.type}
                </span>
              </div>
              <div className="col-span-7 font-mono text-xs text-muted truncate">
                {integration.target}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

