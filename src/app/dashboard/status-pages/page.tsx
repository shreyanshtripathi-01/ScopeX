import { createClient } from "@/utils/supabase/server";
import { AddStatusPageModal } from "./add-status-page-modal";
import Link from "next/link";

export const revalidate = 0;

export default async function StatusPagesList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: statusPages } = await supabase
    .from("status_pages")
    .select("*, status_page_monitors(monitor_id)")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const pages = statusPages || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Status Pages</h1>
          <p className="text-sm text-muted mt-1">
            Build trust by sharing your uptime publicly.
          </p>
        </div>
        <AddStatusPageModal />
      </div>

      {pages.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-16 text-center flex flex-col items-center">
          <div className="font-mono text-sm text-muted mb-4">
            [ 0 status pages created ]
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            No status pages yet
          </h3>
          <p className="text-sm text-muted max-w-sm mb-6">
            Create a public page to display the uptime of your selected monitors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-card border border-border rounded-lg p-5 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {page.title}
                </h3>
                <p className="text-xs text-muted mb-4">
                  {page.description || "No description provided."}
                </p>
                <div className="text-xs font-mono text-muted mb-4">
                  {page.status_page_monitors?.length || 0} monitors attached
                </div>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <a
                  href={`/status/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  View public page ↗
                </a>
                <Link
                  href={`/dashboard/status-pages/${page.id}`}
                  className="text-xs text-[#c9d1d9] hover:text-foreground"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

