-- ============================================================
-- EASY INCENDIE - CORRECTION RLS DEMANDES_PROSPECTS
-- ============================================================
-- 
-- PROBLÈME: Les INSERT anonymes (depuis Landing Page) échouent
-- car RLS bloque même avec "WITH CHECK (true)"
--
-- SOLUTION: Utiliser "TO anon, authenticated" explicitement
--
-- À EXÉCUTER DANS: Supabase Dashboard > SQL Editor
-- ============================================================

-- ÉTAPE 1: Supprimer TOUTES les anciennes policies sur demandes_prospects
DROP POLICY IF EXISTS "prospects_insert_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_policy" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_anon" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_select_own" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_update_own" ON demandes_prospects;
DROP POLICY IF EXISTS "prospects_insert_all" ON demandes_prospects;
DROP POLICY IF EXISTS "allow_insert_for_all" ON demandes_prospects;
DROP POLICY IF EXISTS "allow_anon_insert" ON demandes_prospects;

-- ÉTAPE 2: Désactiver temporairement RLS
ALTER TABLE demandes_prospects DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 3: Réactiver RLS
ALTER TABLE demandes_prospects ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les nouvelles policies PERMISSIVES

-- ✅ INSERT: Permettre à TOUT LE MONDE (anon + authenticated)
-- C'est CRITIQUE car l'utilisateur n'est pas encore connecté sur Landing
CREATE POLICY "allow_anon_insert" ON demandes_prospects
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- ✅ SELECT: Permettre aux utilisateurs connectés de voir LEURS prospects
CREATE POLICY "allow_authenticated_select" ON demandes_prospects
  FOR SELECT 
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR organisation_id IN (
      SELECT organisation_id FROM utilisateurs WHERE auth_id = auth.uid()
    )
    OR email IS NULL  -- Permet de voir les prospects sans email (créés avant inscription)
  );

-- ✅ UPDATE: Permettre aux utilisateurs connectés de mettre à jour LEURS prospects
CREATE POLICY "allow_authenticated_update" ON demandes_prospects
  FOR UPDATE 
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR email IS NULL  -- Permet de mettre à jour les prospects sans email
    OR organisation_id IN (
      SELECT organisation_id FROM utilisateurs WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (true);

-- ============================================================
-- VÉRIFICATION
-- ============================================================

SELECT 'Policies sur demandes_prospects:' AS info;
SELECT policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE tablename = 'demandes_prospects';

-- Test: Essayer un INSERT anonyme (simulé)
-- INSERT INTO demandes_prospects (domaines_demandes, profil_demande, nb_utilisateurs, source)
-- VALUES (ARRAY['ssi', 'dsf'], 'mainteneur', '2-5', 'test_sql');

-- Si le test fonctionne, supprimer la ligne de test:
-- DELETE FROM demandes_prospects WHERE source = 'test_sql';

SELECT '✅ Script exécuté avec succès!' AS status;
