import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Look for .env.local in the root directory
dotenv.config({ path: "../.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Exiting worker.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Dispatches alerts for a specific user and monitor.
 * @param {string} userId
 * @param {object} monitor
 * @param {object} incident (if opening) or null
 * @param {boolean} isResolved
 */
export async function dispatchAlerts(userId, monitor, incident, isResolved) {
  // 1. Fetch all alert integrations for this user
  const { data: integrations, error } = await supabase
    .from("alert_integrations")
    .select("*")
    .eq("user_id", userId);

  if (error || !integrations || integrations.length === 0) {
    return; // No alerts configured
  }

  const statusStr = isResolved ? "RESOLVED" : "DOWN";
  const message = isResolved
    ? `✅ [RESOLVED] Monitor "${monitor.name}" (${monitor.url}) is back online.`
    : `🚨 [DOWN] Monitor "${monitor.name}" (${monitor.url}) went offline. Error: ${incident?.description || "Unknown"}`;

  for (const integration of integrations) {
    if (integration.type === "webhook") {
      try {
        await fetch(integration.target, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message, // Standard Slack payload
            monitor: monitor.name,
            url: monitor.url,
            status: statusStr,
            timestamp: new Date().toISOString()
          }),
        });
        console.log(`Dispatched ${statusStr} webhook to ${integration.name}`);
      } catch (err) {
        console.error(`Failed to send webhook to ${integration.name}:`, err.message);
      }
    }
    // We can add email support later if needed.
  }
}
