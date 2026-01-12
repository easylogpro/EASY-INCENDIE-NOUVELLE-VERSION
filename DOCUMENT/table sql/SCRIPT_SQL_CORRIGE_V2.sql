-- ============================================================
-- EASY INCENDIE - SCRIPT SQL CORRIGÉ V2
-- Basé sur la structure RÉELLE des 43 tables
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : Vérifier que auth_id existe (il existe déjà!)
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
    RAISE NOTICE '✅ Colonne auth_id existe déjà';
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 2 : Corriger get_user_organisation_id()
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
-- ÉTAPE 3 : RLS pour demandes_prospects (INSERT anonyme)
-- ============================================================

ALTER TABLE demandes_prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prospects_insert_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_anon" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_own" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_own" ON demandes_prospects;

-- Permettre INSERT anonyme (avant confirmation email)
CREATE POLICY "prospects_insert_anon" ON demandes_prospects
  FOR INSERT WITH CHECK (true);

-- Permettre SELECT pour l'utilisateur connecté
CREATE POLICY "prospects_select_own" ON demandes_prospects
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organisation_id = public.get_user_organisation_id()
  );

-- Permettre UPDATE
CREATE POLICY "prospects_update_own" ON demandes_prospects
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organisation_id = public.get_user_organisation_id()
  );

-- ============================================================
-- ÉTAPE 4 : RLS pour organisations
-- ============================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organisations_select_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_insert_policy" ON organisations;
DROP POLICY IF EXISTS "organisations_update_policy" ON organisations;
DROP POLICY IF EXISTS "org_select" ON organisations;
DROP POLICY IF EXISTS "org_insert" ON organisations;
DROP POLICY IF EXISTS "org_update" ON organisations;

-- SELECT: voir son organisation
CREATE POLICY "org_select" ON organisations
  FOR SELECT USING (id = public.get_user_organisation_id());

-- INSERT: permettre pour les users authentifiés (via RPC)
CREATE POLICY "org_insert" ON organisations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: modifier son organisation
CREATE POLICY "org_update" ON organisations
  FOR UPDATE USING (id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 5 : RLS pour utilisateurs
-- ============================================================

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "utilisateurs_select_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_insert_policy" ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_update_policy" ON utilisateurs;
DROP POLICY IF EXISTS "users_select" ON utilisateurs;
DROP POLICY IF EXISTS "users_insert" ON utilisateurs;
DROP POLICY IF EXISTS "users_update" ON utilisateurs;
DROP POLICY IF EXISTS "users_delete" ON utilisateurs;

-- SELECT: voir les utilisateurs de son organisation ou soi-même
CREATE POLICY "users_select" ON utilisateurs
  FOR SELECT USING (
    organisation_id = public.get_user_organisation_id()
    OR auth_id = auth.uid()
  );

-- INSERT: créer son propre profil
CREATE POLICY "users_insert" ON utilisateurs
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- UPDATE: modifier les utilisateurs de son organisation
CREATE POLICY "users_update" ON utilisateurs
  FOR UPDATE USING (
    organisation_id = public.get_user_organisation_id()
    OR auth_id = auth.uid()
  );

-- ============================================================
-- ÉTAPE 6 : RLS pour abonnements
-- ============================================================

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "abonnements_select_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert_policy" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update_policy" ON abonnements;
DROP POLICY IF EXISTS "abo_select" ON abonnements;
DROP POLICY IF EXISTS "abo_insert" ON abonnements;
DROP POLICY IF EXISTS "abo_update" ON abonnements;
DROP POLICY IF EXISTS "abonnements_select" ON abonnements;
DROP POLICY IF EXISTS "abonnements_insert" ON abonnements;
DROP POLICY IF EXISTS "abonnements_update" ON abonnements;

CREATE POLICY "abo_select" ON abonnements
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "abo_insert" ON abonnements
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "abo_update" ON abonnements
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 7 : RLS pour onboarding_progress
-- ============================================================

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_select" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_select_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_insert_policy" ON onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update_policy" ON onboarding_progress;

CREATE POLICY "onboarding_select" ON onboarding_progress
  FOR SELECT USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "onboarding_insert" ON onboarding_progress
  FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "onboarding_update" ON onboarding_progress
  FOR UPDATE USING (organisation_id = public.get_user_organisation_id());

-- ============================================================
-- ÉTAPE 8 : Fonction RPC complete_registration (CORRIGÉE!)
-- Utilise les VRAIES colonnes qui existent
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
    RETURN jsonb_build_object(
      'success', true,
      'already_exists', true,
      'organisation_id', v_org_id,
      'user_id', v_user_id
    );
  END IF;
  
  -- 1. Créer l'organisation (COLONNES RÉELLES UNIQUEMENT!)
  INSERT INTO organisations (
    nom, siret, ville, email, telephone, modules_actifs
  ) VALUES (
    p_entreprise, p_siret, p_ville, v_email, p_telephone, p_domaines
  )
  RETURNING id INTO v_org_id;
  
  -- 2. Créer l'utilisateur (COLONNES RÉELLES!)
  INSERT INTO utilisateurs (
    organisation_id, auth_id, email, nom, prenom, telephone, role, actif
  ) VALUES (
    v_org_id, v_auth_id, v_email, p_nom, p_prenom, p_telephone, 'admin', true
  )
  RETURNING id INTO v_user_id;
  
  -- 3. Créer l'onboarding progress (COLONNES RÉELLES: step_xxx, pas etape_actuelle!)
  INSERT INTO onboarding_progress (
    organisation_id, step_profil, completed
  ) VALUES (
    v_org_id, true, false
  )
  ON CONFLICT (organisation_id) DO NOTHING;
  
  -- 4. Mettre à jour le prospect si existe
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
-- ÉTAPE 9 : Fonction RPC create_subscription (CORRIGÉE!)
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
  
  -- Vérifier si un abonnement existe déjà
  SELECT id INTO v_sub_id FROM abonnements 
  WHERE organisation_id = v_org_id 
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
    -- Créer un nouvel abonnement (COLONNES RÉELLES!)
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
-- ÉTAPE 10 : Ajouter contrainte unique sur onboarding_progress
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'onboarding_progress_organisation_id_key'
  ) THEN
    ALTER TABLE onboarding_progress ADD CONSTRAINT onboarding_progress_organisation_id_key UNIQUE (organisation_id);
    RAISE NOTICE '✅ Contrainte unique ajoutée sur onboarding_progress';
  ELSE
    RAISE NOTICE '✅ Contrainte unique existe déjà';
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE '✅ Contrainte existe déjà (duplicate)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Note: %', SQLERRM;
END $$;

-- ============================================================
-- VÉRIFICATIONS FINALES
-- ============================================================

SELECT '=== VÉRIFICATIONS ===' AS status;

SELECT 'auth_id existe: ' || EXISTS(
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'utilisateurs' AND column_name = 'auth_id'
)::text AS check_1;

SELECT 'get_user_organisation_id existe: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'get_user_organisation_id'
)::text AS check_2;

SELECT 'complete_registration existe: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'complete_registration'
)::text AS check_3;

SELECT 'create_subscription existe: ' || EXISTS(
  SELECT 1 FROM pg_proc WHERE proname = 'create_subscription'
)::text AS check_4;

SELECT '=== SCRIPT TERMINÉ AVEC SUCCÈS ===' AS result;

-- ============================================================
-- FIN DU SCRIPT V2
-- 
-- RÉSULTAT ATTENDU:
-- ✅ auth_id existe: true
-- ✅ get_user_organisation_id existe: true
-- ✅ complete_registration existe: true
-- ✅ create_subscription existe: true
-- ============================================================
