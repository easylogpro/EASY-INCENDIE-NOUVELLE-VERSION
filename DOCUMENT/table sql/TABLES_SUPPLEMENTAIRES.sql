-- ============================================================
-- EASY INCENDIE - TABLES SUPPLÉMENTAIRES MANQUANTES
-- ============================================================
-- À EXÉCUTER APRÈS le SCRIPT_RLS_DEFINITIF_FINAL.sql
-- ============================================================

-- ============================================================
-- 1. TABLE DEMO_SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_sessions (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id   uuid REFERENCES organisations(id) ON DELETE CASCADE,
  started_at        timestamptz DEFAULT now(),
  expires_at        timestamptz,
  converted         boolean DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_demo_sessions_org ON demo_sessions(organisation_id);

-- RLS
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_sessions_all" ON demo_sessions;
CREATE POLICY "demo_sessions_all" ON demo_sessions
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- ============================================================
-- 2. TABLE ONBOARDING_PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE UNIQUE,
  step_profil         boolean DEFAULT false,
  step_entreprise     boolean DEFAULT false,
  step_domaines       boolean DEFAULT false,
  step_premier_client boolean DEFAULT false,
  step_premier_site   boolean DEFAULT false,
  step_paiement       boolean DEFAULT false,
  completed           boolean DEFAULT false,
  current_step        integer DEFAULT 1,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_org ON onboarding_progress(organisation_id);

-- RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_all" ON onboarding_progress;
CREATE POLICY "onboarding_all" ON onboarding_progress
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- ============================================================
-- 3. TABLE ALERTES (si n'existe pas)
-- ============================================================
CREATE TABLE IF NOT EXISTS alertes (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id   uuid REFERENCES organisations(id) ON DELETE CASCADE,
  type              text NOT NULL,
  titre             text NOT NULL,
  message           text,
  priorite          text DEFAULT 'normale',
  statut            text DEFAULT 'nouvelle',
  site_id           uuid REFERENCES sites(id) ON DELETE SET NULL,
  contrat_id        uuid REFERENCES contrats(id) ON DELETE SET NULL,
  date_alerte       timestamptz DEFAULT now(),
  date_traitement   timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_alertes_org ON alertes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_alertes_statut ON alertes(statut);

-- RLS (si pas déjà fait)
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "alertes_all" ON alertes;
  CREATE POLICY "alertes_all" ON alertes
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. TABLE DEVIS (si n'existe pas)
-- ============================================================
CREATE TABLE IF NOT EXISTS devis (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES clients(id) ON DELETE SET NULL,
  site_id             uuid REFERENCES sites(id) ON DELETE SET NULL,
  numero              text,
  date_devis          date DEFAULT CURRENT_DATE,
  date_validite       date,
  objet               text,
  montant_ht          numeric DEFAULT 0,
  taux_tva            numeric DEFAULT 20,
  montant_ttc         numeric DEFAULT 0,
  statut              text DEFAULT 'brouillon',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_devis_org ON devis(organisation_id);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);

-- RLS
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "devis_all" ON devis;
  CREATE POLICY "devis_all" ON devis
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 5. TABLE FACTURES (si n'existe pas)
-- ============================================================
CREATE TABLE IF NOT EXISTS factures (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES clients(id) ON DELETE SET NULL,
  site_id             uuid REFERENCES sites(id) ON DELETE SET NULL,
  devis_id            uuid REFERENCES devis(id) ON DELETE SET NULL,
  numero              text,
  date_facture        date DEFAULT CURRENT_DATE,
  date_echeance       date,
  objet               text,
  montant_ht          numeric DEFAULT 0,
  taux_tva            numeric DEFAULT 20,
  montant_ttc         numeric DEFAULT 0,
  statut              text DEFAULT 'brouillon',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_factures_org ON factures(organisation_id);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);

-- RLS
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "factures_all" ON factures;
  CREATE POLICY "factures_all" ON factures
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 6. TABLE TRAVAUX (si n'existe pas)
-- ============================================================
CREATE TABLE IF NOT EXISTS travaux (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES clients(id) ON DELETE SET NULL,
  site_id             uuid REFERENCES sites(id) ON DELETE SET NULL,
  technicien_id       uuid REFERENCES techniciens(id) ON DELETE SET NULL,
  titre               text NOT NULL,
  description         text,
  type_travaux        text,
  date_debut          date,
  date_fin_prevue     date,
  date_fin_reelle     date,
  statut              text DEFAULT 'planifie',
  priorite            text DEFAULT 'normale',
  montant_estime      numeric,
  montant_final       numeric,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_travaux_org ON travaux(organisation_id);
CREATE INDEX IF NOT EXISTS idx_travaux_site ON travaux(site_id);

-- RLS
ALTER TABLE travaux ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "travaux_all" ON travaux;
  CREATE POLICY "travaux_all" ON travaux
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 7. TABLE SAV (si n'existe pas)
-- ============================================================
CREATE TABLE IF NOT EXISTS sav (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id) ON DELETE CASCADE,
  client_id           uuid REFERENCES clients(id) ON DELETE SET NULL,
  site_id             uuid REFERENCES sites(id) ON DELETE SET NULL,
  technicien_id       uuid REFERENCES techniciens(id) ON DELETE SET NULL,
  numero_ticket       text,
  titre               text NOT NULL,
  description         text,
  type_probleme       text,
  priorite            text DEFAULT 'normale',
  statut              text DEFAULT 'nouveau',
  date_signalement    timestamptz DEFAULT now(),
  date_prise_en_charge timestamptz,
  date_resolution     timestamptz,
  solution            text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sav_org ON sav(organisation_id);
CREATE INDEX IF NOT EXISTS idx_sav_statut ON sav(statut);

-- RLS
ALTER TABLE sav ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "sav_all" ON sav;
  CREATE POLICY "sav_all" ON sav
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- VÉRIFICATIONS
-- ============================================================
SELECT '=== TABLES CRÉÉES ===' AS status;

SELECT 'demo_sessions: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'demo_sessions'
)::text;

SELECT 'onboarding_progress: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_progress'
)::text;

SELECT 'alertes: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'alertes'
)::text;

SELECT 'devis: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'devis'
)::text;

SELECT 'factures: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'factures'
)::text;

SELECT 'travaux: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'travaux'
)::text;

SELECT 'sav: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'sav'
)::text;

SELECT '=== SCRIPT TERMINÉ ===' AS result;
