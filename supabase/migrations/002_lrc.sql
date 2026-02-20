-- =============================================================
-- Learning Resource Center (LRC) Tables
-- =============================================================

-- 1. Blog Posts
CREATE TABLE IF NOT EXISTS lrc_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  read_time_minutes INT DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 2. Classes / Courses
CREATE TABLE IF NOT EXISTS lrc_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  category TEXT,
  author TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 3. Class Sections
CREATE TABLE IF NOT EXISTS lrc_class_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES lrc_classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'reading' CHECK (content_type IN ('reading', 'video')),
  video_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Resources / Guides
CREATE TABLE IF NOT EXISTS lrc_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 5. Events
CREATE TABLE IF NOT EXISTS lrc_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX idx_lrc_posts_slug ON lrc_posts(slug);
CREATE INDEX idx_lrc_posts_status ON lrc_posts(status);
CREATE INDEX idx_lrc_posts_category ON lrc_posts(category);
CREATE INDEX idx_lrc_posts_created_at ON lrc_posts(created_at DESC);

CREATE INDEX idx_lrc_classes_slug ON lrc_classes(slug);
CREATE INDEX idx_lrc_classes_status ON lrc_classes(status);
CREATE INDEX idx_lrc_classes_category ON lrc_classes(category);
CREATE INDEX idx_lrc_classes_created_at ON lrc_classes(created_at DESC);

CREATE INDEX idx_lrc_class_sections_class_id ON lrc_class_sections(class_id);

CREATE INDEX idx_lrc_resources_slug ON lrc_resources(slug);
CREATE INDEX idx_lrc_resources_status ON lrc_resources(status);
CREATE INDEX idx_lrc_resources_category ON lrc_resources(category);
CREATE INDEX idx_lrc_resources_created_at ON lrc_resources(created_at DESC);

CREATE INDEX idx_lrc_events_slug ON lrc_events(slug);
CREATE INDEX idx_lrc_events_status ON lrc_events(status);
CREATE INDEX idx_lrc_events_created_at ON lrc_events(created_at DESC);
CREATE INDEX idx_lrc_events_event_date ON lrc_events(event_date);

-- =============================================================
-- Updated-at triggers
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lrc_posts_updated_at
  BEFORE UPDATE ON lrc_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lrc_classes_updated_at
  BEFORE UPDATE ON lrc_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lrc_class_sections_updated_at
  BEFORE UPDATE ON lrc_class_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lrc_resources_updated_at
  BEFORE UPDATE ON lrc_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lrc_events_updated_at
  BEFORE UPDATE ON lrc_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- Row Level Security
-- =============================================================

ALTER TABLE lrc_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrc_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrc_class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrc_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lrc_events ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can read published items
CREATE POLICY "Public can read published posts" ON lrc_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published classes" ON lrc_classes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read sections of published classes" ON lrc_class_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lrc_classes WHERE id = lrc_class_sections.class_id AND status = 'published')
  );

CREATE POLICY "Public can read published resources" ON lrc_resources
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published events" ON lrc_events
  FOR SELECT USING (status = 'published');

-- Authenticated: full access
CREATE POLICY "Authenticated full access posts" ON lrc_posts
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access classes" ON lrc_classes
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access class_sections" ON lrc_class_sections
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access resources" ON lrc_resources
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access events" ON lrc_events
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
