import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function StatusPageEdit({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch status page and its monitors
  const { data: statusPage } = await supabase
    .from("status_pages")
    .select("*, status_page_monitors(monitor_id)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!statusPage) notFound();

  // Fetch all user's monitors
  const { data: allMonitors } = await supabase
    .from("monitors")
    .select("id, name, url")
    .eq("user_id", user.id);

  const monitors = allMonitors || [];
  const attachedMonitorIds = new Set(
    (statusPage.status_page_monitors || []).map((m: any) => m.monitor_id)
  );

  async function toggleMonitor(formData: FormData) {
    "use server";
    const supabaseServer = await createClient();
    const monitorId = formData.get("monitorId") as string;
    const action = formData.get("action") as "attach" | "detach";

    if (action === "attach") {
      await supabaseServer.from("status_page_monitors").insert({
        status_page_id: params.id,
        monitor_id: monitorId,
      });
    } else {
      await supabaseServer
        .from("status_page_monitors")
        .delete()
        .match({ status_page_id: params.id, monitor_id: monitorId });
    }

    revalidatePath(`/dashboard/status-pages/${params.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Status Page</h1>
        <p className="text-sm text-muted mt-1">
          Manage monitors displayed on {statusPage.title}
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border bg-background">
          <h2 className="text-sm font-semibold text-foreground">Attached Monitors</h2>
        </div>
        <div className="p-5 space-y-4">
          {monitors.length === 0 ? (
            <p className="text-sm text-muted">No monitors available.</p>
          ) : (
            monitors.map((m) => {
              const isAttached = attachedMonitorIds.has(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-background"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.name}</div>
                    <div className="text-xs text-muted font-mono">{m.url}</div>
                  </div>
                  <form action={toggleMonitor}>
                    <input type="hidden" name="monitorId" value={m.id} />
                    <input
                      type="hidden"
                      name="action"
                      value={isAttached ? "detach" : "attach"}
                    />
                    <button
                      type="submit"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                        isAttached
                          ? "bg-muted/20 text-danger hover:bg-danger/10 border border-border"
                          : "bg-primary text-foreground hover:bg-primary-hover"
                      }`}
                    >
                      {isAttached ? "Remove" : "Add"}
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
