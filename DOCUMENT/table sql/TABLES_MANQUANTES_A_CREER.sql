-- ============================================================
-- EASY INCENDIE - TABLES MANQUANTES À CRÉER DANS SUPABASE
-- ============================================================
-- Exécuter ce script dans Supabase SQL Editor
-- Ces tables sont nécessaires pour les pages:
-- - GroupesPage.jsx
-- - SoustraitantsPage.jsx
-- - AstreintesPage.jsx
-- - ObservationsPage.jsx
-- ============================================================

-- ============================================================
-- 1. TABLE GROUPES (pour organiser les techniciens)
-- ============================================================
CREATE TABLE IF NOT EXISTS groupes (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id) ON DELETE CASCADE,
  nom              text NOT NULL,
  description      text,
  zone_geographique text,
  actif            boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_groupes_org ON groupes(organisation_id);

-- RLS
ALTER TABLE groupes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "groupes_select" ON groupes;
DROP POLICY IF EXISTS "groupes_insert" ON groupes;
DROP POLICY IF EXISTS "groupes_update" ON groupes;
DROP POLICY IF EXISTS "groupes_delete" ON groupes;

CREATE POLICY "groupes_select" ON groupes
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_insert" ON groupes
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_update" ON groupes
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_delete" ON groupes
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- 2. TABLE SOUS_TRAITANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS sous_traitants (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  raison_sociale      text NOT NULL,
  siret               text,
  contact_nom         text,
  contact_prenom      text,
  telephone           text,
  email               text,
  adresse             text,
  code_postal         text,
  ville               text,
  domaines_competence text[] DEFAULT '{}',
  taux_horaire        numeric,
  actif               boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sous_traitants_org ON sous_traitants(organisation_id);

-- RLS
ALTER TABLE sous_traitants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sous_traitants_select" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_insert" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_update" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_delete" ON sous_traitants;

CREATE POLICY "sous_traitants_select" ON sous_traitants
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_insert" ON sous_traitants
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_update" ON sous_traitants
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_delete" ON sous_traitants
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- 3. TABLE ASTREINTES (planning des gardes)
-- ============================================================
CREATE TABLE IF NOT EXISTS astreintes (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  technicien_id       uuid REFERENCES techniciens(id) ON DELETE CASCADE,
  date_debut          timestamptz NOT NULL,
  date_fin            timestamptz NOT NULL,
  telephone_astreinte text,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_astreintes_org ON astreintes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_astreintes_tech ON astreintes(technicien_id);
CREATE INDEX IF NOT EXISTS idx_astreintes_dates ON astreintes(date_debut, date_fin);

-- RLS
ALTER TABLE astreintes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "astreintes_select" ON astreintes;
DROP POLICY IF EXISTS "astreintes_insert" ON astreintes;
DROP POLICY IF EXISTS "astreintes_update" ON astreintes;
DROP POLICY IF EXISTS "astreintes_delete" ON astreintes;

CREATE POLICY "astreintes_select" ON astreintes
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_insert" ON astreintes
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_update" ON astreintes
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_delete" ON astreintes
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- 4. TABLE OBSERVATIONS (anomalies terrain)
-- ============================================================
CREATE TABLE IF NOT EXISTS observations (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id   uuid REFERENCES organisations(id) ON DELETE CASCADE,
  site_id           uuid REFERENCES sites(id) ON DELETE SET NULL,
  intervention_type text,
  intervention_id   uuid,
  domaine           text,
  description       text NOT NULL,
  localisation      text,
  priorite          text DEFAULT 'normale',
  type              text DEFAULT 'anomalie',
  statut            text DEFAULT 'nouveau',
  date_constat      date DEFAULT CURRENT_DATE,
  date_traitement   date,
  photos            text[],
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_observations_org ON observations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_observations_site ON observations(site_id);
CREATE INDEX IF NOT EXISTS idx_observations_statut ON observations(statut);

-- RLS
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "observations_select" ON observations;
DROP POLICY IF EXISTS "observations_insert" ON observations;
DROP POLICY IF EXISTS "observations_update" ON observations;
DROP POLICY IF EXISTS "observations_delete" ON observations;

CREATE POLICY "observations_select" ON observations
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_insert" ON observations
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_update" ON observations
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_delete" ON observations
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- 5. AJOUTER groupe_id À TECHNICIENS (si pas déjà présent)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'techniciens' AND column_name = 'groupe_id'
  ) THEN
    ALTER TABLE techniciens ADD COLUMN groupe_id uuid REFERENCES groupes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_techniciens_groupe ON techniciens(groupe_id);
    RAISE NOTICE '✅ Colonne groupe_id ajoutée à techniciens';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne groupe_id existe déjà dans techniciens';
  END IF;
END $$;

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
SELECT '=== VÉRIFICATIONS TABLES ===' AS status;

SELECT 'groupes exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'groupes'
)::text AS check_groupes;

SELECT 'sous_traitants exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'sous_traitants'
)::text AS check_sous_traitants;

SELECT 'astreintes exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'astreintes'
)::text AS check_astreintes;

SELECT 'observations exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'observations'
)::text AS check_observations;

SELECT 'groupe_id in techniciens: ' || EXISTS(
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'techniciens' AND column_name = 'groupe_id'
)::text AS check_groupe_id;

SELECT '=== SCRIPT TERMINÉ ===' AS result;
