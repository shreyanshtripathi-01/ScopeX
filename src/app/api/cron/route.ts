import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  // Enforce Vercel Cron Secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 1. Fetch all active monitors
  const { data: monitors, error: fetchError } = await supabase
    .from("monitors")
    .select("*")
    .eq("is_active", true);

  if (fetchError || !monitors) {
    return NextResponse.json(
      { error: "Failed to fetch monitors" },
      { status: 500 }
    );
  }

  const results = [];
  const now = new Date();

  // 2. Process each monitor
  for (const monitor of monitors) {
    // Only ping if due
    if (monitor.last_pinged_at) {
      const lastPing = new Date(monitor.last_pinged_at);
      const diffMs = now.getTime() - lastPing.getTime();
      const diffMins = diffMs / 1000 / 60;
      if (diffMins < monitor.interval_minutes) {
        continue; // skip this monitor, not due yet
      }
    }

    const startTime = performance.now();
    let statusCode = null;
    let isSuccess = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(monitor.url, {
        method: monitor.method,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      statusCode = res.status;
      isSuccess = res.ok; // 200-299 are true
    } catch (error) {
      isSuccess = false;
      statusCode = 0; // 0 for network error / timeout
    }

    const latencyMs = Math.round(performance.now() - startTime);

    results.push({
      monitor,
      statusCode,
      latencyMs,
      isSuccess,
    });
  }

  // 3. Batch write telemetry to Supabase
  if (results.length > 0) {
    const pingsToInsert = results.map((res) => ({
      monitor_id: res.monitor.id,
      status_code: res.statusCode,
      latency_ms: res.latencyMs,
      is_success: res.isSuccess,
    }));

    await supabase.from("pings").insert(pingsToInsert);

    // Update last_pinged_at for all processed monitors
    for (const res of results) {
      await supabase
        .from("monitors")
        .update({ last_pinged_at: now.toISOString() })
        .eq("id", res.monitor.id);

      // Handle Incident creation/resolution
      if (!res.isSuccess) {
        // Check if there is an active incident
        const { data: activeIncidents } = await supabase
          .from("incidents")
          .select("id")
          .eq("monitor_id", res.monitor.id)
          .is("resolved_at", null)
          .limit(1);

        if (!activeIncidents || activeIncidents.length === 0) {
          // Open a new incident
          await supabase.from("incidents").insert({
            monitor_id: res.monitor.id,
            description: `Monitor failed with status code ${res.statusCode}`,
          });
        }
      } else {
        // If it was successful, resolve any open incidents
        const { data: activeIncidents } = await supabase
          .from("incidents")
          .select("id")
          .eq("monitor_id", res.monitor.id)
          .is("resolved_at", null);

        if (activeIncidents && activeIncidents.length > 0) {
          await supabase
            .from("incidents")
            .update({ resolved_at: now.toISOString() })
            .in(
              "id",
              activeIncidents.map((i) => i.id)
            );
        }
      }
    }
  }

  return NextResponse.json({ success: true, processed: results.length });
}
