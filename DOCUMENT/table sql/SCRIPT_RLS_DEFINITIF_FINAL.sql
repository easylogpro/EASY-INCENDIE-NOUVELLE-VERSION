-- ============================================================
-- EASY INCENDIE - SCRIPT RLS DÉFINITIF FINAL
-- ============================================================
--
-- CE SCRIPT REMPLACE TOUS LES AUTRES !
--
-- Il fait:
-- 1. Supprime TOUTES les anciennes policies (évite conflits)
-- 2. Supprime les fonctions en double
-- 3. Crée UNE SEULE fonction helper (anti-boucle infinie)
-- 4. Crée des policies propres pour TOUTES les tables
-- 5. Gère les cas spéciaux (anon insert, etc.)
--
-- IMPORTANT: Exécuter ce script EN ENTIER dans Supabase SQL Editor
--
-- ============================================================

-- ============================================================
-- PARTIE 1: NETTOYAGE COMPLET DES ANCIENNES POLICIES
-- ============================================================

-- ORGANISATIONS
DROP POLICY IF EXISTS "org_insert" ON organisations;
DROP POLICY IF EXISTS "org_select" ON organisations;
DROP POLICY IF EXISTS "org_update" ON organisations;
DROP POLICY IF EXISTS "org_delete" ON organisations;
DROP POLICY IF EXISTS "organisations_select_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_insert_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_update_policy" ON organisations;
DROP POLICY IF EXISTS "rls_organisations" ON organisations;

-- UTILISATEURS
DROP POLICY IF EXISTS "user_insert" ON utilisateurs;
DROP POLICY IF EXISTS "user_select" ON utilisateurs;
DROP POLICY IF EXISTS "user_update" ON utilisateurs;
DROP POLICY IF EXISTS "user_delete" ON utilisateurs;
DROP POLICY IF EXISTS "users_insert" ON utilisateurs;
DROP POLICY IF EXISTS "users_select" ON utilisateurs;
DROP POLICY IF EXISTS "users_update" ON utilisateurs;
DROP POLICY IF EXISTS "users_delete" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_select_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_insert_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_update_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_delete_policy" ON utilisateurs;
DROP POLICY IF EXISTS "rls_utilisateurs" ON utilisateurs;

-- ABONNEMENTS
DROP POLICY IF EXISTS "rls_abonnements" ON abonnements;
DROP POLICY IF EXISTS "abonnements_select" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update" ON abonnements;
DROP POLICY IF EXISTS "abonnements_delete" ON abonnements;
DROP POLICY IF EXISTS "abonnements_select_own_org" ON abonnements;
DROP POLICY IF EXISTS "abonnements_select_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update_policy" ON abonnements;
DROP POLICY IF EXISTS "abo_select" ON abonnements;
DROP POLICY IF EXISTS "abo_insert" ON abonnements;
DROP POLICY IF EXISTS "abo_update" ON abonnements;

-- DEMANDES_PROSPECTS
DROP POLICY IF EXISTS "rls_demandes_prospects" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_anon" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_own" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_own" ON demandes_prospects;
DROP POLICY IF EXISTS "anon_insert_demandes_prospects" ON demandes_prospects;
DROP POLICY IF EXISTS "auth_select_own_demandes_prospects" ON demandes_prospects;
DROP POLICY IF EXISTS "allow_anon_insert" ON demandes_prospects;
DROP POLICY IF EXISTS "allow_authenticated_select" ON demandes_prospects;
DROP POLICY IF EXISTS "allow_authenticated_update" ON demandes_prospects;

-- ONBOARDING_PROGRESS
DROP POLICY IF EXISTS "rls_onboarding_progress" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_select" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_delete" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_select_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update_policy" ON onboarding_progress;

-- DEMO_SESSIONS
DROP POLICY IF EXISTS "rls_demo_sessions" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_select" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_insert" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_update" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_delete" ON demo_sessions;

-- CLIENTS
DROP POLICY IF EXISTS "rls_clients" ON clients;
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

-- SITES
DROP POLICY IF EXISTS "rls_sites" ON sites;
DROP POLICY IF EXISTS "sites_select" ON sites;
DROP POLICY IF EXISTS "sites_insert" ON sites;
DROP POLICY IF EXISTS "sites_update" ON sites;
DROP POLICY IF EXISTS "sites_delete" ON sites;

-- TECHNICIENS
DROP POLICY IF EXISTS "rls_techniciens" ON techniciens;
DROP POLICY IF EXISTS "techniciens_select" ON techniciens;
DROP POLICY IF EXISTS "techniciens_insert" ON techniciens;
DROP POLICY IF EXISTS "techniciens_update" ON techniciens;
DROP POLICY IF EXISTS "techniciens_delete" ON techniciens;

-- VEHICULES
DROP POLICY IF EXISTS "rls_vehicules" ON vehicules;
DROP POLICY IF EXISTS "vehicules_select" ON vehicules;
DROP POLICY IF EXISTS "vehicules_insert" ON vehicules;
DROP POLICY IF EXISTS "vehicules_update" ON vehicules;
DROP POLICY IF EXISTS "vehicules_delete" ON vehicules;

-- CONTRATS
DROP POLICY IF EXISTS "rls_contrats" ON contrats;
DROP POLICY IF EXISTS "contrats_select" ON contrats;
DROP POLICY IF EXISTS "contrats_insert" ON contrats;
DROP POLICY IF EXISTS "contrats_update" ON contrats;
DROP POLICY IF EXISTS "contrats_delete" ON contrats;

-- ALERTES
DROP POLICY IF EXISTS "rls_alertes" ON alertes;
DROP POLICY IF EXISTS "alertes_select" ON alertes;
DROP POLICY IF EXISTS "alertes_insert" ON alertes;
DROP POLICY IF EXISTS "alertes_update" ON alertes;
DROP POLICY IF EXISTS "alertes_delete" ON alertes;

-- SAV
DROP POLICY IF EXISTS "rls_sav" ON sav;
DROP POLICY IF EXISTS "sav_select" ON sav;
DROP POLICY IF EXISTS "sav_insert" ON sav;
DROP POLICY IF EXISTS "sav_update" ON sav;
DROP POLICY IF EXISTS "sav_delete" ON sav;

-- GROUPES
DROP POLICY IF EXISTS "rls_groupes" ON groupes;
DROP POLICY IF EXISTS "groupes_select" ON groupes;
DROP POLICY IF EXISTS "groupes_insert" ON groupes;
DROP POLICY IF EXISTS "groupes_update" ON groupes;
DROP POLICY IF EXISTS "groupes_delete" ON groupes;

-- ASTREINTES
DROP POLICY IF EXISTS "rls_astreintes" ON astreintes;
DROP POLICY IF EXISTS "astreintes_select" ON astreintes;
DROP POLICY IF EXISTS "astreintes_insert" ON astreintes;
DROP POLICY IF EXISTS "astreintes_update" ON astreintes;
DROP POLICY IF EXISTS "astreintes_delete" ON astreintes;

-- SOUS_TRAITANTS
DROP POLICY IF EXISTS "rls_sous_traitants" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_select" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_insert" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_update" ON sous_traitants;
DROP POLICY IF EXISTS "sous_traitants_delete" ON sous_traitants;

-- OBSERVATIONS
DROP POLICY IF EXISTS "rls_observations" ON observations;
DROP POLICY IF EXISTS "observations_select" ON observations;
DROP POLICY IF EXISTS "observations_insert" ON observations;
DROP POLICY IF EXISTS "observations_update" ON observations;
DROP POLICY IF EXISTS "observations_delete" ON observations;

-- TRAVAUX
DROP POLICY IF EXISTS "rls_travaux" ON travaux;
DROP POLICY IF EXISTS "travaux_select" ON travaux;
DROP POLICY IF EXISTS "travaux_insert" ON travaux;
DROP POLICY IF EXISTS "travaux_update" ON travaux;
DROP POLICY IF EXISTS "travaux_delete" ON travaux;

-- DEVIS
DROP POLICY IF EXISTS "rls_devis" ON devis;
DROP POLICY IF EXISTS "devis_select" ON devis;
DROP POLICY IF EXISTS "devis_insert" ON devis;
DROP POLICY IF EXISTS "devis_update" ON devis;
DROP POLICY IF EXISTS "devis_delete" ON devis;

-- FACTURES
DROP POLICY IF EXISTS "rls_factures" ON factures;
DROP POLICY IF EXISTS "factures_select" ON factures;
DROP POLICY IF EXISTS "factures_insert" ON factures;
DROP POLICY IF EXISTS "factures_update" ON factures;
DROP POLICY IF EXISTS "factures_delete" ON factures;

-- PARAMETRES
DROP POLICY IF EXISTS "rls_parametres" ON parametres;
DROP POLICY IF EXISTS "parametres_select" ON parametres;
DROP POLICY IF EXISTS "parametres_insert" ON parametres;
DROP POLICY IF EXISTS "parametres_update" ON parametres;
DROP POLICY IF EXISTS "parametres_delete" ON parametres;

-- EMAIL_LOGS
DROP POLICY IF EXISTS "rls_email_logs" ON email_logs;
DROP POLICY IF EXISTS "email_logs_select" ON email_logs;
DROP POLICY IF EXISTS "email_logs_insert" ON email_logs;
DROP POLICY IF EXISTS "email_logs_update" ON email_logs;

-- FICHIERS
DROP POLICY IF EXISTS "rls_fichiers" ON fichiers;

-- LOGS_ACTIVITE
DROP POLICY IF EXISTS "rls_logs_activite" ON logs_activite;

-- LOGS_IMPORTS_EXPORTS
DROP POLICY IF EXISTS "rls_logs_imports_exports" ON logs_imports_exports;

-- LIGNES_DEVIS
DROP POLICY IF EXISTS "rls_lignes_devis" ON lignes_devis;

-- LIGNES_FACTURES
DROP POLICY IF EXISTS "rls_lignes_factures" ON lignes_factures;

-- EQUIPEMENTS_*
DROP POLICY IF EXISTS "rls_equipements_ssi" ON equipements_ssi;
DROP POLICY IF EXISTS "rls_equipements_dsf" ON equipements_dsf;
DROP POLICY IF EXISTS "rls_equipements_cmp" ON equipements_cmp;
DROP POLICY IF EXISTS "rls_equipements_baes" ON equipements_baes;
DROP POLICY IF EXISTS "rls_equipements_ext" ON equipements_ext;
DROP POLICY IF EXISTS "rls_equipements_ria" ON equipements_ria;
DROP POLICY IF EXISTS "rls_equipements_colsec" ON equipements_colsec;

-- MAINTENANCES_*
DROP POLICY IF EXISTS "rls_maintenances_ssi" ON maintenances_ssi;
DROP POLICY IF EXISTS "rls_maintenances_dsf_naturel" ON maintenances_dsf_naturel;
DROP POLICY IF EXISTS "rls_maintenances_dsf_mecanique" ON maintenances_dsf_mecanique;
DROP POLICY IF EXISTS "rls_maintenances_cmp" ON maintenances_cmp;
DROP POLICY IF EXISTS "rls_maintenances_baes" ON maintenances_baes;
DROP POLICY IF EXISTS "rls_maintenances_ext" ON maintenances_ext;
DROP POLICY IF EXISTS "rls_maintenances_ria" ON maintenances_ria;
DROP POLICY IF EXISTS "rls_maintenances_colsec" ON maintenances_colsec;

-- MISES_EN_SERVICE_SSI
DROP POLICY IF EXISTS "rls_mises_en_service_ssi" ON mises_en_service_ssi;

-- ============================================================
-- PARTIE 2: SUPPRESSION DES FONCTIONS EN DOUBLE
-- ============================================================

DROP FUNCTION IF EXISTS public.get_user_organisation_id();
DROP FUNCTION IF EXISTS public.get_my_org_id();

-- ============================================================
-- PARTIE 3: CRÉATION DE LA FONCTION HELPER UNIQUE
-- ============================================================
--
-- SECURITY DEFINER = s'exécute avec les droits du créateur
-- Cela évite la boucle infinie car la fonction peut lire
-- la table utilisateurs sans passer par RLS
--
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organisation_id
  FROM public.utilisateurs
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- Alias pour compatibilité avec ancien code
CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.get_my_org_id();
$$;

-- ============================================================
-- PARTIE 4: ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniciens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sav ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE travaux ENABLE ROW LEVEL SECURITY;

-- Tables optionnelles (IF EXISTS pour éviter erreurs)
DO $$ BEGIN ALTER TABLE groupes ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE astreintes ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE sous_traitants ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE observations ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE parametres ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE fichiers ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE logs_activite ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE logs_imports_exports ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE lignes_devis ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE lignes_factures ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_ssi ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_dsf ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_cmp ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_baes ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_ext ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_ria ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE equipements_colsec ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_ssi ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_dsf_naturel ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_dsf_mecanique ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_cmp ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_baes ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_ext ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_ria ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE maintenances_colsec ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE mises_en_service_ssi ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================
-- PARTIE 5: POLICIES POUR TABLES SPÉCIALES
-- ============================================================

-- ---------------------------------------------
-- 5.1 ORGANISATIONS
-- INSERT: Autorisé pour tous (géré par RPC SECURITY DEFINER)
-- SELECT/UPDATE: Seulement sa propre organisation
-- ---------------------------------------------
CREATE POLICY "org_insert" ON organisations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "org_select" ON organisations
  FOR SELECT TO authenticated
  USING (id = public.get_my_org_id());

CREATE POLICY "org_update" ON organisations
  FOR UPDATE TO authenticated
  USING (id = public.get_my_org_id())
  WITH CHECK (id = public.get_my_org_id());

-- ---------------------------------------------
-- 5.2 UTILISATEURS
-- INSERT: L'utilisateur peut créer son propre profil
-- SELECT: Voir son profil OU les membres de son organisation
-- UPDATE: Seulement son propre profil
-- DELETE: Admin peut supprimer membres de son org
-- ---------------------------------------------
CREATE POLICY "user_insert" ON utilisateurs
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "user_select" ON utilisateurs
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid()
    OR organisation_id = public.get_my_org_id()
  );

CREATE POLICY "user_update" ON utilisateurs
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "user_delete" ON utilisateurs
  FOR DELETE TO authenticated
  USING (organisation_id = public.get_my_org_id() AND auth_id != auth.uid());

-- ---------------------------------------------
-- 5.3 DEMANDES_PROSPECTS (cas spécial: INSERT anonyme)
-- INSERT: TOUT LE MONDE (anon + authenticated) - Landing page
-- SELECT: Utilisateur connecté voit ses propres prospects
-- UPDATE: Utilisateur connecté peut mettre à jour
-- ---------------------------------------------
CREATE POLICY "prospects_insert" ON demandes_prospects
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "prospects_select" ON demandes_prospects
  FOR SELECT TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
    OR organisation_id = public.get_my_org_id()
  );

CREATE POLICY "prospects_update" ON demandes_prospects
  FOR UPDATE TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
    OR organisation_id = public.get_my_org_id()
  )
  WITH CHECK (true);

-- ---------------------------------------------
-- 5.4 ABONNEMENTS
-- ---------------------------------------------
CREATE POLICY "abo_select" ON abonnements
  FOR SELECT TO authenticated
  USING (organisation_id = public.get_my_org_id());

CREATE POLICY "abo_insert" ON abonnements
  FOR INSERT TO authenticated
  WITH CHECK (organisation_id = public.get_my_org_id());

CREATE POLICY "abo_update" ON abonnements
  FOR UPDATE TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- ============================================================
-- PARTIE 6: POLICIES POUR TABLES MÉTIER STANDARD
-- Toutes utilisent le même pattern: organisation_id = get_my_org_id()
-- ============================================================

-- CLIENTS
CREATE POLICY "clients_all" ON clients
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- SITES
CREATE POLICY "sites_all" ON sites
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- TECHNICIENS
CREATE POLICY "techniciens_all" ON techniciens
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- VEHICULES
CREATE POLICY "vehicules_all" ON vehicules
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- CONTRATS
CREATE POLICY "contrats_all" ON contrats
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- ALERTES
CREATE POLICY "alertes_all" ON alertes
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- SAV
CREATE POLICY "sav_all" ON sav
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- DEVIS
CREATE POLICY "devis_all" ON devis
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- FACTURES
CREATE POLICY "factures_all" ON factures
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- TRAVAUX
CREATE POLICY "travaux_all" ON travaux
  FOR ALL TO authenticated
  USING (organisation_id = public.get_my_org_id())
  WITH CHECK (organisation_id = public.get_my_org_id());

-- ============================================================
-- PARTIE 7: POLICIES POUR TABLES OPTIONNELLES
-- (Si la table n'existe pas, on ignore)
-- ============================================================

-- GROUPES
DO $$ BEGIN
  CREATE POLICY "groupes_all" ON groupes
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ASTREINTES
DO $$ BEGIN
  CREATE POLICY "astreintes_all" ON astreintes
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- SOUS_TRAITANTS
DO $$ BEGIN
  CREATE POLICY "sous_traitants_all" ON sous_traitants
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- OBSERVATIONS
DO $$ BEGIN
  CREATE POLICY "observations_all" ON observations
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ONBOARDING_PROGRESS
DO $$ BEGIN
  CREATE POLICY "onboarding_all" ON onboarding_progress
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- DEMO_SESSIONS
DO $$ BEGIN
  CREATE POLICY "demo_sessions_all" ON demo_sessions
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- PARAMETRES
DO $$ BEGIN
  CREATE POLICY "parametres_all" ON parametres
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- EMAIL_LOGS
DO $$ BEGIN
  CREATE POLICY "email_logs_all" ON email_logs
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- FICHIERS
DO $$ BEGIN
  CREATE POLICY "fichiers_all" ON fichiers
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- LOGS_ACTIVITE
DO $$ BEGIN
  CREATE POLICY "logs_activite_all" ON logs_activite
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- LOGS_IMPORTS_EXPORTS
DO $$ BEGIN
  CREATE POLICY "logs_imports_exports_all" ON logs_imports_exports
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================
-- PARTIE 8: POLICIES POUR TABLES SANS organisation_id
-- (Accès via clé étrangère vers une table parent)
-- ============================================================

-- LIGNES_DEVIS (accès via devis_id)
DO $$ BEGIN
  CREATE POLICY "lignes_devis_all" ON lignes_devis
    FOR ALL TO authenticated
    USING (
      devis_id IN (
        SELECT id FROM devis WHERE organisation_id = public.get_my_org_id()
      )
    )
    WITH CHECK (
      devis_id IN (
        SELECT id FROM devis WHERE organisation_id = public.get_my_org_id()
      )
    );
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- LIGNES_FACTURES (accès via facture_id)
DO $$ BEGIN
  CREATE POLICY "lignes_factures_all" ON lignes_factures
    FOR ALL TO authenticated
    USING (
      facture_id IN (
        SELECT id FROM factures WHERE organisation_id = public.get_my_org_id()
      )
    )
    WITH CHECK (
      facture_id IN (
        SELECT id FROM factures WHERE organisation_id = public.get_my_org_id()
      )
    );
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================
-- PARTIE 9: POLICIES POUR TABLES ÉQUIPEMENTS
-- ============================================================

DO $$ BEGIN
  CREATE POLICY "equipements_ssi_all" ON equipements_ssi
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_dsf_all" ON equipements_dsf
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_cmp_all" ON equipements_cmp
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_baes_all" ON equipements_baes
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_ext_all" ON equipements_ext
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_ria_all" ON equipements_ria
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "equipements_colsec_all" ON equipements_colsec
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================
-- PARTIE 10: POLICIES POUR TABLES MAINTENANCES
-- ============================================================

DO $$ BEGIN
  CREATE POLICY "maintenances_ssi_all" ON maintenances_ssi
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_dsf_naturel_all" ON maintenances_dsf_naturel
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_dsf_mecanique_all" ON maintenances_dsf_mecanique
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_cmp_all" ON maintenances_cmp
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_baes_all" ON maintenances_baes
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_ext_all" ON maintenances_ext
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_ria_all" ON maintenances_ria
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "maintenances_colsec_all" ON maintenances_colsec
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- MISES_EN_SERVICE_SSI
DO $$ BEGIN
  CREATE POLICY "mises_en_service_ssi_all" ON mises_en_service_ssi
    FOR ALL TO authenticated
    USING (organisation_id = public.get_my_org_id())
    WITH CHECK (organisation_id = public.get_my_org_id());
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================================
-- PARTIE 11: FONCTIONS RPC (BYPASS RLS)
-- ============================================================

-- Suppression des anciennes versions
DROP FUNCTION IF EXISTS public.complete_registration(text, text, text, text, text, text, text[], text, integer);

-- FONCTION: complete_registration
-- Appelée après confirmation email pour créer organisation + utilisateur
CREATE OR REPLACE FUNCTION public.complete_registration(
  p_nom TEXT,
  p_prenom TEXT,
  p_telephone TEXT,
  p_entreprise TEXT,
  p_siret TEXT DEFAULT NULL,
  p_ville TEXT DEFAULT NULL,
  p_domaines TEXT[] DEFAULT ARRAY['SSI'],
  p_formule TEXT DEFAULT 'starter',
  p_nb_utilisateurs INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_auth_id UUID;
  v_email TEXT;
  v_org_id UUID;
  v_user_id UUID;
  v_prospect_id UUID;
BEGIN
  -- Récupérer l'ID et email de l'utilisateur authentifié
  v_auth_id := auth.uid();
  v_email := auth.jwt() ->> 'email';

  IF v_auth_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non authentifié');
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  SELECT id, organisation_id INTO v_user_id, v_org_id
  FROM utilisateurs WHERE auth_id = v_auth_id;

  IF v_user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_exists', true,
      'organisation_id', v_org_id,
      'user_id', v_user_id
    );
  END IF;

  -- Créer l'organisation
  INSERT INTO organisations (nom, siret, ville, email, telephone, modules_actifs)
  VALUES (p_entreprise, p_siret, p_ville, v_email, p_telephone, p_domaines)
  RETURNING id INTO v_org_id;

  -- Créer l'utilisateur
  INSERT INTO utilisateurs (organisation_id, auth_id, email, nom, prenom, telephone, role, actif)
  VALUES (v_org_id, v_auth_id, v_email, p_nom, p_prenom, p_telephone, 'admin', true)
  RETURNING id INTO v_user_id;

  -- Créer onboarding_progress si la table existe
  BEGIN
    INSERT INTO onboarding_progress (organisation_id, step_profil, completed)
    VALUES (v_org_id, true, false)
    ON CONFLICT (organisation_id) DO NOTHING;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  -- Lier le prospect à l'organisation
  UPDATE demandes_prospects
  SET organisation_id = v_org_id, converti = false
  WHERE email = v_email AND organisation_id IS NULL
  RETURNING id INTO v_prospect_id;

  RETURN jsonb_build_object(
    'success', true,
    'organisation_id', v_org_id,
    'user_id', v_user_id,
    'prospect_id', v_prospect_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suppression ancienne version
DROP FUNCTION IF EXISTS public.create_subscription(text[], integer, numeric, jsonb);

-- FONCTION: create_subscription
-- Appelée après paiement pour créer/mettre à jour l'abonnement
CREATE OR REPLACE FUNCTION public.create_subscription(
  p_domaines TEXT[],
  p_nb_utilisateurs INTEGER,
  p_prix_mensuel NUMERIC,
  p_options JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_sub_id UUID;
  v_email TEXT;
BEGIN
  v_org_id := public.get_my_org_id();
  v_email := auth.jwt() ->> 'email';

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organisation non trouvée');
  END IF;

  -- Vérifier si abonnement actif existe
  SELECT id INTO v_sub_id FROM abonnements
  WHERE organisation_id = v_org_id AND statut IN ('active', 'trial')
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    -- Mettre à jour
    UPDATE abonnements SET
      domaines_actifs = p_domaines,
      nb_utilisateurs_max = p_nb_utilisateurs,
      prix_mensuel_ht = p_prix_mensuel,
      options = p_options,
      statut = 'active',
      updated_at = NOW()
    WHERE id = v_sub_id;
  ELSE
    -- Créer nouveau
    INSERT INTO abonnements (
      organisation_id, formule, statut, domaines_actifs,
      nb_utilisateurs_max, prix_mensuel_ht, options, date_debut
    ) VALUES (
      v_org_id, 'custom', 'active', p_domaines,
      p_nb_utilisateurs, p_prix_mensuel, p_options, CURRENT_DATE
    )
    RETURNING id INTO v_sub_id;
  END IF;

  -- Mettre à jour modules_actifs de l'organisation
  UPDATE organisations SET modules_actifs = p_domaines, updated_at = NOW()
  WHERE id = v_org_id;

  -- Marquer prospect comme converti
  UPDATE demandes_prospects SET converti = true
  WHERE (email = v_email OR organisation_id = v_org_id) AND converti = false;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'organisation_id', v_org_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTIE 12: VÉRIFICATIONS FINALES
-- ============================================================

SELECT '=== VÉRIFICATIONS FINALES ===' AS status;

-- Vérifier fonctions
SELECT 'get_my_org_id exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'get_my_org_id'
)::text AS check_func_1;

SELECT 'get_user_organisation_id exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'get_user_organisation_id'
)::text AS check_func_2;

SELECT 'complete_registration exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'complete_registration'
)::text AS check_func_3;

SELECT 'create_subscription exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'create_subscription'
)::text AS check_func_4;

-- Compter les policies
SELECT 'Total policies créées: ' || COUNT(*)::text
FROM pg_policies WHERE schemaname = 'public';

-- ============================================================
-- FIN DU SCRIPT RLS DÉFINITIF FINAL
-- ============================================================
--
-- RÉSULTAT ATTENDU:
-- ✅ get_my_org_id exists: true
-- ✅ get_user_organisation_id exists: true
-- ✅ complete_registration exists: true
-- ✅ create_subscription exists: true
-- ✅ Total policies créées: ~50+
--
-- ============================================================
