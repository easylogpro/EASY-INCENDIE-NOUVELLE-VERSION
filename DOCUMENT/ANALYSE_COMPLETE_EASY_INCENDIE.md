# 🔥 EASY INCENDIE - ANALYSE COMPLÈTE AVANT CODAGE
## Document de référence pour le développement
## Version 1.0 - 12 janvier 2026

---

# 📌 TABLE DES MATIÈRES

1. [Vision Globale](#1-vision-globale)
2. [Architecture des Données](#2-architecture-des-données)
3. [Flux Utilisateur Complet](#3-flux-utilisateur-complet)
4. [Liste Complète des Pages](#4-liste-complète-des-pages)
5. [Interactions Entre Modules](#5-interactions-entre-modules)
6. [Tests à Effectuer](#6-tests-à-effectuer)
7. [Checklist de Développement](#7-checklist-de-développement)

---

# 1. VISION GLOBALE

## 1.1 Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EASY INCENDIE V5                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   LANDING   │────▶│  REGISTER   │────▶│   DEMO 3m   │────▶│  SUBSCRIBE  │   │
│  │    PAGE     │     │  + PROFILE  │     │  (readonly) │     │   (Stripe)  │   │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘   │
│                                                                      │          │
│  ┌───────────────────────────────────────────────────────────────────▼────────┐│
│  │                           DASHBOARD PRINCIPAL                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         ││
│  │  │  Stats   │ │ Modules  │ │ Planning │ │ SAV/ALT  │ │ Finances │         ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         ││
│  └────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐│
│  │                              MODULES MÉTIER                                 ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ GESTION                                                              │  ││
│  │  │ ├── Clients (CRUD + import)                                          │  ││
│  │  │ ├── Sites (CRUD + équipements)                                       │  ││
│  │  │ ├── Contrats (suivi + renouvellement)                               │  ││
│  │  │ └── Équipements (SSI, DSF, BAES, EXT, RIA, CMP, COLSEC)            │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ ÉQUIPE                                                               │  ││
│  │  │ ├── Techniciens (CRUD + compétences)                                │  ││
│  │  │ ├── Groupes (zones géographiques)                                   │  ││
│  │  │ ├── Véhicules (suivi CT + km)                                       │  ││
│  │  │ ├── Sous-traitants (CRUD + domaines)                               │  ││
│  │  │ └── Astreintes (planning + téléphone)                              │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ INTERVENTIONS                                                        │  ││
│  │  │ ├── Planning (calendrier + affectations)                            │  ││
│  │  │ ├── Maintenances (7 types par domaine)                              │  ││
│  │  │ ├── SAV (P1/P2/P3 + countdown)                                      │  ││
│  │  │ ├── Travaux (devis + bon commande)                                  │  ││
│  │  │ └── Mise en Service SSI (chantier + réception)                     │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ COMMERCIAL                                                           │  ││
│  │  │ ├── Devis (création + lignes + PDF)                                 │  ││
│  │  │ ├── Factures (émission + relances)                                  │  ││
│  │  │ └── CA (stats + exports)                                            │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ SUIVI                                                                │  ││
│  │  │ ├── Rapports (29 types + PDF)                                       │  ││
│  │  │ ├── Observations (photos + priorités)                               │  ││
│  │  │ ├── Alertes (visites, contrats, véhicules)                         │  ││
│  │  │ └── Fichiers (stockage + horodatage)                               │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐  ││
│  │  │ PARAMÈTRES                                                           │  ││
│  │  │ ├── Organisation (logo, infos, mentions)                            │  ││
│  │  │ ├── Abonnement (formule, domaines, users)                          │  ││
│  │  │ └── Utilisateurs (admin, manager, technicien)                      │  ││
│  │  └─────────────────────────────────────────────────────────────────────┘  ││
│  └────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐│
│  │                              PWA TERRAIN                                    ││
│  │  └── Interventions du jour, Rapports, Photos, Signature, Offline          ││
│  └────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Les 43 Tables Organisées

```
ORGANISATION (5)
├── organisations         # Entreprise cliente
├── utilisateurs          # Users avec rôles (admin, manager, technicien)
├── parametres            # Config (logo, mentions, TVA)
├── abonnements           # Formule + domaines actifs
└── onboarding_progress   # Wizard 7 étapes

CLIENTS & SITES (4)
├── clients               # Clients payeurs
├── sites                 # Lieux d'intervention
├── contrats              # Contrats de maintenance
└── observations          # Constats avec photos

ÉQUIPEMENTS (7)
├── equipements_ssi       # Centrales, détecteurs
├── equipements_dsf       # Volets, moteurs
├── equipements_baes      # Blocs autonomes
├── equipements_ext       # Extincteurs
├── equipements_ria       # RIA
├── equipements_cmp       # Portes CF, clapets
└── equipements_colsec    # Colonnes sèches

ÉQUIPE (5)
├── techniciens           # Techniciens terrain
├── groupes               # Zones géographiques
├── vehicules             # Parc auto
├── sous_traitants        # Partenaires
└── astreintes            # Planning astreintes

INTERVENTIONS (10)
├── maintenances_ssi      # Maintenance SSI
├── maintenances_dsf_naturel
├── maintenances_dsf_mecanique
├── maintenances_baes
├── maintenances_ext
├── maintenances_ria
├── maintenances_cmp
├── maintenances_colsec
├── sav                   # Dépannages
├── travaux               # Installations
└── mises_en_service_ssi  # Réceptions SSI

COMMERCIAL (4)
├── devis                 # Devis
├── lignes_devis          # Lignes de devis
├── factures              # Factures
└── lignes_factures       # Lignes de factures

SUIVI (4)
├── alertes               # Alertes système
├── fichiers              # Documents stockés
├── logs_activite         # Historique actions
└── logs_imports_exports  # Historique imports

PROSPECTS (3)
├── demandes_prospects    # Demandes landing
├── demo_sessions         # Sessions démo 3min
└── email_logs            # Emails envoyés
```

---

# 2. ARCHITECTURE DES DONNÉES

## 2.1 Relations Principales

```
organisations (1)
    │
    ├──▶ utilisateurs (N)
    │       └── role: admin | manager | technicien
    │
    ├──▶ clients (N)
    │       │
    │       └──▶ sites (N)
    │               │
    │               ├──▶ equipements_* (N) [7 tables]
    │               │
    │               ├──▶ contrats (N)
    │               │       └── domaine: SSI|DSF|BAES|EXT|RIA|CMP|COLSEC
    │               │
    │               ├──▶ maintenances_* (N) [8 tables]
    │               │       └── contrat_id, technicien_id
    │               │
    │               ├──▶ sav (N)
    │               │       └── priorite: P1|P2|P3, technicien_id
    │               │
    │               ├──▶ travaux (N)
    │               │       └── devis_id, technicien_id
    │               │
    │               └──▶ mises_en_service_ssi (N)
    │                       └── travaux_id, technicien_id
    │
    ├──▶ techniciens (N)
    │       │
    │       ├──▶ groupe_id ──▶ groupes
    │       │
    │       └──▶ vehicules (1)
    │
    ├──▶ sous_traitants (N)
    │
    ├──▶ astreintes (N)
    │       └── technicien_id
    │
    ├──▶ devis (N)
    │       │
    │       ├──▶ client_id, site_id
    │       │
    │       └──▶ lignes_devis (N)
    │
    ├──▶ factures (N)
    │       │
    │       ├──▶ client_id, devis_id
    │       │
    │       └──▶ lignes_factures (N)
    │
    ├──▶ observations (N)
    │       └── site_id, intervention_id
    │
    └──▶ alertes (N)
            └── site_id, client_id, intervention_id
```

## 2.2 Flux des Interventions

```
PLANIFICATION
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Contrat   │────▶│  Planning   │────▶│ Technicien  │
│ (annuel)    │     │ (dates)     │     │ (affecté)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
RÉALISATION                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Rapport   │◀────│ Maintenance │◀────│   Visite    │
│   (PDF)     │     │  terminée   │     │  terrain    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
POST-INTERVENTION          ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Facture   │◀────│    Devis    │◀────│ Observation │
│  (si devis) │     │ (si travaux)│     │ (constat)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 2.3 Flux SAV avec Priorités

```
DEMANDE
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Demande   │────▶│  Priorité   │
│  appelle    │     │    SAV      │     │  P1/P2/P3   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
AFFECTATION        ┌────────────────────────────┼────────────────────────────┐
                   │                            │                            │
                   ▼                            ▼                            ▼
            ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
            │  P1 = 4h    │            │  P2 = 24h   │            │  P3 = 72h   │
            │  🔴 Urgent   │            │  🟠 Normal  │            │  🟡 Mineur  │
            │  SMS+Email  │            │   Email     │            │   Email     │
            └──────┬──────┘            └──────┬──────┘            └──────┬──────┘
                   │                          │                          │
                   └──────────────────────────┼──────────────────────────┘
                                              │
ASTREINTE                                     ▼
                   ┌─────────────────────────────────────────────────────┐
                   │  Si période astreinte active:                       │
                   │  └── technicien_astreinte_id = astreintes.tech_id  │
                   │  └── majoration_astreinte = 1.5                    │
                   └─────────────────────────────────────────────────────┘
```

---

# 3. FLUX UTILISATEUR COMPLET

## 3.1 Parcours Prospect → Client

```
ÉTAPE 1: LANDING PAGE
┌────────────────────────────────────────────────────────────────┐
│  Questionnaire:                                                 │
│  ├── Domaines intéressés (SSI, DSF, BAES...)                  │
│  ├── Profil (mainteneur, installateur, les deux)              │
│  ├── Nombre de techniciens (1, 2-5, 6-10, 11+)                │
│  └── Nombre de sites (1-10, 11-50, 51-200, 200+)              │
│                                                                 │
│  → INSERT demandes_prospects                                    │
│  → Calcul tarif personnalisé (pricingAlgorithm.js)            │
│  → Affichage récapitulatif + bouton "Créer mon compte"        │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 2: REGISTER PAGE
┌────────────────────────────────────────────────────────────────┐
│  Formulaire:                                                    │
│  ├── Email (obligatoire)                                       │
│  └── Mot de passe (min 6 caractères)                          │
│                                                                 │
│  → supabase.auth.signUp()                                      │
│  → Email de confirmation envoyé                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 3: EMAIL CONFIRMATION
┌────────────────────────────────────────────────────────────────┐
│  Lien cliqué: /auth/callback?code=xxx                          │
│                                                                 │
│  → exchangeCodeForSession(code) ou verifyOtp()                 │
│  → Session créée                                               │
│  → Redirect /complete-profile                                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 4: COMPLETE PROFILE
┌────────────────────────────────────────────────────────────────┐
│  Formulaire:                                                    │
│  ├── Prénom, Nom                                               │
│  ├── Téléphone (OBLIGATOIRE)                                   │
│  ├── Entreprise, SIRET, Ville                                  │
│                                                                 │
│  → RPC complete_registration()                                 │
│      ├── INSERT organisations                                  │
│      ├── INSERT utilisateurs (role: admin)                     │
│      ├── INSERT onboarding_progress                            │
│      └── UPDATE demandes_prospects (organisation_id)           │
│                                                                 │
│  → Redirect /demo                                              │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 5: DEMO (3 minutes)
┌────────────────────────────────────────────────────────────────┐
│  Mode lecture seule:                                           │
│  ├── Dashboard avec données fictives                          │
│  ├── Navigation possible mais actions bloquées                │
│  ├── Bannière avec compte à rebours                           │
│  └── Bouton "S'abonner maintenant"                            │
│                                                                 │
│  → INSERT demo_sessions (started_at, expires_at)               │
│  → Après 3 min: Redirect /subscribe ou modal                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 6: SUBSCRIBE
┌────────────────────────────────────────────────────────────────┐
│  Récapitulatif:                                                │
│  ├── Domaines sélectionnés                                    │
│  ├── Prix calculé (base + options)                            │
│  ├── Remise -10% premier mois                                 │
│  └── Paiement carte (Stripe simulé pour l'instant)            │
│                                                                 │
│  → INSERT abonnements                                          │
│  → UPDATE organisations (modules_actifs, formule)              │
│  → UPDATE demandes_prospects (converti: true)                  │
│                                                                 │
│  → Redirect /dashboard                                         │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
ÉTAPE 7: DASHBOARD + ONBOARDING
┌────────────────────────────────────────────────────────────────┐
│  Wizard Onboarding 7 étapes:                                   │
│  ├── 1. Profil entreprise (logo, infos)                       │
│  ├── 2. Premier client                                        │
│  ├── 3. Premier site                                          │
│  ├── 4. Équipements du site                                   │
│  ├── 5. Premier technicien                                    │
│  ├── 6. Premier contrat                                       │
│  └── 7. Premier rapport                                       │
│                                                                 │
│  → UPDATE onboarding_progress (step_*)                         │
│  → À la fin: UPDATE onboarding_progress (completed: true)      │
└────────────────────────────────────────────────────────────────┘
```

---

# 4. LISTE COMPLÈTE DES PAGES

## 4.1 Pages Publiques (5)

| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Landing | `/` | Accueil + questionnaire | demandes_prospects |
| Login | `/login` | Connexion | auth.users |
| Register | `/register` | Inscription email+mdp | auth.users |
| AuthCallback | `/auth/callback` | Callback email | auth.users |
| CompleteProfile | `/complete-profile` | Profil + entreprise | organisations, utilisateurs |

## 4.2 Pages Protégées (20+)

### Tableau de Bord (1)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Dashboard | `/dashboard` | Vue globale | TOUTES |

### Gestion (4)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Clients | `/clients` | CRUD clients | clients |
| Sites | `/sites` | CRUD sites + équipements | sites, equipements_* |
| Contrats | `/contrats` | Suivi contrats | contrats |
| Équipements | `/equipements/:siteId` | Par site | equipements_* |

### Équipe (5)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Techniciens | `/techniciens` | CRUD techniciens | techniciens |
| Groupes | `/groupes` | Zones géographiques | groupes |
| Véhicules | `/vehicules` | Parc auto + CT | vehicules |
| Sous-traitants | `/sous-traitants` | CRUD partenaires | sous_traitants |
| Astreintes | `/astreintes` | Planning astreintes | astreintes |

### Interventions (5)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Planning | `/planning` | Calendrier | maintenances_*, sav, travaux |
| Maintenances | `/maintenances` | Liste + filtres | maintenances_* |
| SAV | `/sav` | P1/P2/P3 + countdown | sav |
| Travaux | `/travaux` | Installations | travaux |
| Mise en Service | `/mise-en-service` | Réceptions SSI | mises_en_service_ssi |

### Commercial (3)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Devis | `/devis` | CRUD devis | devis, lignes_devis |
| Factures | `/factures` | CRUD factures | factures, lignes_factures |
| Rapports | `/rapports` | Tous rapports PDF | fichiers |

### Suivi (2)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Observations | `/observations` | Constats + photos | observations |
| Alertes | `/alertes` | Alertes système | alertes |

### Paramètres (1)
| Page | Route | Description | Table(s) |
|------|-------|-------------|----------|
| Settings | `/settings` | Config organisation | parametres, organisations |

---

# 5. INTERACTIONS ENTRE MODULES

## 5.1 Matrice des Interactions

```
                    │ CLI │ SIT │ CON │ TEC │ VEH │ MAI │ SAV │ TRA │ MES │ DEV │ FAC │ OBS │ ALE │
────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
Clients (CLI)       │  ●  │  ✓  │  ✓  │     │     │     │     │     │     │  ✓  │  ✓  │     │  ✓  │
Sites (SIT)         │  ✓  │  ●  │  ✓  │  ✓  │     │  ✓  │  ✓  │  ✓  │  ✓  │  ✓  │     │  ✓  │  ✓  │
Contrats (CON)      │  ✓  │  ✓  │  ●  │     │     │  ✓  │  ✓  │     │     │     │  ✓  │     │  ✓  │
Techniciens (TEC)   │     │  ✓  │     │  ●  │  ✓  │  ✓  │  ✓  │  ✓  │  ✓  │     │     │     │     │
Véhicules (VEH)     │     │     │     │  ✓  │  ●  │     │     │     │     │     │     │     │  ✓  │
Maintenances (MAI)  │     │  ✓  │  ✓  │  ✓  │     │  ●  │     │     │     │     │  ✓  │  ✓  │  ✓  │
SAV (SAV)           │     │  ✓  │  ✓  │  ✓  │     │     │  ●  │     │     │  ✓  │  ✓  │  ✓  │  ✓  │
Travaux (TRA)       │     │  ✓  │     │  ✓  │     │     │     │  ●  │  ✓  │  ✓  │  ✓  │  ✓  │     │
Mise en service     │     │  ✓  │     │  ✓  │     │     │     │  ✓  │  ●  │     │     │     │     │
Devis (DEV)         │  ✓  │  ✓  │     │     │     │     │  ✓  │  ✓  │     │  ●  │  ✓  │  ✓  │     │
Factures (FAC)      │  ✓  │     │  ✓  │     │     │  ✓  │  ✓  │  ✓  │     │  ✓  │  ●  │     │  ✓  │
Observations (OBS)  │     │  ✓  │     │     │     │  ✓  │  ✓  │  ✓  │     │  ✓  │     │  ●  │  ✓  │
Alertes (ALE)       │  ✓  │  ✓  │  ✓  │     │  ✓  │  ✓  │  ✓  │     │     │     │  ✓  │  ✓  │  ●  │
```

## 5.2 Déclencheurs d'Alertes

| Événement | Alerte générée | Priorité |
|-----------|----------------|----------|
| Visite en retard (date_prochaine < today) | Maintenance en retard | HAUTE |
| Contrat expire dans 30 jours | Renouvellement contrat | MOYENNE |
| CT véhicule dans 15 jours | Contrôle technique | MOYENNE |
| Devis sans réponse > 30 jours | Relance devis | BASSE |
| Facture impayée > échéance | Impayé | HAUTE |
| SAV P1 créé | Urgence SAV | CRITIQUE |
| Observation critique non traitée | Observation | HAUTE |

## 5.3 Calculs Automatiques

| Table | Champ calculé | Formule |
|-------|---------------|---------|
| devis | montant_ttc | montant_ht + montant_tva - remise |
| factures | montant_ttc | montant_ht + montant_tva - remise |
| sav | date_limite | created_at + (4h/24h/72h selon priorité) |
| sav | majoration_astreinte | 1.5 si période astreinte active |
| maintenances_* | date_prochaine | date_visite + periodicite |
| vehicules | jours_avant_ct | date_prochain_ct - today |

---

# 6. TESTS À EFFECTUER

## 6.1 Tests Authentification

| Test | Action | Résultat attendu |
|------|--------|------------------|
| AUTH-01 | Inscription nouvel utilisateur | Email de confirmation envoyé |
| AUTH-02 | Clic sur lien email | Redirection /complete-profile |
| AUTH-03 | Complétion profil | Création org + user + redirect /demo |
| AUTH-04 | Connexion user existant | Redirect /dashboard |
| AUTH-05 | Déconnexion | Redirect /login + session supprimée |
| AUTH-06 | Accès page protégée sans auth | Redirect /login |
| AUTH-07 | Token expiré | Auto-refresh ou redirect /login |

## 6.2 Tests RLS

| Test | Action | Résultat attendu |
|------|--------|------------------|
| RLS-01 | User A lit clients | Voit uniquement ses clients |
| RLS-02 | User A lit clients de User B | 0 résultat |
| RLS-03 | User A crée client | organisation_id = sa propre org |
| RLS-04 | User A update client de B | Erreur RLS |
| RLS-05 | User A delete client de B | Erreur RLS |

## 6.3 Tests CRUD

| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Clients | ✓ | ✓ | ✓ | ✓ |
| Sites | ✓ | ✓ | ✓ | ✓ |
| Techniciens | ✓ | ✓ | ✓ | ✓ |
| Véhicules | ✓ | ✓ | ✓ | ✓ |
| Contrats | ✓ | ✓ | ✓ | ✓ |
| Devis | ✓ | ✓ | ✓ | ✓ |
| Factures | ✓ | ✓ | ✓ | ✓ |
| SAV | ✓ | ✓ | ✓ | ✓ |
| Travaux | ✓ | ✓ | ✓ | ✓ |

## 6.4 Tests Métier

| Test | Action | Résultat attendu |
|------|--------|------------------|
| MET-01 | Créer SAV P1 | date_limite = now + 4h |
| MET-02 | Créer SAV en période astreinte | majoration = 1.5, tech astreinte affecté |
| MET-03 | Terminer maintenance | date_prochaine calculée |
| MET-04 | Créer devis depuis observation | observation_id lié |
| MET-05 | Transformer devis en facture | facture.devis_id lié |
| MET-06 | Visite en retard | Alerte créée automatiquement |

---

# 7. CHECKLIST DE DÉVELOPPEMENT

## 7.1 Phase 1 : Infrastructure ✅

- [x] Projet Supabase créé
- [x] GitHub repository configuré
- [x] 43 tables créées
- [x] RLS policies appliquées
- [x] Triggers automatiques
- [x] Vues SQL dashboard

## 7.2 Phase 2 : Authentification ✅

- [x] Supabase Auth configuré (PKCE)
- [x] AuthContext créé
- [x] Routes protégées
- [x] Flux inscription 2 étapes
- [x] Fonction RPC complete_registration

## 7.3 Phase 3 : Pages Principales ⏳

- [ ] Dashboard complet
- [ ] ClientsPage CRUD
- [ ] SitesPage CRUD
- [ ] TechniciensPage CRUD
- [ ] VéhiculesPage CRUD
- [ ] ContratsPage CRUD

## 7.4 Phase 4 : Interventions ⏳

- [ ] PlanningPage calendrier
- [ ] MaintenancesPage liste + filtres
- [ ] SAVPage P1/P2/P3 + countdown
- [ ] TravauxPage
- [ ] MiseEnServicePage

## 7.5 Phase 5 : Commercial ⏳

- [ ] DevisPage CRUD + lignes
- [ ] FacturesPage CRUD + lignes
- [ ] PDF génération
- [ ] Export comptable

## 7.6 Phase 6 : Suivi ⏳

- [ ] ObservationsPage
- [ ] AlertesPage
- [ ] RapportsPage
- [ ] FichiersPage

## 7.7 Phase 7 : PWA Terrain ⏳

- [ ] Manifest.json
- [ ] Service Worker
- [ ] Mode offline
- [ ] Sync background

---

# 📎 ANNEXES

## A. Nomenclature des fichiers

```
src/
├── pages/
│   ├── DashboardPage.jsx
│   ├── ClientsPage.jsx
│   ├── SitesPage.jsx
│   ├── TechniciensPage.jsx
│   ├── VehiculesPage.jsx
│   ├── GroupesPage.jsx
│   ├── SoustraitantsPage.jsx
│   ├── AstreintesPage.jsx
│   ├── ContratsPage.jsx
│   ├── PlanningPage.jsx
│   ├── MaintenancesPage.jsx
│   ├── SavPage.jsx
│   ├── TravauxPage.jsx
│   ├── MiseEnServicePage.jsx
│   ├── DevisPage.jsx
│   ├── FacturesPage.jsx
│   ├── RapportsPage.jsx
│   ├── ObservationsPage.jsx
│   ├── AlertesPage.jsx
│   └── SettingsPage.jsx
```

## B. Conventions de code

- **Composants** : PascalCase (DashboardPage)
- **Hooks** : camelCase avec use (useAuth)
- **Services** : camelCase avec Service (authService)
- **Tables SQL** : snake_case (demandes_prospects)
- **Colonnes SQL** : snake_case (organisation_id)

---

*Document généré le 12 janvier 2026*
*Pour Easy Incendie V5*
