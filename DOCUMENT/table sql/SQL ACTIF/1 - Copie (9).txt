-- ============================================================
-- EASY INCENDIE - SCRIPT SQL DÉFINITIF V5
-- ============================================================
-- 
-- FUSION COMPLÈTE de:
-- - SOLUTION_COMPLETE_FLUX.sql (structure originale)
-- - Corrections des colonnes (structure BDD réelle)
-- - Ordre d'exécution corrigé (éviter erreurs dépendances)
--
-- Ce script contient:
-- 1. Suppression des policies (AVANT la fonction)
-- 2. Recréation de la fonction get_user_organisation_id
-- 3. Création des tables SI elles n'existent pas
-- 4. Ajout des colonnes manquantes
-- 5. Recréation des policies RLS
-- 6. Fonctions RPC complete_registration CORRIGÉE
-- 7. Fonction RPC create_subscription
-- 8. Vérifications finales
--
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : SUPPRIMER TOUTES LES POLICIES D'ABORD
-- (OBLIGATOIRE pour éviter l'erreur "cannot drop function 
-- get_user_organisation_id() because other objects depend on it")
-- ============================================================

-- Policies demandes_prospects
DROP POLICY IF EXISTS "prospects_insert_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_anon" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_own" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_own" ON demandes_prospects;

-- Policies abonnements
DROP POLICY IF EXISTS "abonnements_select_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update_policy" ON abonnements;
DROP POLICY IF EXISTS "abo_select" ON abonnements;
DROP POLICY IF EXISTS "abo_insert" ON abonnements;
DROP POLICY IF EXISTS "abo_update" ON abonnements;
DROP POLICY IF EXISTS "abonnements_select" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update" ON abonnements;

-- Policies organisations
DROP POLICY IF EXISTS "organisations_select_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_insert_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_update_policy" ON organisations;
DROP POLICY IF EXISTS "org_select" ON organisations;
DROP POLICY IF EXISTS "org_update" ON organisations;
DROP POLICY IF EXISTS "org_insert" ON organisations;

-- Policies utilisateurs
DROP POLICY IF EXISTS "utilisateurs_select_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_insert_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_update_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_delete_policy" ON utilisateurs;
DROP POLICY IF EXISTS "users_select" ON utilisateurs;
DROP POLICY IF EXISTS "users_insert" ON utilisateurs;
DROP POLICY IF EXISTS "users_update" ON utilisateurs;
DROP POLICY IF EXISTS "users_delete" ON utilisateurs;

-- Policies onboarding_progress
DROP POLICY IF EXISTS "onboarding_select" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_select_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update_policy" ON onboarding_progress;

-- ============================================================
-- ÉTAPE 2 : Maintenant on peut supprimer et recréer la fonction
-- ============================================================

DROP FUNCTION IF EXISTS public.get_user_organisation_id();

CREATE OR REPLACE FUNCTION public.get_user_organisation_id()
RETURNS UUID AS $$
  SELECT organisation_id 
  FROM public.utilisateurs 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- ÉTAPE 3 : Ajouter auth_id à utilisateurs si n'existe pas
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'utilisateurs' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE utilisateurs ADD COLUMN auth_id UUID;
    CREATE INDEX IF NOT EXISTS idx_utilisateurs_auth_id ON utilisateurs(auth_id);
    RAISE NOTICE '✅ Colonne auth_id ajoutée';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne auth_id existe déjà';
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 4 : Créer les tables SI elles n'existent pas
-- ============================================================

-- Table demandes_prospects
CREATE TABLE IF NOT EXISTS demandes_prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id),
  email TEXT,
  telephone TEXT,
  domaines_demandes TEXT[],
  profil_demande TEXT,
  nb_utilisateurs TEXT,
  tarif_calcule DECIMAL(10,2),
  options_selectionnees JSONB DEFAULT '{}',
  source TEXT DEFAULT 'landing',
  converti BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table abonnements
CREATE TABLE IF NOT EXISTS abonnements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  formule TEXT DEFAULT 'starter',
  statut TEXT DEFAULT 'trial',
  domaines_actifs TEXT[] DEFAULT ARRAY['SSI'],
  nb_utilisateurs_max INTEGER DEFAULT 1,
  nb_sites_max INTEGER DEFAULT 10,
  prix_mensuel_ht DECIMAL(10,2),
  options JSONB DEFAULT '{}',
  date_debut DATE DEFAULT CURRENT_DATE,
  date_fin DATE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table onboarding_progress
-- ⚠️ COLONNES RÉELLES: step_profil, step_logo, step_client, etc.
-- ❌ N'EXISTENT PAS: etape_actuelle, etapes_completees, donnees_temporaires
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  step_profil BOOLEAN DEFAULT false,
  step_logo BOOLEAN DEFAULT false,
  step_client BOOLEAN DEFAULT false,
  step_site BOOLEAN DEFAULT false,
  step_equipement BOOLEAN DEFAULT false,
  step_technicien BOOLEAN DEFAULT false,
  step_rapport BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter contrainte unique sur organisation_id si n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_progress_org_unique'
  ) THEN
    BEGIN
      ALTER TABLE onboarding_progress ADD CONSTRAINT onboarding_progress_org_unique UNIQUE(organisation_id);
      RAISE NOTICE '✅ Contrainte unique ajoutée sur onboarding_progress';
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'ℹ️ Contrainte existe déjà';
    END;
  ELSE
    RAISE NOTICE 'ℹ️ Contrainte onboarding_progress_org_unique existe déjà';
  END IF;
END $$;

-- Ajouter colonne modules_actifs à organisations si manquante
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organisations' AND column_name = 'modules_actifs'
  ) THEN
    ALTER TABLE organisations ADD COLUMN modules_actifs TEXT[] DEFAULT ARRAY['SSI'];
    RAISE NOTICE '✅ Colonne modules_actifs ajoutée à organisations';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne modules_actifs existe déjà';
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 5 : RLS pour demandes_prospects
-- CRITIQUE: Permettre INSERT ANONYME (avant que l'user soit confirmé)
-- ============================================================

ALTER TABLE demandes_prospects ENABLE ROW LEVEL SECURITY;

-- Permettre INSERT ANONYME (avant confirmation email)
CREATE POLICY "prospects_insert_anon" ON demandes_prospects
  FOR INSERT WITH CHECK (true);

-- Permettre SELECT pour l'utilisateur connecté (par email)
CREATE POLICY "prospects_select_own" ON demandes_prospects
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organisation_id = public.get_user_organisation_id()
  );

-- Permettre UPDATE pour marquer comme converti
CREATE POLICY "prospects_update_own" ON demandes_prospects
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organisation_id = public.get_user_organisation_id()
  );

-- ============================================================
-- ÉTAPE 6 : RLS pour abonnements
-- ============================================================

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abonnements_select" ON abonnements
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "abonnements_insert" ON abonnements
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "abonnements_update" ON abonnements
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 7 : RLS pour organisations (permettre INSERT pour inscription)
-- ============================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON organisations
  FOR SELECT USING (id = public.get_user_organisation_id());

-- INSERT géré par RPC SECURITY DEFINER
CREATE POLICY "org_insert" ON organisations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "org_update" ON organisations
  FOR UPDATE USING (id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 8 : RLS pour utilisateurs
-- ============================================================

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON utilisateurs
  FOR SELECT USING (
    organisation_id = public.get_user_organisation_id()
    OR auth_id = auth.uid()
  );

CREATE POLICY "users_insert" ON utilisateurs
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users_update" ON utilisateurs
  FOR UPDATE USING (
    organisation_id = public.get_user_organisation_id()
    OR auth_id = auth.uid()
  );

CREATE POLICY "users_delete" ON utilisateurs
  FOR DELETE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 9 : RLS pour onboarding_progress
-- ============================================================

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_select" ON onboarding_progress
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "onboarding_insert" ON onboarding_progress
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "onboarding_update" ON onboarding_progress
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 10 : Fonction RPC complete_registration (BYPASS RLS)
-- ============================================================
-- 
-- ⚠️ IMPORTANT: Cette fonction utilise UNIQUEMENT les colonnes
-- qui EXISTENT RÉELLEMENT dans la base de données !
--
-- COLONNES RÉELLES de la table organisations:
-- id, nom, siret, siren, adresse, code_postal, ville, telephone, 
-- email, site_web, forme_juridique, capital, tva_intra, ape_naf, 
-- created_at, updated_at, modules_actifs
--
-- ❌ N'EXISTENT PAS (erreur dans l'ancien script):
-- formule, module_ssi, module_desenfumage, module_portes_cf, 
-- module_baes, module_extincteurs, module_ria, actif
--
-- ============================================================

DROP FUNCTION IF EXISTS public.complete_registration(text, text, text, text, text, text, text[], text, integer);

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
    -- Retourner les infos existantes au lieu d'erreur
    RETURN jsonb_build_object(
      'success', true,
      'already_exists', true,
      'organisation_id', v_org_id,
      'user_id', v_user_id
    );
  END IF;
  
  -- ============================================================
  -- CRÉER L'ORGANISATION
  -- Utilise UNIQUEMENT les colonnes qui EXISTENT RÉELLEMENT
  -- ============================================================
  INSERT INTO organisations (
    nom, siret, ville, email, telephone, modules_actifs
  ) VALUES (
    p_entreprise, p_siret, p_ville, v_email, p_telephone, p_domaines
  )
  RETURNING id INTO v_org_id;
  
  -- Créer l'utilisateur
  INSERT INTO utilisateurs (
    organisation_id, auth_id, email, nom, prenom, telephone, role, actif
  ) VALUES (
    v_org_id, v_auth_id, v_email, p_nom, p_prenom, p_telephone, 'admin', true
  )
  RETURNING id INTO v_user_id;
  
  -- ============================================================
  -- CRÉER L'ONBOARDING PROGRESS
  -- Utilise les VRAIES colonnes: step_profil, step_logo, etc.
  -- ❌ N'existent pas: etape_actuelle, etapes_completees
  -- ============================================================
  INSERT INTO onboarding_progress (
    organisation_id, step_profil, completed
  ) VALUES (
    v_org_id, true, false
  )
  ON CONFLICT (organisation_id) DO NOTHING;
  
  -- Mettre à jour le prospect si existe (lier à l'organisation)
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

-- ============================================================
-- ÉTAPE 11 : Fonction RPC create_subscription (BYPASS RLS)
-- ============================================================

DROP FUNCTION IF EXISTS public.create_subscription(text[], integer, numeric, jsonb);

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
  -- Récupérer l'organisation de l'utilisateur
  v_org_id := public.get_user_organisation_id();
  v_email := auth.jwt() ->> 'email';
  
  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organisation non trouvée');
  END IF;
  
  -- Vérifier si un abonnement actif existe déjà
  SELECT id INTO v_sub_id FROM abonnements 
  WHERE organisation_id = v_org_id AND statut IN ('active', 'trial')
  LIMIT 1;
  
  IF v_sub_id IS NOT NULL THEN
    -- Mettre à jour l'abonnement existant
    UPDATE abonnements SET
      domaines_actifs = p_domaines,
      nb_utilisateurs_max = p_nb_utilisateurs,
      prix_mensuel_ht = p_prix_mensuel,
      options = p_options,
      statut = 'active',
      updated_at = NOW()
    WHERE id = v_sub_id;
  ELSE
    -- Créer un nouvel abonnement
    INSERT INTO abonnements (
      organisation_id, formule, statut, domaines_actifs,
      nb_utilisateurs_max, prix_mensuel_ht, options, date_debut
    ) VALUES (
      v_org_id, 'custom', 'active', p_domaines,
      p_nb_utilisateurs, p_prix_mensuel, p_options, CURRENT_DATE
    )
    RETURNING id INTO v_sub_id;
  END IF;
  
  -- Mettre à jour l'organisation
  UPDATE organisations SET
    modules_actifs = p_domaines,
    updated_at = NOW()
  WHERE id = v_org_id;
  
  -- Marquer le prospect comme converti
  UPDATE demandes_prospects SET
    converti = true
  WHERE (email = v_email OR organisation_id = v_org_id)
    AND converti = false;
  
  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'organisation_id', v_org_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VÉRIFICATIONS FINALES
-- ============================================================

SELECT '=== VÉRIFICATIONS ===' AS status;

-- Vérifier auth_id
SELECT 'auth_id exists: ' || EXISTS(
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'utilisateurs' AND column_name = 'auth_id'
)::text AS check_1;

-- Vérifier les fonctions
SELECT 'get_user_organisation_id exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'get_user_organisation_id'
)::text AS check_2;

SELECT 'complete_registration exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'complete_registration'
)::text AS check_3;

SELECT 'create_subscription exists: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'create_subscription'
)::text AS check_4;

-- Vérifier les tables
SELECT 'demandes_prospects exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'demandes_prospects'
)::text AS check_5;

SELECT 'abonnements exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'abonnements'
)::text AS check_6;

SELECT 'onboarding_progress exists: ' || EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_progress'
)::text AS check_7;

SELECT 'modules_actifs in organisations: ' || EXISTS(
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'organisations' AND column_name = 'modules_actifs'
)::text AS check_8;

-- ============================================================
-- FIN DU SCRIPT V5 DÉFINITIF
-- 
-- RÉSULTAT ATTENDU (8 vérifications):
-- ✅ check_1: auth_id exists: true
-- ✅ check_2: get_user_organisation_id exists: true
-- ✅ check_3: complete_registration exists: true
-- ✅ check_4: create_subscription exists: true
-- ✅ check_5: demandes_prospects exists: true
-- ✅ check_6: abonnements exists: true
-- ✅ check_7: onboarding_progress exists: true
-- ✅ check_8: modules_actifs in organisations: true
-- ============================================================
