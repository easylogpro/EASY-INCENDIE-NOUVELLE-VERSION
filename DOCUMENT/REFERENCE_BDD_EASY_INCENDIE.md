# 🔥 EASY INCENDIE - DOCUMENT DE RÉFÉRENCE BASE DE DONNÉES
# =========================================================
# VERSION: 2.0 - DATE: 12/01/2026
# 43 TABLES - 690 CHAMPS - VÉRIFIÉ À 100%
# =========================================================

# CE DOCUMENT EST LA RÉFÉRENCE UNIQUE POUR TOUT DÉVELOPPEMENT
# TOUJOURS CONSULTER CE FICHIER AVANT DE CODER !

---

# 📊 ORGANIGRAMME DES RELATIONS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ORGANISATIONS                                  │
│                    (Table centrale - multi-tenant)                       │
│                         17 champs                                        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────────────┐
        │                       │                               │
        ▼                       ▼                               ▼
┌───────────────┐      ┌───────────────┐              ┌───────────────┐
│  UTILISATEURS │      │  ABONNEMENTS  │              │  PARAMETRES   │
│   12 champs   │      │   15 champs   │              │   17 champs   │
│   auth_id ────┼──────┤               │              │   logo_url    │
└───────────────┘      └───────────────┘              └───────────────┘
        │
        ▼
┌───────────────┐      ┌───────────────┐              ┌───────────────┐
│   TECHNICIENS │◄────►│    GROUPES    │              │SOUS_TRAITANTS │
│   22 champs   │      │   8 champs    │              │   16 champs   │
│   telephone*  │      │               │              │               │
└───────┬───────┘      └───────────────┘              └───────────────┘
        │
        │         ┌─────────────────────────────────────────────────────┐
        │         │                     CLIENTS                          │
        │         │                    20 champs                         │
        │         │              raison_sociale (NOT NULL)               │
        │         └──────────────────────┬──────────────────────────────┘
        │                                │
        │                                ▼
        │         ┌─────────────────────────────────────────────────────┐
        │         │                      SITES                           │
        └────────►│                    24 champs                         │
                  │           nom (NOT NULL), adresse (NOT NULL)         │
                  └──────────────────────┬──────────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│   ÉQUIPEMENTS   │            │  MAINTENANCES   │            │  INTERVENTIONS  │
│   (7 tables)    │            │   (8 tables)    │            │   (3 tables)    │
│   74 champs     │            │   191 champs    │            │   73 champs     │
└─────────────────┘            └─────────────────┘            └─────────────────┘
     │                              │                              │
     ▼                              ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            COMMERCIAL                                    │
│        contrats (21) │ devis (20) │ factures (24) │ lignes (22)         │
└─────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          LOGS & SYSTÈME                                  │
│  alertes │ observations │ fichiers │ email_logs │ logs_activite │ etc.  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 📋 TABLES DÉTAILLÉES - CATÉGORIE PAR CATÉGORIE

---

## 1️⃣ CORE - AUTHENTIFICATION & CONFIGURATION (6 tables, 85 champs)

### 1.1 organisations
```sql
CREATE TABLE organisations (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom               text,
  siret             text,
  siren             text,
  adresse           text,
  code_postal       text,
  ville             text,
  telephone         text,
  email             text,
  site_web          text,
  forme_juridique   text,
  capital           numeric,
  tva_intra         text,
  ape_naf           text,
  modules_actifs    text[] DEFAULT ARRAY['SSI'],
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
-- TOTAL: 17 champs
```

**Fichiers qui l'utilisent:**
- AuthContext.jsx (SELECT)
- organizationService.js (SELECT, UPDATE)
- CompleteProfilePage.jsx (via RPC)
- SubscriptionPage.jsx (UPDATE modules_actifs)

---

### 1.2 utilisateurs
```sql
CREATE TABLE utilisateurs (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id   uuid REFERENCES organisations(id),
  auth_id           uuid,              -- ⚠️ Lien avec Supabase Auth
  email             text NOT NULL,
  nom               text,
  prenom            text,
  telephone         text,
  role              text DEFAULT 'gestionnaire',
  actif             boolean DEFAULT true,
  derniere_connexion timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
-- TOTAL: 12 champs
```

**Fichiers qui l'utilisent:**
- AuthContext.jsx (SELECT)
- authService.js (SELECT)
- CompleteProfilePage.jsx (via RPC)
- SubscriptionPage.jsx (SELECT)

---

### 1.3 abonnements
```sql
CREATE TABLE abonnements (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id       uuid REFERENCES organisations(id),
  formule               text NOT NULL DEFAULT 'starter',
  statut                text DEFAULT 'active',
  domaines_actifs       text[] DEFAULT '{}',
  nb_utilisateurs_max   integer DEFAULT 2,
  nb_sites_max          integer DEFAULT 50,
  prix_mensuel_ht       numeric,
  options               jsonb DEFAULT '{}',
  date_debut            date DEFAULT CURRENT_DATE,
  date_fin              date,
  stripe_customer_id    text,
  stripe_subscription_id text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
-- TOTAL: 15 champs
```

**Fichiers qui l'utilisent:**
- AuthContext.jsx (SELECT)
- SubscriptionPage.jsx (INSERT)

---

### 1.4 onboarding_progress
```sql
CREATE TABLE onboarding_progress (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id),
  step_profil      boolean DEFAULT false,
  step_logo        boolean DEFAULT false,
  step_client      boolean DEFAULT false,
  step_site        boolean DEFAULT false,
  step_equipement  boolean DEFAULT false,
  step_technicien  boolean DEFAULT false,
  step_rapport     boolean DEFAULT false,
  completed        boolean DEFAULT false,
  completed_at     timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
-- TOTAL: 13 champs
-- ⚠️ NOTE: PAS de colonne "onboarding_complete" ni "etape_actuelle"
```

**Fichiers qui l'utilisent:**
- DashboardPage.jsx (SELECT)
- OnboardingWizard.jsx (UPSERT)
- CompleteProfilePage.jsx (via RPC)

---

### 1.5 parametres
```sql
CREATE TABLE parametres (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id       uuid REFERENCES organisations(id),
  logo_url              text,
  couleur_primaire      text DEFAULT '#EF4444',
  mentions_devis        text,
  mentions_facture      text,
  pied_page_rapport     text,
  numero_agrement       text,
  assurance_rc          text,
  assurance_decennale   text,
  iban                  text,
  bic                   text,
  mode_paiement_defaut  text DEFAULT 'virement',
  delai_paiement_jours  integer DEFAULT 30,
  tva_applicable        boolean DEFAULT true,
  taux_tva              numeric DEFAULT 20.00,
  updated_at            timestamptz DEFAULT now()
);
-- TOTAL: 17 champs
```

**Fichiers qui l'utilisent:**
- organizationService.js (SELECT, INSERT, UPDATE)

---

### 1.6 demandes_prospects
```sql
CREATE TABLE demandes_prospects (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id       uuid REFERENCES organisations(id),
  email                 text,
  telephone             text,
  domaines_demandes     text[],
  profil_demande        text,
  nb_utilisateurs       text,
  tarif_calcule         numeric,
  options_selectionnees jsonb,
  source                text DEFAULT 'questionnaire_landing',
  converti              boolean DEFAULT false,
  created_at            timestamptz DEFAULT now()
);
-- TOTAL: 12 champs
```

**Fichiers qui l'utilisent:**
- RegisterPage.jsx (INSERT)
- CompleteProfilePage.jsx (SELECT, UPDATE)
- DashboardPage.jsx (SELECT)
- SubscriptionPage.jsx (UPDATE)

---

## 2️⃣ MÉTIER - CLIENTS & SITES (5 tables, 90 champs)

### 2.1 clients
```sql
CREATE TABLE clients (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id),
  numero_client       text,
  type                text DEFAULT 'entreprise',
  raison_sociale      text NOT NULL,
  siret               text,
  adresse_facturation text,
  cp_facturation      text,
  ville_facturation   text,
  contact_nom         text,
  contact_prenom      text,
  contact_fonction    text,
  telephone           text,
  email               text,
  email_facturation   text,
  mode_paiement       text DEFAULT 'virement',
  delai_paiement_jours integer DEFAULT 30,
  notes               text,
  actif               boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
-- TOTAL: 21 champs
```

**Fichiers qui l'utilisent:**
- ClientsPage.jsx (SELECT, INSERT, UPDATE, DELETE)
- SitesPage.jsx (SELECT)
- ContratsPage.jsx (SELECT)
- numberingService.js (SELECT)
- DashboardPage.jsx (SELECT count)

---

### 2.2 sites
```sql
CREATE TABLE sites (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id   uuid REFERENCES organisations(id),
  client_id         uuid REFERENCES clients(id),
  technicien_id     uuid REFERENCES techniciens(id),
  code_site         text,
  nom               text NOT NULL,
  adresse           text NOT NULL,
  code_postal       text,
  ville             text,
  acces_instructions text,
  contact_nom       text,
  contact_telephone text,
  contact_email     text,
  type_erp          text,
  categorie_erp     integer,
  effectif          integer,
  latitude          numeric,
  longitude         numeric,
  domaines_actifs   text[] DEFAULT '{}',
  notes             text,
  actif             boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
-- TOTAL: 23 champs
```

**Fichiers qui l'utilisent:**
- SitesPage.jsx (SELECT, INSERT, UPDATE, DELETE)
- ClientsPage.jsx (SELECT)
- ContratsPage.jsx (SELECT)
- SavPage.jsx (SELECT)
- InterventionsPage.jsx (SELECT)
- TravauxPage.jsx (SELECT)
- numberingService.js (SELECT)
- DashboardPage.jsx (SELECT count)

---

### 2.3 techniciens
```sql
CREATE TABLE techniciens (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id),
  groupe_id        uuid REFERENCES groupes(id),
  auth_id          uuid,
  matricule        text,
  nom              text NOT NULL,
  prenom           text NOT NULL,
  email            text,
  telephone        text NOT NULL,      -- ⚠️ NOT NULL !
  adresse          text,
  code_postal      text,
  ville            text,
  date_naissance   date,
  date_embauche    date,
  type_contrat     text,
  habilitations    jsonb DEFAULT '{}',
  certifications   jsonb DEFAULT '{}',
  couleur_planning text DEFAULT '#3B82F6',
  actif            boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
-- TOTAL: 21 champs
```

**Fichiers qui l'utilisent:**
- TechniciensPage.jsx (SELECT, INSERT, UPDATE, DELETE)
- SitesPage.jsx (SELECT)
- SavPage.jsx (SELECT)
- TravauxPage.jsx (SELECT)
- VehiculesPage.jsx (SELECT)
- PlanningPage.jsx (SELECT)

---

### 2.4 groupes
```sql
CREATE TABLE groupes (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id),
  nom              text NOT NULL,
  description      text,
  zone_geographique text,
  actif            boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
-- TOTAL: 8 champs
```

**Fichiers qui l'utilisent:**
- TechniciensPage.jsx (SELECT)

---

### 2.5 sous_traitants
```sql
CREATE TABLE sous_traitants (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id),
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
-- TOTAL: 16 champs
```

**Fichiers qui l'utilisent:**
- ❌ Aucun pour l'instant

---

## 3️⃣ ÉQUIPEMENTS (7 tables, 74 champs)

### 3.1 equipements_ssi (15 champs)
```sql
id, organisation_id, site_id, ecs_marque, ecs_modele, cmsi_marque, cmsi_modele,
nb_di, nb_dm, nb_ds, nb_pcf, nb_ccf, nb_vcf, nb_moteur, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.2 equipements_dsf (10 champs)
```sql
id, organisation_id, site_id, type_dsf, nb_volet, nb_moteur, nb_skydome, nb_ouvrant,
created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.3 equipements_cmp (7 champs)
```sql
id, organisation_id, site_id, nb_pcf, nb_ccf, nb_rideau_cf, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.4 equipements_baes (12 champs)
```sql
id, organisation_id, site_id, marque, modele, nb_baes, nb_baeh, nb_baes_baeh,
nb_telecommande, type_telecommande, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.5 equipements_ext (9 champs)
```sql
id, organisation_id, site_id, type_ext (NOT NULL), marque, nb, annee_fabrication,
created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.6 equipements_ria (7 champs)
```sql
id, organisation_id, site_id, modele, nb, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 3.7 equipements_colsec (7 champs)
```sql
id, organisation_id, site_id, type_colonne, nb, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

---

## 4️⃣ MAINTENANCES (8 tables, 191 champs)

### Structure commune à toutes les maintenances:
```sql
id, organisation_id, site_id, client_id, contrat_id, technicien_id, numero,
rapport_url, observations, visite_n1, visite, planif_visite, valeur_contrat,
nb_heure, statut DEFAULT 'planifie', created_at, updated_at
```

### 4.1 maintenances_ssi (36 champs) - Plus grosse table
Champs spécifiques: technicien2_id, stt1_id, stt2_id, nb_visite, nb_tech,
nb_heure_tech1, nb_heure_tech2, planif1, planif2, visite1, visite2, visite1_n1,
visite2_n1, v0, rapport1, rapport2, prix_maintenance1, prix_maintenance2,
budget_stt1, budget_stt2, facture, date_bureau_controle, date_cc_securite,
date_contrat, fin_contrat, reconduction, resume

**Utilisé:** ❌ Aucun fichier directement (MaintenancesPage utilise SAV)

### 4.2-4.8 Autres maintenances
- maintenances_dsf_naturel (22 champs)
- maintenances_dsf_mecanique (18 champs)
- maintenances_cmp (19 champs)
- maintenances_baes (18 champs)
- maintenances_ext (19 champs)
- maintenances_ria (20 champs)
- maintenances_colsec (19 champs)

**Utilisés:** ❌ Aucun fichier

---

## 5️⃣ INTERVENTIONS (3 tables, 73 champs)

### 5.1 sav (28 champs)
```sql
CREATE TABLE sav (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id),
  site_id          uuid REFERENCES sites(id),
  client_id        uuid REFERENCES clients(id),
  contrat_id       uuid REFERENCES contrats(id),
  technicien_id    uuid REFERENCES techniciens(id),
  stt_id           uuid REFERENCES sous_traitants(id),
  domaine          text NOT NULL,
  numero           text,
  priorite         text DEFAULT 'p3',
  demandeur_nom    text,           -- ⚠️ PAS "contact_nom"
  demandeur_tel    text,           -- ⚠️ PAS "contact_telephone"
  date_demande     timestamptz DEFAULT now(),
  symptome_declare text,           -- ⚠️ PAS "description"
  date_prevue      date,
  date_realisation date,
  diagnostic       text,
  travaux_realises text,
  cout             numeric,
  budget_stt       numeric,
  resultat         text,
  observations     text,
  signature_client text,
  nom_signataire   text,
  facturable       boolean DEFAULT true,
  statut           text DEFAULT 'nouveau',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
-- TOTAL: 28 champs
-- ⚠️ PAS de colonne "date_limite"
```

**Fichiers qui l'utilisent:**
- SavPage.jsx (SELECT, INSERT, UPDATE) - ⚠️ ERREURS À CORRIGER
- InterventionsPage.jsx (SELECT, INSERT, UPDATE)
- MaintenancesPage.jsx (SELECT)
- PlanningPage.jsx (SELECT)
- numberingService.js (SELECT)

---

### 5.2 travaux (23 champs)
```sql
CREATE TABLE travaux (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id  uuid REFERENCES organisations(id),
  site_id          uuid REFERENCES sites(id),
  client_id        uuid REFERENCES clients(id),
  devis_id         uuid REFERENCES devis(id),
  technicien_id    uuid REFERENCES techniciens(id),
  stt_id           uuid REFERENCES sous_traitants(id),
  domaine          text NOT NULL,
  numero           text,
  objet            text,
  description      text,
  bon_commande_client text,
  date_prevue      date,
  date_realisation date,
  travaux_realises text,
  materiel_pose    text,
  cout             numeric,         -- ⚠️ PAS "montant_ht"
  budget_stt       numeric,
  observations     text,
  signature_client text,
  nom_signataire   text,
  statut           text DEFAULT 'planifie',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
-- TOTAL: 23 champs
```

**Fichiers qui l'utilisent:**
- TravauxPage.jsx (SELECT, INSERT, UPDATE) - ⚠️ ERREUR À CORRIGER (montant_ht → cout)

---

### 5.3 mises_en_service_ssi (22 champs)
```sql
id, organisation_id, site_id, client_id, travaux_id, technicien_id, numero,
date_commande, date_visite_chantier, date_mes, date_reception, date_commission_securite,
date_formation, rapport_mes, rapport_formation, cahier_des_charges_ssi, type_ssi,
modele, observations, statut, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

---

## 6️⃣ COMMERCIAL (5 tables, 87 champs)

### 6.1 contrats (21 champs)
```sql
CREATE TABLE contrats (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id     uuid REFERENCES organisations(id),
  client_id           uuid REFERENCES clients(id),
  site_id             uuid REFERENCES sites(id),
  numero_contrat      text,
  domaine             text NOT NULL,
  type_contrat        text DEFAULT 'base',
  periodicite         text DEFAULT 'annuel',
  nb_visites_an       integer DEFAULT 1,
  prestations_incluses jsonb DEFAULT '{}',
  prix_annuel_ht      numeric,
  date_debut          date,
  date_fin            date,
  reconduction_auto   boolean DEFAULT true,
  preavis_jours       integer DEFAULT 90,
  derniere_visite     date,
  prochaine_visite    date,
  statut              text DEFAULT 'actif',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
-- TOTAL: 20 champs
-- ⚠️ PAS de colonne "notes"
```

**Fichiers qui l'utilisent:**
- ContratsPage.jsx (SELECT, INSERT) - ⚠️ ERREUR À CORRIGER (notes n'existe pas)

---

### 6.2 devis (20 champs)
```sql
id, organisation_id, client_id, site_id, observation_id, numero, objet,
date_emission, date_validite, montant_ht, taux_tva, montant_tva, montant_ttc,
remise_percent, remise_montant, conditions, notes_internes, statut, date_acceptation,
created_at, updated_at
```

**Fichiers qui l'utilisent:**
- DevisPage.jsx (SELECT)
- TravauxPage.jsx (SELECT)
- numberingService.js (SELECT)

---

### 6.3 factures (24 champs)
```sql
id, organisation_id, client_id, devis_id, numero, type, objet, date_emission,
date_echeance, montant_ht, taux_tva, montant_tva, montant_ttc, remise_montant,
montant_regle, mode_reglement, date_reglement, reference_paiement, statut,
relance_niveau, notes_internes, created_at, updated_at
```

**Fichiers qui l'utilisent:**
- FacturesPage.jsx (SELECT)
- numberingService.js (SELECT)

---

### 6.4 lignes_devis (11 champs)
```sql
id, devis_id, ordre, reference, description (NOT NULL), quantite, unite,
prix_unitaire_ht (NOT NULL), remise_percent, total_ht, created_at
```
**Utilisé:** ❌ Aucun fichier

### 6.5 lignes_factures (11 champs)
```sql
id, facture_id, ordre, reference, description (NOT NULL), quantite, unite,
prix_unitaire_ht (NOT NULL), remise_percent, total_ht, created_at
```
**Utilisé:** ❌ Aucun fichier

---

## 7️⃣ VÉHICULES (1 table, 18 champs)

### 7.1 vehicules
```sql
CREATE TABLE vehicules (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id       uuid REFERENCES organisations(id),
  technicien_id         uuid REFERENCES techniciens(id),
  immatriculation       text NOT NULL,
  marque                text,
  modele                text,
  type                  text,
  date_mise_circulation date,          -- ⚠️ PAS "annee"
  date_achat            date,
  km_actuel             integer,       -- ⚠️ PAS "kilometrage"
  date_controle_technique date,
  date_prochain_ct      date,          -- ⚠️ PAS "date_ct"
  assurance_numero      text,
  assurance_echeance    date,
  statut                text DEFAULT 'disponible',
  notes                 text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
-- TOTAL: 18 champs
```

**Fichiers qui l'utilisent:**
- VehiculesPage.jsx (SELECT, INSERT, UPDATE) - ⚠️ ERREURS À CORRIGER

---

## 8️⃣ LOGS & SYSTÈME (6 tables, 77 champs)

### 8.1 alertes (20 champs)
```sql
id, organisation_id, site_id, client_id, intervention_type, intervention_id,
observation_id, domaine, type_alerte, priorite, titre (NOT NULL), message, statut,
date_alerte, date_vue, vue_par, date_traitement, traitee_par, created_at, updated_at
```
**Fichiers:** AlertesPage.jsx (SELECT, UPDATE)

### 8.2 observations (16 champs)
```sql
id, organisation_id, site_id, intervention_type, intervention_id, domaine,
description (NOT NULL), localisation, priorite, type, statut, date_constat,
date_traitement, photos, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

### 8.3 fichiers (16 champs)
```sql
id, organisation_id, intervention_type, intervention_id, observation_id, devis_id,
facture_id, type (NOT NULL), nom_fichier, url (NOT NULL), taille_octets, mime_type,
horodatage_legal (NOT NULL), hash_sha256, uploaded_by, created_at
```
**Utilisé:** ❌ Aucun fichier

### 8.4 demo_sessions (6 champs)
```sql
id, organisation_id, started_at, expires_at, converted, created_at
```
**Fichiers:** DemoContext.jsx (INSERT, UPDATE)

### 8.5 email_logs (8 champs)
```sql
id, organisation_id, destinataire (NOT NULL), type_email (NOT NULL), sujet, statut, erreur, created_at
```
**Fichiers:** emailService.js (INSERT)

### 8.6 logs_activite (12 champs)
```sql
id, organisation_id, utilisateur_id, technicien_id, action (NOT NULL), table_cible,
enregistrement_id, donnees_avant, donnees_apres, ip_address, user_agent, created_at
```
**Utilisé:** ❌ Aucun fichier

### 8.7 logs_imports_exports (11 champs)
```sql
id, organisation_id, utilisateur_id, type_donnees (NOT NULL), sens (NOT NULL),
nom_fichier, format, nb_lignes, nb_succes, nb_erreurs, erreurs_detail, created_at
```
**Utilisé:** ❌ Aucun fichier

### 8.8 astreintes (8 champs)
```sql
id, organisation_id, technicien_id, date_debut (NOT NULL), date_fin (NOT NULL),
telephone_astreinte, notes, created_at, updated_at
```
**Utilisé:** ❌ Aucun fichier

---

# 🚨 ERREURS À CORRIGER

## MAPPING CODE → BDD

| Fichier | Champ Code | Champ BDD Correct | Status |
|---------|------------|-------------------|--------|
| SavPage.jsx | `description` | `symptome_declare` | ❌ À corriger |
| SavPage.jsx | `contact_nom` | `demandeur_nom` | ❌ À corriger |
| SavPage.jsx | `contact_telephone` | `demandeur_tel` | ❌ À corriger |
| SavPage.jsx | `date_limite` | ❌ N'existe pas | ❌ À supprimer |
| VehiculesPage.jsx | `annee` | `date_mise_circulation` | ❌ À corriger |
| VehiculesPage.jsx | `kilometrage` | `km_actuel` | ❌ À corriger |
| VehiculesPage.jsx | `date_ct` | `date_prochain_ct` | ❌ À corriger |
| TravauxPage.jsx | `montant_ht` | `cout` | ❌ À corriger |
| ContratsPage.jsx | `notes` | ❌ N'existe pas | ❌ À supprimer |
| OnboardingWizard.jsx | `onboarding_complete` | ❌ N'existe pas | ✅ Corrigé |
| TechniciensPage.jsx | `telephone` manquant | `telephone` (NOT NULL) | ✅ Corrigé |

---

# 📊 STATISTIQUES FINALES

| Catégorie | Tables | Champs | Utilisés | Non Utilisés |
|-----------|--------|--------|----------|--------------|
| Core | 6 | 85 | 52 | 33 |
| Métier | 5 | 89 | 42 | 47 |
| Équipements | 7 | 74 | 0 | 74 |
| Maintenances | 8 | 191 | 0 | 191 |
| Interventions | 3 | 73 | 28 | 45 |
| Commercial | 5 | 87 | 6 | 81 |
| Véhicules | 1 | 18 | 8 | 10 |
| Logs | 8 | 81 | 14 | 67 |
| **TOTAL** | **43** | **698** | **150** | **548** |

**Taux d'utilisation actuel: 21%**

---

# 📁 INDEX DES FICHIERS PAR TABLE

```
TABLES → FICHIERS QUI LES UTILISENT

organisations       → AuthContext, organizationService, SubscriptionPage
utilisateurs        → AuthContext, authService, CompleteProfilePage, SubscriptionPage
abonnements         → AuthContext, SubscriptionPage
onboarding_progress → DashboardPage, OnboardingWizard, CompleteProfilePage
parametres          → organizationService
demandes_prospects  → RegisterPage, CompleteProfilePage, DashboardPage, SubscriptionPage
clients             → ClientsPage, SitesPage, ContratsPage, numberingService, DashboardPage
sites               → SitesPage, ClientsPage, ContratsPage, SavPage, InterventionsPage, TravauxPage, numberingService, DashboardPage
techniciens         → TechniciensPage, SitesPage, SavPage, TravauxPage, VehiculesPage, PlanningPage
groupes             → TechniciensPage
sav                 → SavPage, InterventionsPage, MaintenancesPage, PlanningPage, numberingService
travaux             → TravauxPage
contrats            → ContratsPage
devis               → DevisPage, TravauxPage, numberingService
factures            → FacturesPage, numberingService
vehicules           → VehiculesPage
alertes             → AlertesPage
demo_sessions       → DemoContext
email_logs          → emailService
```

---

# FIN DU DOCUMENT DE RÉFÉRENCE
# Version 2.0 - 12/01/2026
# À CONSULTER AVANT TOUT DÉVELOPPEMENT
