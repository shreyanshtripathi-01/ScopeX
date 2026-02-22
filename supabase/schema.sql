-- ScopeX Core Telemetry Schema

-- 1. Monitors Table (Stores the endpoints to be checked)
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT DEFAULT 'GET' NOT NULL,
  interval_minutes INTEGER DEFAULT 5 NOT NULL,
  last_pinged_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Enable RLS for Monitors
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own monitors"
  ON monitors FOR ALL USING (auth.uid() = user_id);

-- 2. Pings Table (Stores the telemetry data for every execution)
CREATE TABLE pings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER NOT NULL,
  is_success BOOLEAN NOT NULL
);

-- Enable RLS for Pings
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own pings"
  ON pings FOR SELECT USING (
    EXISTS (SELECT 1 FROM monitors WHERE monitors.id = pings.monitor_id AND monitors.user_id = auth.uid())
  );
-- (Inserts will be handled by the server / cron engine, so we can use a service_role key to bypass RLS)

-- 3. Incidents Table (Stores downtime events)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  description TEXT
);

-- Enable RLS for Incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own incidents"
  ON incidents FOR SELECT USING (
    EXISTS (SELECT 1 FROM monitors WHERE monitors.id = incidents.monitor_id AND monitors.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_pings_monitor_id_created_at ON pings(monitor_id, created_at DESC);
CREATE INDEX idx_incidents_monitor_id_resolved_at ON incidents(monitor_id, resolved_at DESC);
