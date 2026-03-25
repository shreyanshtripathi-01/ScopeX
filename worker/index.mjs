import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dispatchAlerts } from "./alerts.mjs";

// Look for .env.local in the root directory
dotenv.config({ path: "../.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Exiting worker.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Config
const RUN_INTERVAL_MS = 1000 * 30; // Check every 30 seconds

async function checkMonitors() {
  console.log(`[${new Date().toISOString()}] Waking up to check monitors...`);

  // 1. Fetch all active monitors
  const { data: monitors, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching monitors:", error.message);
    return;
  }

  const now = new Date();

  // 2. Filter monitors that are due for a ping
  const dueMonitors = monitors.filter((m) => {
    if (!m.last_pinged_at) return true;
    const lastPing = new Date(m.last_pinged_at);
    const msSinceLastPing = now.getTime() - lastPing.getTime();
    const msInterval = m.interval_minutes * 60 * 1000;
    return msSinceLastPing >= msInterval;
  });

  if (dueMonitors.length === 0) {
    console.log(`[${new Date().toISOString()}] No monitors due for pinging.`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Pinging ${dueMonitors.length} monitors...`);

  // 3. Execute pings concurrently
  const promises = dueMonitors.map(async (monitor) => {
    const startTime = Date.now();
    let isSuccess = false;
    let statusCode = null;
    let errorMessage = null;

    try {
      // Set a 10s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(monitor.url, {
        method: monitor.method || "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      statusCode = res.status;
      isSuccess = res.ok; // true if 200-299

      if (!isSuccess) {
        errorMessage = `HTTP ${statusCode}: ${res.statusText}`;
      }
    } catch (err) {
      isSuccess = false;
      errorMessage = err.name === "AbortError" ? "Connection Timed Out" : err.message;
    }

    const latencyMs = Date.now() - startTime;

    // 4. Save Ping to DB
    await supabase.from("pings").insert({
      monitor_id: monitor.id,
      status_code: statusCode,
      latency_ms: latencyMs,
      is_success: isSuccess,
    });

    // Update last_pinged_at
    await supabase
      .from("monitors")
      .update({ last_pinged_at: new Date().toISOString() })
      .eq("id", monitor.id);

    console.log(`- Pinged ${monitor.url} | Success: ${isSuccess} | Latency: ${latencyMs}ms | Status: ${statusCode}`);

    // 5. Incident Management
    // Check if there is currently an open incident for this monitor
    const { data: openIncidents } = await supabase
      .from("incidents")
      .select("*")
      .eq("monitor_id", monitor.id)
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const openIncident = openIncidents?.[0];

    if (!isSuccess && !openIncident) {
      // Went DOWN and no open incident exists -> Create incident
      const { data: newIncident } = await supabase
        .from("incidents")
        .insert({
          monitor_id: monitor.id,
          description: errorMessage,
        })
        .select()
        .single();
        
      console.log(`🚨 Incident created for ${monitor.url}`);
      await dispatchAlerts(monitor.user_id, monitor, newIncident, false);
      
    } else if (isSuccess && openIncident) {
      // Went UP but incident is open -> Resolve incident
      await supabase
        .from("incidents")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", openIncident.id);
        
      console.log(`✅ Incident resolved for ${monitor.url}`);
      await dispatchAlerts(monitor.user_id, monitor, openIncident, true);
    }
  });

  await Promise.all(promises);
  console.log(`[${new Date().toISOString()}] Cycle complete.`);
}

// Start worker
console.log(`🚀 ScopeX Telemetry Engine started.`);
console.log(`Checking monitors every ${RUN_INTERVAL_MS / 1000} seconds...`);

checkMonitors(); // run immediately
setInterval(checkMonitors, RUN_INTERVAL_MS);
