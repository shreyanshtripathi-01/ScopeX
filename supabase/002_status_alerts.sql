-- 4. Status Pages Table (Public shareable pages)
CREATE TABLE IF NOT EXISTS status_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- Enable RLS for Status Pages
ALTER TABLE status_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own status pages"
    ON status_pages FOR ALL USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view status pages"
    ON status_pages FOR SELECT USING (TRUE);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Status Page Monitors (Junction table mapping monitors to status pages)
CREATE TABLE IF NOT EXISTS status_page_monitors (
  status_page_id UUID REFERENCES status_pages(id) ON DELETE CASCADE NOT NULL,
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (status_page_id, monitor_id)
);

-- Enable RLS for Status Page Monitors
ALTER TABLE status_page_monitors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own status page monitors"
    ON status_page_monitors FOR ALL USING (
      EXISTS (SELECT 1 FROM status_pages WHERE status_pages.id = status_page_monitors.status_page_id AND status_pages.user_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view status page monitors"
    ON status_page_monitors FOR SELECT USING (TRUE);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6. Alert Integrations Table
CREATE TABLE IF NOT EXISTS alert_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'webhook'
  target TEXT NOT NULL, -- The webhook URL
  name TEXT NOT NULL -- e.g., 'Slack #engineering'
);

-- Enable RLS for Alert Integrations
ALTER TABLE alert_integrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own alert integrations"
    ON alert_integrations FOR ALL USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
