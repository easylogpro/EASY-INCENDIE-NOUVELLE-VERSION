# 🔥 Easy Incendie - Version Fusionnée

Cette version combine le meilleur des deux IA pour un projet fonctionnel.

---

## ⚠️ AVANT DE COMMENCER - ÉTAPE CRITIQUE

### 1. Exécuter le script SQL dans Supabase

**C'est la première chose à faire !**

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard/project/ofoibgbrviywlqxrnxvq)
2. Va dans **SQL Editor** (menu gauche)
3. Copie TOUT le contenu de `SOLUTION_COMPLETE_FLUX.sql`
4. Colle-le dans l'éditeur
5. Clique **Run**

Tu dois voir à la fin :
```
✅ auth_id exists: true
✅ complete_registration exists: true
✅ create_subscription exists: true
✅ demandes_prospects exists: true
✅ abonnements exists: true
```

Si tu ne vois pas ces résultats, il y a un problème. Relis les erreurs.

---

## 🚀 Installation

```bash
# 1. Extraire le ZIP
unzip easy-incendie-fusion-finale.zip
cd easy-incendie

# 2. Installer les dépendances
npm install

# 3. Vérifier le fichier .env
# Il doit contenir :
# VITE_SUPABASE_URL=https://ofoibgbrviywlqxrnxvq.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 4. Lancer le serveur de développement
npm run dev
```

---

## 🧪 Tester le flux complet

1. **Landing Page** → Remplis le questionnaire
2. **Register** → Crée un compte avec un NOUVEL email
3. **Email** → Clique sur le lien de confirmation
4. **Complete Profile** → Remplis tes infos entreprise
5. **Demo** → Regarde la démo (3 minutes)
6. **Subscribe** → Simule un paiement
7. **Dashboard** → Tu dois arriver ici ! 🎉

---

## 📁 Structure des fichiers

```
easy-incendie/
├── SOLUTION_COMPLETE_FLUX.sql  ← ⚠️ À EXÉCUTER EN PREMIER
├── src/
│   ├── App.jsx                 ← Toutes les routes
│   ├── pages/
│   │   ├── CompleteProfilePage.jsx  ← ✅ Corrigé (RPC)
│   │   ├── SubscriptionPage.jsx     ← ✅ Corrigé (RPC)
│   │   ├── VehiculesPage.jsx        ← ✅ Nouveau
│   │   ├── SavPage.jsx              ← ✅ Nouveau
│   │   ├── TravauxPage.jsx          ← ✅ Nouveau
│   │   ├── ContratsPage.jsx         ← ✅ Nouveau
│   │   ├── MaintenancesPage.jsx     ← ✅ Nouveau
│   │   └── ...
│   ├── contexts/
│   ├── components/
│   ├── utils/
│   └── data/
├── package.json
└── ...
```

---

## 🔧 Ce qui a été corrigé

### Problème principal
Le prospect ne devenait jamais client car les **INSERT directs étaient bloqués par RLS** (Row Level Security).

### Solution
1. **Fonctions RPC** avec `SECURITY DEFINER` (bypass RLS)
   - `complete_registration()` - Crée org + user + onboarding
   - `create_subscription()` - Crée l'abonnement et marque converti

2. **Policies RLS corrigées**
   - INSERT anonyme autorisé pour `demandes_prospects`
   - `auth_id` utilisé au lieu de `firebase_uid`

3. **Pages React mises à jour**
   - `CompleteProfilePage` → appelle RPC
   - `SubscriptionPage` → appelle RPC

---

## 📊 Toutes les routes disponibles

| Route | Page | État |
|-------|------|------|
| `/` | Landing | ✅ |
| `/login` | Connexion | ✅ |
| `/register` | Inscription | ✅ |
| `/complete-profile` | Compléter profil | ✅ |
| `/demo` | Démo 3 min | ✅ |
| `/subscribe` | Paiement | ✅ |
| `/dashboard` | Tableau de bord | ✅ |
| `/clients` | Clients | ✅ |
| `/sites` | Sites | ✅ |
| `/contrats` | Contrats | ✅ |
| `/techniciens` | Techniciens | ✅ |
| `/vehicules` | Véhicules | ✅ |
| `/groupes` | Groupes | 🔸 Placeholder |
| `/sous-traitants` | Sous-traitants | 🔸 Placeholder |
| `/astreintes` | Astreintes | 🔸 Placeholder |
| `/planning` | Planning | ✅ |
| `/maintenances` | Maintenances | ✅ |
| `/interventions` | Interventions | ✅ |
| `/sav` | SAV | ✅ |
| `/travaux` | Travaux | ✅ |
| `/mise-en-service` | Mise en service | 🔸 Placeholder |
| `/devis` | Devis | ✅ |
| `/factures` | Factures | ✅ |
| `/observations` | Observations | 🔸 Placeholder |
| `/alertes` | Alertes | ✅ |
| `/settings` | Paramètres | ✅ |
| `/rapports-*` | Rapports | 🔸 Placeholder |

---

## 🐛 Débugage

### Vérifier dans la console navigateur

```javascript
// Tester la session
const { data: session } = await supabase.auth.getSession();
console.log('Session:', session);

// Tester la RPC complete_registration
const { data, error } = await supabase.rpc('complete_registration', {
  p_nom: 'Test',
  p_prenom: 'User',
  p_telephone: '0612345678',
  p_entreprise: 'Test SARL',
  p_siret: '12345678901234',
  p_ville: 'Paris',
  p_domaines: ['SSI'],
  p_formule: 'starter',
  p_nb_utilisateurs: 1
});
console.log('Résultat:', data, error);
```

### Vérifier dans Supabase

```sql
-- Prospects
SELECT * FROM demandes_prospects ORDER BY created_at DESC LIMIT 5;

-- Utilisateurs
SELECT * FROM utilisateurs ORDER BY created_at DESC LIMIT 5;

-- Organisations
SELECT * FROM organisations ORDER BY created_at DESC LIMIT 5;

-- Abonnements
SELECT * FROM abonnements ORDER BY created_at DESC LIMIT 5;
```

---

## 📝 Prochaines étapes

1. ✅ Tester le flux complet
2. 🔲 Intégrer Stripe pour les paiements réels
3. 🔲 Développer les rapports PDF (29 types)
4. 🔲 Compléter les pages placeholder
5. 🔲 PWA pour techniciens terrain

---

## 🆘 Support

Si ça ne marche toujours pas :
1. Vérifie que le script SQL s'est bien exécuté
2. Vérifie les erreurs dans la console navigateur
3. Vérifie les logs dans Supabase → Logs

Bonne chance ! 🚀
