/*
  # Initial Schema — Buddy Symptom Tracker

  ## Summary
  Documents and ensures the initial database schema for the Buddy symptom tracking
  application. All statements use IF NOT EXISTS guards so this is safe to run on
  any environment, including ones where the schema already exists.

  ## Tables

  ### practitioners
  Stores practitioner accounts. Practitioners log in with a plain-text login_code.

  ### clients
  Stores client profiles. Clients log in with a plain-text login_code.

  ### check_ins
  One record per daily check-in submitted by a client.

  ### symptoms
  Tracked symptoms per client.

  ### symptom_entries
  Per-symptom severity readings, linked to a check-in.

  ### symptom_queries
  Log of symptom descriptions submitted by clients via the Query page.

  ### contact_requests
  Alerts sent from a client to their assigned practitioner when a red flag is detected.

  ### device_visits
  Anonymous session/device tracking for usage analytics.

  ## Security
  - RLS is enabled on all tables
  - All tables have open anon policies to support the code-based login flow
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

CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  name text NOT NULL,
  body_area text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS symptom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id uuid NOT NULL REFERENCES check_ins(id),
  symptom_id uuid NOT NULL REFERENCES symptoms(id),
  severity smallint NOT NULL DEFAULT 0 CHECK (severity >= 0 AND severity <= 10),
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS symptom_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  symptom_description text NOT NULL DEFAULT '',
  red_flag_detected boolean NOT NULL DEFAULT false,
  confidence_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptom_queries ENABLE ROW LEVEL SECURITY;

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
