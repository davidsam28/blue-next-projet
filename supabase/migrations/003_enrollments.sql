-- ============================================================
-- Blue Next Projet — Student Enrollments
-- Migration 003
-- ============================================================

-- ============================================================
-- ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INT,

  -- School & location
  school TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Program interests
  interests TEXT[],
  experience_level TEXT CHECK (experience_level IN ('none', 'beginner', 'intermediate', 'advanced')),

  -- Creative links
  social_links JSONB DEFAULT '{}',
  music_links TEXT,

  -- Additional info
  how_heard TEXT,
  additional_notes TEXT,

  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'enrolled', 'waitlisted', 'declined')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON enrollments(status);
CREATE INDEX IF NOT EXISTS enrollments_email_idx ON enrollments(email);
CREATE INDEX IF NOT EXISTS enrollments_created_at_idx ON enrollments(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER (reuses function from migration 001)
-- ============================================================
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (form submissions from anonymous visitors)
CREATE POLICY "Public can submit enrollment applications"
  ON enrollments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read all enrollments
CREATE POLICY "Authenticated can read enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update enrollments (status changes, reviews)
CREATE POLICY "Authenticated can update enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete enrollments
CREATE POLICY "Authenticated can delete enrollments"
  ON enrollments FOR DELETE
  TO authenticated
  USING (true);
