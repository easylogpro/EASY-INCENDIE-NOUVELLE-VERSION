# 📋 CAHIER DES CHARGES EASY INCENDIE
## Version 5.1 - 4 janvier 2026
## Document de référence - Mis à jour à chaque avancement

---

# 📌 HISTORIQUE DES VERSIONS

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 28/12/2024 | Création initiale |
| 2.0 | 29/12/2024 | Ajout architecture multi-domaines |
| 3.0 | 30/12/2024 | Définition 29 types de rapports |
| 4.0 | 30/12/2024 | Groupes techniciens, affectations, SAV priorités, astreintes |
| 5.0 | 03/01/2026 | Migration Supabase Auth, 43 tables finales, RLS complet, Frontend V6 |
| **5.1** | **04/01/2026** | **Corrections flux inscription, RLS demandes_prospects, SubscriptionPage** |

---

# 📌 TABLE DES MATIÈRES

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Architecture Technique](#2-architecture-technique)
3. [Domaines & Modules](#3-domaines--modules)
4. [Types de Rapports](#4-types-de-rapports)
5. [Base de Données - Structure Complète](#5-base-de-données---structure-complète)
6. [RLS Policies](#6-rls-policies)
7. [Frontend](#7-frontend)
8. [Authentification & Flux Inscription](#8-authentification--flux-inscription)
9. [Tarification](#9-tarification)
10. [Roadmap](#10-roadmap)
11. [Bugs Corrigés V5.1](#11-bugs-corrigés-v51)

---

# 1. VISION & OBJECTIFS

## 1.1 Concept

**Easy Incendie** est une plateforme SaaS B2B destinée aux entreprises de sécurité incendie pour gérer l'ensemble de leur activité :

- ✅ Gestion clients et sites
- ✅ Planification des interventions
- ✅ Rapports normalisés (29 types)
- ✅ Suivi maintenances multi-domaines
- ✅ SAV avec priorités et astreintes
- ✅ Facturation et devis
- ✅ Application terrain (PWA)

## 1.2 Positionnement juridique

> ⚠️ **IMPORTANT** : Easy Incendie est un **assistant** qui fournit une **"aide à"** la gestion de la sécurité incendie. 
> Le système ne prétend **jamais** à la conformité réglementaire. 
> Toutes les demandes utilisateurs sont **consignées** pour traçabilité légale.

## 1.3 Cibles

| Cible | Description |
|-------|-------------|
| **Primaire** | PME sécurité incendie (5-50 employés) |
| **Secondaire** | Artisans indépendants, grandes entreprises |

## 1.4 Proposition de valeur

- **Gain de temps** : Rapports générés en 5 min sur le terrain
- **Zéro papier** : Tout est digital, signatures électroniques
- **Aide à la conformité** : Rapports structurés selon normes NF
- **Visibilité** : Dashboard temps réel sur l'activité

---

# 2. ARCHITECTURE TECHNIQUE

## 2.1 Stack Technologique

```
┌─────────────────────────────────────────────────────────────────┐
│                     EASY INCENDIE V5.1                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend    │ React 18 + Vite + Tailwind CSS                  │
│  Backend     │ Supabase (PostgreSQL + Auth + Storage + RLS)    │
│  Auth        │ Supabase Authentication (PKCE Flow)             │
│  PWA         │ Application terrain installable                  │
│  PDF         │ Génération côté serveur (Edge Functions)         │
│  Paiement    │ Stripe (abonnements + factures)                 │
│  Hébergement │ Vercel                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Repositories & Accès

| Projet | URL |
|--------|-----|
| GitHub | github.com/easylogpro/easy-incendie |
| Supabase | ofoibgbrviywlqxrnxvq.supabase.co |
| Production | https://easy-incendie.vercel.app |

---

# 3. DOMAINES & MODULES

## 3.1 Les 7 Domaines Métier

| Code | Domaine | Description | Icône | Couleur |
|------|---------|-------------|-------|---------|
| **SSI** | Système Sécurité Incendie | Centrales, détection, alarme | 🔥 | #EF4444 |
| **DSF** | Désenfumage | Naturel et Mécanique | 💨 | #3B82F6 |
| **CMP** | Compartimentage | Portes CF, clapets CF | 🚪 | #8B5CF6 |
| **BAES** | Blocs Autonomes | Éclairage de sécurité | 🚨 | #F59E0B |
| **EXT** | Extincteurs | Tous types | 🧯 | #EF4444 |
| **RIA** | Robinets Incendie Armés | RIA et tests pression | 💧 | #06B6D4 |
| **COLSEC** | Colonnes Sèches | Colonnes et raccords | 📌 | #6B7280 |

---

# 4. TYPES DE RAPPORTS

## 4.1 Matrice Complète (29 rapports)

```
                │      MAINTENANCE           │  SAV  │ TRAVAUX │      MISE EN SERVICE        │
────────────────┼────────────────────────────┼───────┼─────────┼─────────────────────────────┤
🔥 SSI          │ A, B, E2, E3, E4, FORM (6) │  ✅   │   ✅    │ MES, FORM, CHANT, BC, CS (5)│
💨 DSF          │ Naturel, Mécanique (2)     │  ✅   │   ✅    │          ❌                 │
🚪 CMP          │ Standard (1)               │  ✅   │   ✅    │          ❌                 │
🚨 BAES         │ Standard (1)               │  ✅   │   ✅    │          ❌                 │
🧯 EXT          │ Standard (1)               │  ❌   │   ✅    │          ❌                 │
💧 RIA          │ Standard (1)               │  ❌   │   ✅    │          ❌                 │
📌 COLSEC       │ Standard (1)               │  ❌   │   ✅    │          ❌                 │
```

## 4.2 Rapports par Profil

| Profil | SSI | DSF | CMP | BAES | EXT | RIA | COLSEC |
|--------|-----|-----|-----|------|-----|-----|--------|
| **Mainteneur** | Cat A, Cat B, Évac 2/3/4, Formation, SAV | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |
| **Mainteneur Installateur** | Cat A, Cat B, Évac 2/3/4, Formation, SAV, MES | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |
| **Installateur** | SAV, MES, Formation | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |
| **Artisan** | SAV, MES, Formation | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |
| **Sous-traitant** | SAV, MES, Formation | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |

---

# 5. BASE DE DONNÉES - STRUCTURE COMPLÈTE

## 5.1 Vue d'ensemble

| Métrique | Valeur |
|----------|--------|
| **Total tables** | **43** |

## 5.2 Tables principales

### TABLE : abonnements

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| organisation_id | uuid | FK → organisations |
| formule | text | 'starter', 'custom', etc. |
| statut | text | 'active', 'inactive' |
| domaines_actifs | text[] | Array des domaines |
| nb_utilisateurs_max | integer | Limite users |
| nb_sites_max | integer | Limite sites |
| **prix_mensuel_ht** | numeric(10,2) | Prix total mensuel |
| **options** | jsonb | {addons, prix_base, prix_options, premier_mois_remise, remise_appliquee} |
| date_debut | date | Format YYYY-MM-DD |
| date_fin | date | NULL si actif |
| stripe_customer_id | text | ID Stripe |
| stripe_subscription_id | text | ID subscription Stripe |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### TABLE : demandes_prospects

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| organisation_id | uuid | FK → organisations (NULL au début) |
| email | text | Email du prospect |
| telephone | text | |
| domaines_demandes | text[] | Domaines choisis |
| profil_demande | text | mainteneur, installateur, etc. |
| nb_utilisateurs | text | '1', '2-5', '6-10', '11-25' |
| tarif_calcule | numeric(10,2) | Prix calculé |
| options_selectionnees | jsonb | {addons, nb_sites, etc.} |
| source | text | 'questionnaire_landing' |
| converti | boolean | false → true après paiement |
| created_at | timestamptz | |

### TABLE : onboarding_progress

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| organisation_id | uuid | FK → organisations, **UNIQUE** |
| step_profil | boolean | |
| step_logo | boolean | |
| step_client | boolean | |
| step_site | boolean | |
| step_equipement | boolean | |
| step_technicien | boolean | |
| step_rapport | boolean | |
| completed | boolean | |
| completed_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### TABLE : demo_sessions

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK |
| organisation_id | uuid | FK → organisations |
| started_at | timestamptz | |
| expires_at | timestamptz | started_at + 180 secondes |
| converted | boolean | |
| created_at | timestamptz | |

---

# 6. RLS POLICIES

## 6.1 Policies critiques

### demandes_prospects

| Policy | Command | Condition |
|--------|---------|-----------|
| anon_insert_demandes_prospects | INSERT (anon) | true |
| **authenticated_insert_demandes_prospects** | INSERT (authenticated) | **true** ← AJOUTÉ V5.1 |
| auth_select_own_demandes_prospects | SELECT (authenticated) | email = auth.email() |
| rls_demandes_prospects | ALL (authenticated) | organisation_id IN (...) |

### organisations

| Policy | Command | Condition |
|--------|---------|-----------|
| org_insert | INSERT | true |
| org_select | SELECT | true |
| org_update | UPDATE | true |

### utilisateurs

| Policy | Command | Condition |
|--------|---------|-----------|
| user_insert | INSERT | auth_id = auth.uid() |
| user_select | SELECT | auth_id = auth.uid() |
| user_update | UPDATE | auth_id = auth.uid() |

### abonnements

| Policy | Command | Condition |
|--------|---------|-----------|
| abonnements_select_own_org | SELECT | organisation_id IN (...) |
| rls_abonnements | ALL | organisation_id IN (...) |

---

# 7. FRONTEND

## 7.1 Structure des fichiers

```
src/
├── App.jsx
├── config/
│   └── supabase.js
├── contexts/
│   ├── AuthContext.jsx
│   └── DemoContext.jsx
├── pages/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AuthCallbackPage.jsx
│   ├── CompleteProfilePage.jsx
│   ├── DemoPage.jsx
│   ├── DemoExpiredPage.jsx
│   ├── SubscriptionPage.jsx
│   ├── DashboardPage.jsx
│   └── ...
├── utils/
│   └── pricingAlgorithm.js
└── ...
```

## 7.2 Routes

| Route | Composant | Protection |
|-------|-----------|------------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public (redirect si connecté) |
| `/register` | RegisterPage | Public (redirect si connecté) |
| `/auth/callback` | AuthCallbackPage | Callback Supabase |
| `/complete-profile` | CompleteProfilePage | Authentifié + profil incomplet |
| `/demo` | DemoPage | Protégé |
| `/demo-expired` | DemoExpiredPage | Protégé |
| `/subscribe` | SubscriptionPage | Protégé |
| `/dashboard` | DashboardPage | Protégé |

---

# 8. AUTHENTIFICATION & FLUX INSCRIPTION

## 8.1 Stack Auth

| Élément | Technologie |
|---------|-------------|
| Provider | **Supabase Auth** |
| Flow | **PKCE** |
| Session | LocalStorage |

## 8.2 Flux d'inscription COMPLET (V5.1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE                                                              │
│    └── Questionnaire : domaines, profil, nb_users, nb_sites                 │
│    └── Calcul prix via pricingAlgorithm.js                                  │
│    └── navigate('/register', { state: { questionnaireData, pricing } })     │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. REGISTER PAGE                                                             │
│    └── Email + Mot de passe                                                  │
│    └── signUp() → Email de confirmation envoyé                              │
│    └── INSERT demandes_prospects (traçabilité)                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. EMAIL DE CONFIRMATION                                                     │
│    └── Clic sur lien → /auth/callback                                       │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. AUTH CALLBACK PAGE                                                        │
│    └── exchangeCodeForSession() ou verifyOtp()                              │
│    └── Redirect → /complete-profile                                         │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. COMPLETE PROFILE PAGE                                                     │
│    └── Prénom, Nom, Téléphone (obligatoire)                                 │
│    └── Entreprise, SIRET, Ville                                              │
│    └── INSERT organisations                                                   │
│    └── INSERT utilisateurs                                                    │
│    └── INSERT onboarding_progress                                             │
│    └── SELECT demandes_prospects (récupère données questionnaire)            │
│    └── UPDATE demandes_prospects (ajoute organisation_id)                    │
│    └── navigate('/demo', { state: { request } })  ← CORRIGÉ V5.1            │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. DEMO PAGE (3 minutes)                                                     │
│    └── Timer 180 secondes                                                    │
│    └── Lecture seule (fonctionnalités verrouillées)                         │
│    └── INSERT demo_sessions                                                   │
│    └── Bouton "Souscrire" → navigate('/subscribe', { state: { request } })  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. SUBSCRIPTION PAGE                                                         │
│    └── Récapitulatif tarif                                                   │
│    └── Options modifiables                                                   │
│    └── INSERT abonnements (structure corrigée V5.1)                          │
│    └── UPDATE demandes_prospects (converti = true)                           │
│    └── navigate('/dashboard')                                                │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. DASHBOARD                                                                 │
│    └── Onboarding 7 étapes                                                   │
│    └── Accès complet                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 9. TARIFICATION

## 9.1 Grille tarifaire (par profil × domaines × utilisateurs)

### Mainteneur / Installateur / Artisan / Sous-traitant

| Domaines | 1 user | 2-5 users | 6-10 users | 11-25 users |
|----------|--------|-----------|------------|-------------|
| 1 domaine | 59€ | 89€ | 149€ | 299€ |
| 2 domaines | 69€ | 99€ | 159€ | 299€ |
| 3+ domaines | 79€ | 109€ | 169€ | 299€ |

### Mainteneur Installateur (tarifs légèrement différents)

| Domaines | 1 user | 2-5 users | 6-10 users | 11-25 users |
|----------|--------|-----------|------------|-------------|
| 1 domaine | 59€ | 99€ | 159€ | 359€ |
| 2 domaines | 69€ | 99€ | 169€ | 359€ |
| 3+ domaines | 79€ | 119€ | 179€ | 359€ |

## 9.2 Modules optionnels

| Module | Prix/mois |
|--------|-----------|
| IA (aide rédaction) | +9€ |
| Export comptable | +5€ |
| Veille réglementaire | +5€ |

## 9.3 Offre commerciale

- **-10% le premier mois**
- **Pas d'essai gratuit** → Démo 3 minutes en lecture seule
- Téléphone **obligatoire** à l'inscription

## 9.4 Algorithme de calcul

```javascript
// src/utils/pricingAlgorithm.js
calculatePrice(domains[], userCount, addons[], profile) → {
  basePrice,      // Prix grille
  addonsTotal,    // Somme options
  totalPrice,     // base + addons
  discount,       // 10% de totalPrice
  finalPrice      // totalPrice - discount (1er mois)
}
```

---

# 10. ROADMAP

## 10.1 État d'avancement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1. Infrastructure | Supabase, GitHub | ✅ FAIT |
| 2. Landing Page | Questionnaire + Pricing | ✅ FAIT |
| 3. Base de données | 43 tables + RLS | ✅ FAIT |
| 4. Authentification | Supabase Auth + PKCE | ✅ FAIT |
| 5. Frontend structure | Pages + Routes + Contexts | ✅ FAIT |
| **5.1 Corrections flux** | RLS + Redirections + INSERT | ⏳ EN COURS |
| 6. CRUD | Clients, Sites, Équipements | ⏳ À FAIRE |
| 7. Dashboard | Stats temps réel | ⏳ À FAIRE |
| 8. Techniciens | Groupes, Affectations | ⏳ À FAIRE |
| 9. Planning | Interventions, Calendrier | ⏳ À FAIRE |
| 10. Rapports | Formulaires dynamiques (29 types) | ⏳ À FAIRE |
| 11. SAV | Priorités, Astreintes | ⏳ À FAIRE |
| 12. PWA Terrain | App mobile | ⏳ À FAIRE |
| 13. PDF | Génération rapports | ⏳ À FAIRE |
| 14. Facturation | Devis, Factures, Stripe | ⏳ À FAIRE |
| 15. Déploiement | Production | ⏳ À FAIRE |

---

# 11. BUGS CORRIGÉS V5.1

## 11.1 Liste des corrections (4 janvier 2026)

| # | Localisation | Problème | Solution |
|---|--------------|----------|----------|
| 1 | RLS `demandes_prospects` | Policy bloque INSERT authenticated | Ajout policy `authenticated_insert_demandes_prospects` |
| 2 | `CompleteProfilePage.jsx:122` | `navigate('/dashboard')` skip démo | Changé en `navigate('/demo', { state: { request } })` |
| 3 | `CompleteProfilePage.jsx` | Données questionnaire non récupérées | Ajout SELECT + UPDATE `demandes_prospects` |
| 4 | `SubscriptionPage.jsx:66-83` | Colonnes inexistantes dans INSERT | Mapping vers colonnes existantes |

## 11.2 Détail correction SubscriptionPage

### AVANT (colonnes inexistantes)
```javascript
{
  options_actives: selectedAddons,
  prix_base: pricing.basePrice,
  prix_options: pricing.addonsTotal,
  prix_total: pricing.totalPrice,
  premier_mois_remise: true,
  remise_appliquee: pricing.discount
}
```

### APRÈS (colonnes correctes)
```javascript
{
  prix_mensuel_ht: pricing.totalPrice,
  options: {
    addons: selectedAddons,
    prix_base: pricing.basePrice,
    prix_options: pricing.addonsTotal,
    premier_mois_remise: true,
    remise_appliquee: pricing.discount
  },
  date_debut: new Date().toISOString().split('T')[0]  // Format DATE
}
```

## 11.3 SQL à exécuter (Supabase)

```sql
-- Correction RLS demandes_prospects
CREATE POLICY "authenticated_insert_demandes_prospects"
ON public.demandes_prospects
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

# 📎 ANNEXES

## A. Liens utiles

| Ressource | URL |
|-----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/ofoibgbrviywlqxrnxvq |
| GitHub | https://github.com/easylogpro/easy-incendie |
| Production | https://easy-incendie.vercel.app |

## B. Variables d'environnement

```env
VITE_SUPABASE_URL=https://ofoibgbrviywlqxrnxvq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## C. Fichiers de correction

| Fichier | Description |
|---------|-------------|
| `CORRECTIONS_6_PROBLEMES.md` | Détail des corrections à appliquer |

---

**Document maintenu à jour à chaque avancement du projet.**

*Dernière mise à jour : 4 janvier 2026 - V5.1*
