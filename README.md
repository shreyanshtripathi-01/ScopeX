# ScopeX

ScopeX is an uptime monitoring tool for tracking HTTP endpoints. You add a URL, it pings it on a schedule, and creates an incident if something goes down.

## What it does

**Monitors** — Add any HTTP endpoint. ScopeX pings it at your set interval and tracks uptime, latency, and status. The dashboard shows the last 24h across all endpoints.

**Incidents** — Automatically created when an endpoint fails, with the exact error. Resolved when it comes back up. Full history preserved.

**Status Pages** — Create a public status page for your project and share it with users.

**Alerts** — Get notified by email when a monitor goes down or recovers.

**Settings** — Theme switching, profile management, account controls.

## Stack

- Next.js 14 with App Router and Server Actions
- TypeScript
- Supabase for database and auth
- Tailwind CSS
- Node.js background worker for health checks

## How it works

The frontend reads directly from Supabase on every request. Mutations happen through Server Actions. Auth is Supabase magic links, no passwords. Route protection is handled in Next.js middleware.

The health check worker runs as a separate Node.js process. Every 30 seconds it fetches all active monitors, pings the ones that are due, records the result, and handles incident creation and resolution. It runs separately from the Next.js app because Vercel serverless functions time out too quickly for a polling loop.

## Built

January to March 2026.
