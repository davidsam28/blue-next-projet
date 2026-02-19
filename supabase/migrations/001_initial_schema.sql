-- ============================================================
-- Blue Next Projet — Initial Schema
-- Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DONORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  notes TEXT,
  stripe_customer_id TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS donors_email_idx ON donors(email);
CREATE INDEX IF NOT EXISTS donors_created_at_idx ON donors(created_at DESC);

-- ============================================================
-- DONATION RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS donation_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL CHECK (source IN ('stripe', 'zelle', 'cashapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  stripe_payment_intent_id TEXT UNIQUE,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donation_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS donation_records_donor_id_idx ON donation_records(donor_id);
CREATE INDEX IF NOT EXISTS donation_records_source_idx ON donation_records(source);
CREATE INDEX IF NOT EXISTS donation_records_status_idx ON donation_records(status);
CREATE INDEX IF NOT EXISTS donation_records_donation_date_idx ON donation_records(donation_date DESC);
CREATE INDEX IF NOT EXISTS donation_records_stripe_id_idx ON donation_records(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- ============================================================
-- SITE CONTENT TABLE (CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image_url', 'json')),
  content TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(page, section)
);

CREATE INDEX IF NOT EXISTS site_content_page_idx ON site_content(page);

-- ============================================================
-- TEAM MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS team_members_display_order_idx ON team_members(display_order ASC);

-- ============================================================
-- PROGRAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS programs_display_order_idx ON programs(display_order ASC);

-- ============================================================
-- SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('cashapp_cashtag', '$YourCashTag'),
  ('cashapp_qr_url', ''),
  ('zelle_recipient', 'donations@bluenextprojet.org'),
  ('zelle_instructions', 'Send your donation via Zelle to the email address above. Please include your name in the memo.'),
  ('instagram_handle', ''),
  ('facebook_url', ''),
  ('contact_email', 'contact@bluenextprojet.org'),
  ('contact_phone', ''),
  ('org_ein', ''),
  ('org_address', ''),
  ('org_name', 'Blue Next Projet')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ADMIN EMAIL LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced'))
);

CREATE INDEX IF NOT EXISTS admin_email_log_sent_by_idx ON admin_email_log(sent_by);
CREATE INDEX IF NOT EXISTS admin_email_log_created_at_idx ON admin_email_log(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_records_updated_at
  BEFORE UPDATE ON donation_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_log ENABLE ROW LEVEL SECURITY;

-- DONORS: Admin full access, public no access
CREATE POLICY "Admin can manage donors"
  ON donors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DONATION RECORDS: Admin full access, public INSERT only (for Stripe webhook via service role)
CREATE POLICY "Admin can manage donation_records"
  ON donation_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role bypass (webhook uses service role key)
-- Service role always bypasses RLS

-- SITE CONTENT: Public can read, admin can write
CREATE POLICY "Public can read site_content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage site_content"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- TEAM MEMBERS: Public can read active, admin can manage all
CREATE POLICY "Public can read active team_members"
  ON team_members FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage team_members"
  ON team_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROGRAMS: Public can read active, admin can manage all
CREATE POLICY "Public can read active programs"
  ON programs FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage programs"
  ON programs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SITE SETTINGS: Public can read, admin can write
CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ADMIN EMAIL LOG: Admin only
CREATE POLICY "Admin can manage admin_email_log"
  ON admin_email_log FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SEED CONTENT (Default placeholder content editable via CMS)
-- ============================================================
INSERT INTO site_content (page, section, content_type, content) VALUES
  ('home', 'hero_headline', 'text', 'Healing Through Creative Expression'),
  ('home', 'hero_subheadline', 'text', 'Blue Next Projet harnesses the power of media arts to support trauma-informed healing and community empowerment.'),
  ('home', 'hero_cta_primary', 'text', 'Make a Donation'),
  ('home', 'hero_cta_secondary', 'text', 'Learn About Our Work'),
  ('home', 'mission_title', 'text', 'Our Mission'),
  ('home', 'mission_body', 'text', 'Blue Next Projet is a nonprofit organization dedicated to the intersection of trauma-informed care and media arts. We believe in the transformative power of creative expression to foster healing, resilience, and community connection.'),
  ('home', 'impact_stat_1_number', 'text', '500+'),
  ('home', 'impact_stat_1_label', 'text', 'Individuals Served'),
  ('home', 'impact_stat_2_number', 'text', '12+'),
  ('home', 'impact_stat_2_label', 'text', 'Community Programs'),
  ('home', 'impact_stat_3_number', 'text', '5+'),
  ('home', 'impact_stat_3_label', 'text', 'Years of Service'),
  ('about', 'page_title', 'text', 'About Blue Next Projet'),
  ('about', 'page_subtitle', 'text', 'A nonprofit dedicated to trauma-informed media arts'),
  ('about', 'mission_title', 'text', 'Our Mission'),
  ('about', 'mission_body', 'html', '<p>Blue Next Projet is committed to providing trauma-informed media arts programming that creates safe spaces for healing, self-expression, and community building.</p><p>We understand that trauma affects individuals and communities in profound ways. Through intentional, evidence-based approaches integrated with creative media arts, we help participants process experiences, build resilience, and reclaim their narratives.</p>'),
  ('about', 'vision_title', 'text', 'Our Vision'),
  ('about', 'vision_body', 'text', 'A world where every individual, regardless of their trauma history, has access to the healing power of creative expression and media arts.'),
  ('about', 'approach_title', 'text', 'Our Approach'),
  ('about', 'approach_body', 'html', '<p>Our trauma-informed approach ensures that all programming prioritizes safety, trust, choice, collaboration, and empowerment. We integrate these core principles into every aspect of our media arts curriculum.</p>'),
  ('programs', 'page_title', 'text', 'Our Programs'),
  ('programs', 'page_subtitle', 'text', 'Evidence-based, trauma-informed media arts programming for healing and growth'),
  ('contact', 'page_title', 'text', 'Contact Us'),
  ('contact', 'page_subtitle', 'text', 'We would love to hear from you'),
  ('donate', 'page_title', 'text', 'Support Our Mission'),
  ('donate', 'page_subtitle', 'text', 'Your generosity powers trauma-informed healing through media arts'),
  ('donate', 'impact_note', 'text', 'Every dollar you donate directly supports programming, resources, and outreach for individuals and communities impacted by trauma.')
ON CONFLICT (page, section) DO NOTHING;

-- Seed sample programs
INSERT INTO programs (name, description, display_order) VALUES
  ('Media Arts Healing Circles', 'A structured group program that uses photography, film, and digital storytelling as tools for trauma processing and peer connection. Participants create meaningful media projects while building community.', 1),
  ('Youth Empowerment Through Film', 'A youth-focused program providing training in filmmaking, editing, and storytelling. Young people explore their identities, challenges, and aspirations through the lens of a camera.', 2),
  ('Community Narrative Project', 'A community-wide initiative to document and amplify the stories of trauma survivors through documentary film, podcast production, and digital media exhibitions.', 3),
  ('Trauma-Informed Educator Training', 'Professional development workshops for educators, counselors, and community workers on integrating media arts into trauma-informed practice frameworks.', 4)
ON CONFLICT DO NOTHING;
