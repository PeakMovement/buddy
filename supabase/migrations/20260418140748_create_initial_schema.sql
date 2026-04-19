/*
  # Initial Schema — Buddy Symptom Tracker

  ## Summary
  Documents and ensures the initial database schema for the Buddy symptom tracking
  application. All statements use IF NOT EXISTS guards so this is safe to run on
  any environment, including ones where the schema already exists.

  ## Tables

  ### practitioners
  Stores practitioner accounts. Practitioners log in with a plain-text login_code.
  - id: UUID primary key
  - name: short display name
  - full_name: optional full display name (falls back to name)
  - login_code: unique code used to log in
  - password_hash: reserved for future password validation (currently unused)
  - is_admin: when true, grants access to all clients and all contact requests
  - created_at / updated_at: audit timestamps

  ### clients
  Stores client profiles. Clients log in with a plain-text login_code.
  - id: UUID primary key
  - full_name: client display name
  - email: optional contact email
  - practitioner_id: FK to practitioners (nullable — client may be unassigned)
  - login_code: unique code used to log in
  - primary_complaint: reason for treatment (e.g. "Lower back pain")
  - notes: clinical notes visible only to practitioners
  - next_appointment: optional scheduled appointment timestamp
  - tracking_duration_weeks: optional integer for tracking period length
  - tracking_end_date: computed end date when tracking_duration_weeks is set
  - created_at: audit timestamp

  ### check_ins
  One record per daily check-in submitted by a client.
  - id: UUID primary key
  - client_id: FK to clients
  - overall_feeling: 1–5 scale (1=Terrible, 5=Great)
  - symptom_change: 'better' | 'same' | 'worse'
  - pain_level: 0–10 numeric scale
  - sleep_quality: 1–5 scale
  - stress_level: 1–5 scale
  - medication_taken: boolean
  - notes: optional free-text notes from the client
  - flagged: true when pain_level >= 8 OR symptom_change = 'worse'
  - created_at: audit timestamp

  ### symptoms
  Tracked symptoms per client. New symptoms can be added during check-in.
  - id: UUID primary key
  - client_id: FK to clients
  - name: symptom name (e.g. "Lower back pain")
  - body_area: body region (defaults to "General")
  - active: false when symptom is resolved/archived
  - created_at: audit timestamp

  ### symptom_entries
  Per-symptom severity readings, linked to a check-in.
  - id: UUID primary key
  - check_in_id: FK to check_ins
  - symptom_id: FK to symptoms
  - severity: 0–10 numeric scale
  - notes: optional notes for this specific symptom entry

  ### symptom_queries
  Log of symptom descriptions submitted by clients via the Query page.
  - id: UUID primary key
  - client_id: FK to clients
  - symptom_description: free-text submitted by client
  - red_flag_detected: whether local analysis found a red flag keyword
  - confidence_score: normalized score (0–1) from the keyword match
  - created_at: audit timestamp

  ### contact_requests
  Alerts sent from a client to their assigned practitioner when a red flag is detected.
  - id: UUID primary key
  - client_id: FK to clients
  - practitioner_id: FK to practitioners
  - symptom_description: free-text copied from the query
  - symptom_score: numeric score from the keyword analysis
  - is_read: false until the practitioner marks it resolved
  - responded_at: timestamp set when marked resolved
  - created_at: audit timestamp

  ### device_visits
  Anonymous session/device tracking for usage analytics.
  - id: UUID primary key
  - client_id: nullable FK to clients
  - device_type: 'mobile' | 'tablet' | 'desktop' | 'other'
  - user_agent: raw user agent string
  - screen_width / screen_height: viewport dimensions
  - page: the page path visited
  - visited_at: visit timestamp

  ## Security
  - RLS is enabled on all tables
  - All tables have open anon policies (SELECT/INSERT/UPDATE/DELETE) to support
    the code-based login flow without Supabase Auth tokens
  - This is intentional for this application's simple authentication model

  ## Notes
  - The practitioners table is seeded with default accounts on first deployment
  - The is_admin column was added in migration add_is_admin_to_practitioners
*/

CREATE TABLE IF NOT EXISTS practitioners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  full_name text,
  login_code text UNIQUE NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'practitioners' AND policyname = 'Practitioners readable by anon'
  ) THEN
    CREATE POLICY "Practitioners readable by anon" ON practitioners FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'practitioners' AND policyname = 'Practitioners insertable by anon'
  ) THEN
    CREATE POLICY "Practitioners insertable by anon" ON practitioners FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'practitioners' AND policyname = 'Practitioners updatable by anon'
  ) THEN
    CREATE POLICY "Practitioners updatable by anon" ON practitioners FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'practitioners' AND policyname = 'Practitioners deletable by anon'
  ) THEN
    CREATE POLICY "Practitioners deletable by anon" ON practitioners FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  practitioner_id uuid REFERENCES practitioners(id),
  login_code text UNIQUE NOT NULL,
  primary_complaint text NOT NULL DEFAULT '',
  notes text,
  next_appointment timestamptz,
  tracking_duration_weeks integer,
  tracking_end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients readable by anon'
  ) THEN
    CREATE POLICY "Clients readable by anon" ON clients FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients insertable by anon'
  ) THEN
    CREATE POLICY "Clients insertable by anon" ON clients FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients updatable by anon'
  ) THEN
    CREATE POLICY "Clients updatable by anon" ON clients FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients deletable by anon'
  ) THEN
    CREATE POLICY "Clients deletable by anon" ON clients FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  overall_feeling smallint NOT NULL CHECK (overall_feeling >= 1 AND overall_feeling <= 5),
  symptom_change text NOT NULL DEFAULT 'same',
  pain_level smallint NOT NULL DEFAULT 0 CHECK (pain_level >= 0 AND pain_level <= 10),
  sleep_quality smallint NOT NULL DEFAULT 3 CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level smallint NOT NULL DEFAULT 3 CHECK (stress_level >= 1 AND stress_level <= 5),
  medication_taken boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'check_ins' AND policyname = 'Check-ins readable by anon'
  ) THEN
    CREATE POLICY "Check-ins readable by anon" ON check_ins FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'check_ins' AND policyname = 'Check-ins insertable by anon'
  ) THEN
    CREATE POLICY "Check-ins insertable by anon" ON check_ins FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'check_ins' AND policyname = 'Check-ins updatable by anon'
  ) THEN
    CREATE POLICY "Check-ins updatable by anon" ON check_ins FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'check_ins' AND policyname = 'Check-ins deletable by anon'
  ) THEN
    CREATE POLICY "Check-ins deletable by anon" ON check_ins FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  name text NOT NULL,
  body_area text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptoms' AND policyname = 'Symptoms readable by anon'
  ) THEN
    CREATE POLICY "Symptoms readable by anon" ON symptoms FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptoms' AND policyname = 'Symptoms insertable by anon'
  ) THEN
    CREATE POLICY "Symptoms insertable by anon" ON symptoms FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptoms' AND policyname = 'Symptoms updatable by anon'
  ) THEN
    CREATE POLICY "Symptoms updatable by anon" ON symptoms FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptoms' AND policyname = 'Symptoms deletable by anon'
  ) THEN
    CREATE POLICY "Symptoms deletable by anon" ON symptoms FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS symptom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id uuid NOT NULL REFERENCES check_ins(id),
  symptom_id uuid NOT NULL REFERENCES symptoms(id),
  severity smallint NOT NULL DEFAULT 0 CHECK (severity >= 0 AND severity <= 10),
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_entries' AND policyname = 'Symptom entries readable by anon'
  ) THEN
    CREATE POLICY "Symptom entries readable by anon" ON symptom_entries FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_entries' AND policyname = 'Symptom entries insertable by anon'
  ) THEN
    CREATE POLICY "Symptom entries insertable by anon" ON symptom_entries FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_entries' AND policyname = 'Symptom entries updatable by anon'
  ) THEN
    CREATE POLICY "Symptom entries updatable by anon" ON symptom_entries FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_entries' AND policyname = 'Symptom entries deletable by anon'
  ) THEN
    CREATE POLICY "Symptom entries deletable by anon" ON symptom_entries FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS symptom_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  symptom_description text NOT NULL DEFAULT '',
  red_flag_detected boolean NOT NULL DEFAULT false,
  confidence_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptom_queries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_queries' AND policyname = 'Symptom queries readable by anon'
  ) THEN
    CREATE POLICY "Symptom queries readable by anon" ON symptom_queries FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'symptom_queries' AND policyname = 'Symptom queries insertable by anon'
  ) THEN
    CREATE POLICY "Symptom queries insertable by anon" ON symptom_queries FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  practitioner_id uuid NOT NULL REFERENCES practitioners(id),
  symptom_description text NOT NULL DEFAULT '',
  symptom_score numeric NOT NULL DEFAULT 0,
  is_read boolean NOT NULL DEFAULT false,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_requests' AND policyname = 'Contact requests readable by anon'
  ) THEN
    CREATE POLICY "Contact requests readable by anon" ON contact_requests FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_requests' AND policyname = 'Contact requests insertable by anon'
  ) THEN
    CREATE POLICY "Contact requests insertable by anon" ON contact_requests FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_requests' AND policyname = 'Contact requests updatable by anon'
  ) THEN
    CREATE POLICY "Contact requests updatable by anon" ON contact_requests FOR UPDATE TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_requests' AND policyname = 'Contact requests deletable by anon'
  ) THEN
    CREATE POLICY "Contact requests deletable by anon" ON contact_requests FOR DELETE TO anon USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS device_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  device_type text NOT NULL DEFAULT 'other',
  user_agent text NOT NULL DEFAULT '',
  screen_width integer NOT NULL DEFAULT 0,
  screen_height integer NOT NULL DEFAULT 0,
  page text NOT NULL DEFAULT '',
  visited_at timestamptz DEFAULT now()
);

ALTER TABLE device_visits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_visits' AND policyname = 'Device visits readable by anon'
  ) THEN
    CREATE POLICY "Device visits readable by anon" ON device_visits FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'device_visits' AND policyname = 'Device visits insertable by anon'
  ) THEN
    CREATE POLICY "Device visits insertable by anon" ON device_visits FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;
