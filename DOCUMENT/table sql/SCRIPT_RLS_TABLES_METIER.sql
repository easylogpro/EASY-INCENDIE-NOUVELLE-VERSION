-- ============================================================
-- EASY INCENDIE - RLS POUR TOUTES LES TABLES MÉTIER
-- ============================================================
--
-- Ce script complète le V5 en ajoutant les RLS pour:
-- clients, sites, techniciens, vehicules, contrats, alertes,
-- sav, groupes, astreintes, sous_traitants, observations,
-- travaux, devis, factures, demo_sessions
--
-- PRÉREQUIS: Le script V5 doit avoir été exécuté AVANT
-- (il crée la fonction get_user_organisation_id())
--
-- ============================================================

-- ============================================================
-- VÉRIFICATION PRÉREQUIS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_organisation_id') THEN
    RAISE EXCEPTION 'ERREUR: La fonction get_user_organisation_id() n''existe pas. Exécutez d''abord le script V5.';
  END IF;
END $$;

-- ============================================================
-- TABLE: clients
-- ============================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

-- Activer RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Créer les policies
CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: sites
-- ============================================================

DROP POLICY IF EXISTS "sites_select" ON sites;
DROP POLICY IF EXISTS "sites_insert" ON sites;
DROP POLICY IF EXISTS "sites_update" ON sites;
DROP POLICY IF EXISTS "sites_delete" ON sites;

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_select" ON sites
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sites_insert" ON sites
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sites_update" ON sites
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sites_delete" ON sites
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: techniciens
-- ============================================================

DROP POLICY IF EXISTS "techniciens_select" ON techniciens;
DROP POLICY IF EXISTS "techniciens_insert" ON techniciens;
DROP POLICY IF EXISTS "techniciens_update" ON techniciens;
DROP POLICY IF EXISTS "techniciens_delete" ON techniciens;

ALTER TABLE techniciens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "techniciens_select" ON techniciens
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "techniciens_insert" ON techniciens
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "techniciens_update" ON techniciens
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "techniciens_delete" ON techniciens
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: vehicules
-- ============================================================

DROP POLICY IF EXISTS "vehicules_select" ON vehicules;
DROP POLICY IF EXISTS "vehicules_insert" ON vehicules;
DROP POLICY IF EXISTS "vehicules_update" ON vehicules;
DROP POLICY IF EXISTS "vehicules_delete" ON vehicules;

ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicules_select" ON vehicules
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "vehicules_insert" ON vehicules
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "vehicules_update" ON vehicules
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "vehicules_delete" ON vehicules
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: contrats
-- ============================================================

DROP POLICY IF EXISTS "contrats_select" ON contrats;
DROP POLICY IF EXISTS "contrats_insert" ON contrats;
DROP POLICY IF EXISTS "contrats_update" ON contrats;
DROP POLICY IF EXISTS "contrats_delete" ON contrats;

ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contrats_select" ON contrats
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "contrats_insert" ON contrats
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "contrats_update" ON contrats
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "contrats_delete" ON contrats
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: alertes
-- ============================================================

DROP POLICY IF EXISTS "alertes_select" ON alertes;
DROP POLICY IF EXISTS "alertes_insert" ON alertes;
DROP POLICY IF EXISTS "alertes_update" ON alertes;
DROP POLICY IF EXISTS "alertes_delete" ON alertes;

ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alertes_select" ON alertes
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "alertes_insert" ON alertes
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "alertes_update" ON alertes
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "alertes_delete" ON alertes
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: sav
-- ============================================================

DROP POLICY IF EXISTS "sav_select" ON sav;
DROP POLICY IF EXISTS "sav_insert" ON sav;
DROP POLICY IF EXISTS "sav_update" ON sav;
DROP POLICY IF EXISTS "sav_delete" ON sav;

ALTER TABLE sav ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sav_select" ON sav
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sav_insert" ON sav
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sav_update" ON sav
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sav_delete" ON sav
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: groupes
-- ============================================================

DROP POLICY IF EXISTS "groupes_select" ON groupes;
DROP POLICY IF EXISTS "groupes_insert" ON groupes;
DROP POLICY IF EXISTS "groupes_update" ON groupes;
DROP POLICY IF EXISTS "groupes_delete" ON groupes;

ALTER TABLE groupes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groupes_select" ON groupes
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_insert" ON groupes
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_update" ON groupes
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "groupes_delete" ON groupes
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: astreintes
-- ============================================================

DROP POLICY IF EXISTS "astreintes_select" ON astreintes;
DROP POLICY IF EXISTS "astreintes_insert" ON astreintes;
DROP POLICY IF EXISTS "astreintes_update" ON astreintes;
DROP POLICY IF EXISTS "astreintes_delete" ON astreintes;

ALTER TABLE astreintes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "astreintes_select" ON astreintes
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_insert" ON astreintes
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_update" ON astreintes
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "astreintes_delete" ON astreintes
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: sous_traitants
-- ============================================================

DROP POLICY IF EXISTS "sous_traitants_select" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_insert" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_update" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_delete" ON sous_traitants;

ALTER TABLE sous_traitants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sous_traitants_select" ON sous_traitants
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_insert" ON sous_traitants
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_update" ON sous_traitants
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "sous_traitants_delete" ON sous_traitants
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: observations
-- ============================================================

DROP POLICY IF EXISTS "observations_select" ON observations;
DROP POLICY IF EXISTS "observations_insert" ON observations;
DROP POLICY IF EXISTS "observations_update" ON observations;
DROP POLICY IF EXISTS "observations_delete" ON observations;

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "observations_select" ON observations
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_insert" ON observations
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_update" ON observations
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "observations_delete" ON observations
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: travaux
-- ============================================================

DROP POLICY IF EXISTS "travaux_select" ON travaux;
DROP POLICY IF EXISTS "travaux_insert" ON travaux;
DROP POLICY IF EXISTS "travaux_update" ON travaux;
DROP POLICY IF EXISTS "travaux_delete" ON travaux;

ALTER TABLE travaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "travaux_select" ON travaux
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "travaux_insert" ON travaux
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "travaux_update" ON travaux
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "travaux_delete" ON travaux
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: devis
-- ============================================================

DROP POLICY IF EXISTS "devis_select" ON devis;
DROP POLICY IF EXISTS "devis_insert" ON devis;
DROP POLICY IF EXISTS "devis_update" ON devis;
DROP POLICY IF EXISTS "devis_delete" ON devis;

ALTER TABLE devis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devis_select" ON devis
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "devis_insert" ON devis
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "devis_update" ON devis
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "devis_delete" ON devis
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: factures
-- ============================================================

DROP POLICY IF EXISTS "factures_select" ON factures;
DROP POLICY IF EXISTS "factures_insert" ON factures;
DROP POLICY IF EXISTS "factures_update" ON factures;
DROP POLICY IF EXISTS "factures_delete" ON factures;

ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "factures_select" ON factures
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "factures_insert" ON factures
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "factures_update" ON factures
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "factures_delete" ON factures
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- TABLE: demo_sessions
-- ============================================================

DROP POLICY IF EXISTS "demo_sessions_select" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_insert" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_update" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_delete" ON demo_sessions;

ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_sessions_select" ON demo_sessions
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "demo_sessions_insert" ON demo_sessions
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "demo_sessions_update" ON demo_sessions
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "demo_sessions_delete" ON demo_sessions
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================

SELECT '=== RLS TABLES MÉTIER - VÉRIFICATION ===' AS status;

SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS activé' ELSE '❌ RLS désactivé' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'sites', 'techniciens', 'vehicules', 'contrats',
  'alertes', 'sav', 'groupes', 'astreintes', 'sous_traitants',
  'observations', 'travaux', 'devis', 'factures', 'demo_sessions'
)
ORDER BY tablename;

SELECT '=== SCRIPT TERMINÉ AVEC SUCCÈS ===' AS status;

-- ============================================================
-- FIN DU SCRIPT RLS TABLES MÉTIER
-- ============================================================
