# 📋 CAHIER DES CHARGES EASY INCENDIE
## Version 5.0 - 3 janvier 2026
## Document de référence - Mis à jour à chaque avancement

---

# 📌 HISTORIQUE DES VERSIONS

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 28/12/2024 | Création initiale |
| 2.0 | 29/12/2024 | Ajout architecture multi-domaines |
| 3.0 | 30/12/2024 | Définition 29 types de rapports |
| 4.0 | 30/12/2024 | Groupes techniciens, affectations, SAV priorités, astreintes |
| **5.0** | **03/01/2026** | **Migration Supabase Auth, 43 tables finales, RLS complet, Frontend V6** |

---

# 📌 TABLE DES MATIÈRES

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Architecture Technique](#2-architecture-technique)
3. [Domaines & Modules](#3-domaines--modules)
4. [Types de Rapports](#4-types-de-rapports)
5. [Base de Données - Structure Complète](#5-base-de-données---structure-complète)
6. [RLS Policies](#6-rls-policies)
7. [Frontend](#7-frontend)
8. [Authentification](#8-authentification)
9. [Tarification](#9-tarification)
10. [Roadmap](#10-roadmap)

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
│                     EASY INCENDIE V5                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend    │ React 18 + Vite + Tailwind CSS                  │
│  Backend     │ Supabase (PostgreSQL + Auth + Storage + RLS)    │
│  Auth        │ Supabase Authentication (PKCE Flow)             │
│  PWA         │ Application terrain installable                  │
│  PDF         │ Génération côté serveur (Edge Functions)         │
│  Paiement    │ Stripe (abonnements + factures)                 │
│  Hébergement │ Vercel / Netlify                                │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Repositories & Accès

| Projet | URL |
|--------|-----|
| GitHub | github.com/easylogpro/easy-incendie |
| Supabase | ofoibgbrviywlqxrnxvq.supabase.co |

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

---

# 5. BASE DE DONNÉES - STRUCTURE COMPLÈTE

## 5.1 Vue d'ensemble

| Métrique | Valeur |
|----------|--------|
| **Total tables** | **43** |

## 5.2 Liste des 43 tables

1. abonnements
2. alertes
3. astreintes
4. clients
5. contrats
6. demandes_prospects
7. demo_sessions
8. devis
9. email_logs
10. equipements_baes
11. equipements_cmp
12. equipements_colsec
13. equipements_dsf
14. equipements_ext
15. equipements_ria
16. equipements_ssi
17. factures
18. fichiers
19. groupes
20. lignes_devis
21. lignes_factures
22. logs_activite
23. logs_imports_exports
24. maintenances_baes
25. maintenances_cmp
26. maintenances_colsec
27. maintenances_dsf_mecanique
28. maintenances_dsf_naturel
29. maintenances_ext
30. maintenances_ria
31. maintenances_ssi
32. mises_en_service_ssi
33. observations
34. onboarding_progress
35. organisations
36. parametres
37. sav
38. sites
39. sous_traitants
40. techniciens
41. travaux
42. utilisateurs
43. vehicules

---

## 5.3 Structure complète de chaque table

### TABLE : abonnements

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| formule | text |
| statut | text |
| domaines_actifs | ARRAY |
| nb_utilisateurs_max | integer |
| nb_sites_max | integer |
| prix_mensuel_ht | numeric |
| options | jsonb |
| date_debut | date |
| date_fin | date |
| stripe_customer_id | text |
| stripe_subscription_id | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : alertes

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| intervention_type | text |
| intervention_id | uuid |
| observation_id | uuid |
| domaine | text |
| type_alerte | text |
| priorite | text |
| titre | text |
| message | text |
| statut | text |
| date_alerte | timestamp with time zone |
| date_vue | timestamp with time zone |
| vue_par | uuid |
| date_traitement | timestamp with time zone |
| traitee_par | uuid |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : astreintes

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| technicien_id | uuid |
| date_debut | timestamp with time zone |
| date_fin | timestamp with time zone |
| telephone_astreinte | text |
| notes | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : clients

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| numero_client | text |
| type | text |
| raison_sociale | text |
| siret | text |
| adresse_facturation | text |
| cp_facturation | text |
| ville_facturation | text |
| contact_nom | text |
| contact_prenom | text |
| contact_fonction | text |
| telephone | text |
| email | text |
| email_facturation | text |
| mode_paiement | text |
| delai_paiement_jours | integer |
| notes | text |
| actif | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : contrats

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| client_id | uuid |
| site_id | uuid |
| numero_contrat | text |
| domaine | text |
| type_contrat | text |
| periodicite | text |
| nb_visites_an | integer |
| prestations_incluses | jsonb |
| prix_annuel_ht | numeric |
| date_debut | date |
| date_fin | date |
| reconduction_auto | boolean |
| preavis_jours | integer |
| derniere_visite | date |
| prochaine_visite | date |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : demandes_prospects

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| email | text |
| telephone | text |
| domaines_demandes | ARRAY |
| profil_demande | text |
| nb_utilisateurs | text |
| tarif_calcule | numeric |
| options_selectionnees | jsonb |
| source | text |
| converti | boolean |
| created_at | timestamp with time zone |

---

### TABLE : demo_sessions

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| started_at | timestamp with time zone |
| expires_at | timestamp with time zone |
| converted | boolean |
| created_at | timestamp with time zone |

---

### TABLE : devis

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| client_id | uuid |
| site_id | uuid |
| observation_id | uuid |
| numero | text |
| objet | text |
| date_emission | date |
| date_validite | date |
| montant_ht | numeric |
| taux_tva | numeric |
| montant_tva | numeric |
| montant_ttc | numeric |
| remise_percent | numeric |
| remise_montant | numeric |
| conditions | text |
| notes_internes | text |
| statut | text |
| date_acceptation | date |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : email_logs

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| destinataire | text |
| type_email | text |
| sujet | text |
| statut | text |
| erreur | text |
| created_at | timestamp with time zone |

---

### TABLE : equipements_baes

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| marque | text |
| modele | text |
| nb_baes | integer |
| nb_baeh | integer |
| nb_baes_baeh | integer |
| nb_telecommande | integer |
| type_telecommande | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_cmp

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| nb_pcf | integer |
| nb_ccf | integer |
| nb_rideau_cf | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_colsec

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| type_colonne | text |
| nb | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_dsf

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| type_dsf | text |
| nb_volet | integer |
| nb_moteur | integer |
| nb_skydome | integer |
| nb_ouvrant | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_ext

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| type_ext | text |
| marque | text |
| nb | integer |
| annee_fabrication | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_ria

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| modele | text |
| nb | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : equipements_ssi

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| ecs_marque | text |
| ecs_modele | text |
| cmsi_marque | text |
| cmsi_modele | text |
| nb_di | integer |
| nb_dm | integer |
| nb_ds | integer |
| nb_pcf | integer |
| nb_ccf | integer |
| nb_vcf | integer |
| nb_moteur | integer |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : factures

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| client_id | uuid |
| devis_id | uuid |
| numero | text |
| type | text |
| objet | text |
| date_emission | date |
| date_echeance | date |
| montant_ht | numeric |
| taux_tva | numeric |
| montant_tva | numeric |
| montant_ttc | numeric |
| remise_montant | numeric |
| montant_regle | numeric |
| mode_reglement | text |
| date_reglement | date |
| reference_paiement | text |
| statut | text |
| relance_niveau | integer |
| notes_internes | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : fichiers

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| intervention_type | text |
| intervention_id | uuid |
| observation_id | uuid |
| devis_id | uuid |
| facture_id | uuid |
| type | text |
| nom_fichier | text |
| url | text |
| taille_octets | integer |
| mime_type | text |
| horodatage_legal | timestamp with time zone |
| hash_sha256 | text |
| uploaded_by | uuid |
| created_at | timestamp with time zone |

---

### TABLE : groupes

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| nom | text |
| description | text |
| zone_geographique | text |
| actif | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : lignes_devis

| Colonne | Type |
|---------|------|
| id | uuid |
| devis_id | uuid |
| ordre | integer |
| reference | text |
| description | text |
| quantite | numeric |
| unite | text |
| prix_unitaire_ht | numeric |
| remise_percent | numeric |
| total_ht | numeric |
| created_at | timestamp with time zone |

---

### TABLE : lignes_factures

| Colonne | Type |
|---------|------|
| id | uuid |
| facture_id | uuid |
| ordre | integer |
| reference | text |
| description | text |
| quantite | numeric |
| unite | text |
| prix_unitaire_ht | numeric |
| remise_percent | numeric |
| total_ht | numeric |
| created_at | timestamp with time zone |

---

### TABLE : logs_activite

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| utilisateur_id | uuid |
| technicien_id | uuid |
| action | text |
| table_cible | text |
| enregistrement_id | uuid |
| donnees_avant | jsonb |
| donnees_apres | jsonb |
| ip_address | text |
| user_agent | text |
| created_at | timestamp with time zone |

---

### TABLE : logs_imports_exports

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| utilisateur_id | uuid |
| type_donnees | text |
| sens | text |
| nom_fichier | text |
| format | text |
| nb_lignes | integer |
| nb_succes | integer |
| nb_erreurs | integer |
| erreurs_detail | jsonb |
| created_at | timestamp with time zone |

---

### TABLE : maintenances_baes

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_total_blocs | integer |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_cmp

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_pcf | integer |
| nb_ccf | integer |
| nb_rideau_cf | integer |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_colsec

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_colonnes | integer |
| type_colonne | text |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_dsf_mecanique

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_vcf | integer |
| nb_moteur | integer |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_dsf_naturel

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_exutoires | integer |
| nb_ouvrants_facade | integer |
| nb_commandes_co2 | integer |
| nb_commandes_treuil | integer |
| nb_commandes_elec | integer |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_ext

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_total | integer |
| nb_conformes | integer |
| nb_a_reviser | integer |
| nb_a_remplacer | integer |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_ria

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| numero | text |
| nb_ria | integer |
| type_source_eau | text |
| pression_disponible | numeric |
| debit_disponible | numeric |
| rapport_url | text |
| observations | text |
| visite_n1 | date |
| visite | date |
| planif_visite | date |
| valeur_contrat | numeric |
| nb_heure | numeric |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : maintenances_ssi

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| technicien2_id | uuid |
| stt1_id | uuid |
| stt2_id | uuid |
| numero | text |
| nb_visite | integer |
| nb_tech | integer |
| nb_heure_tech1 | numeric |
| nb_heure_tech2 | numeric |
| planif1 | date |
| planif2 | date |
| visite1 | date |
| visite2 | date |
| visite1_n1 | date |
| visite2_n1 | date |
| v0 | date |
| rapport1 | text |
| rapport2 | text |
| prix_maintenance1 | numeric |
| prix_maintenance2 | numeric |
| budget_stt1 | numeric |
| budget_stt2 | numeric |
| facture | text |
| observations | text |
| date_bureau_controle | date |
| date_cc_securite | date |
| date_contrat | date |
| fin_contrat | date |
| valeur_contrat | numeric |
| reconduction | boolean |
| resume | text |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : mises_en_service_ssi

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| travaux_id | uuid |
| technicien_id | uuid |
| numero | text |
| date_commande | date |
| date_visite_chantier | date |
| date_mes | date |
| date_reception | date |
| date_commission_securite | date |
| date_formation | date |
| rapport_mes | text |
| rapport_formation | text |
| cahier_des_charges_ssi | text |
| type_ssi | text |
| modele | text |
| observations | text |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : observations

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| intervention_type | text |
| intervention_id | uuid |
| domaine | text |
| description | text |
| localisation | text |
| priorite | text |
| type | text |
| statut | text |
| date_constat | date |
| date_traitement | date |
| photos | ARRAY |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : onboarding_progress

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| step_profil | boolean |
| step_logo | boolean |
| step_client | boolean |
| step_site | boolean |
| step_equipement | boolean |
| step_technicien | boolean |
| step_rapport | boolean |
| completed | boolean |
| completed_at | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : organisations

| Colonne | Type |
|---------|------|
| id | uuid |
| nom | text |
| siret | text |
| siren | text |
| adresse | text |
| code_postal | text |
| ville | text |
| telephone | text |
| email | text |
| site_web | text |
| forme_juridique | text |
| capital | numeric |
| tva_intra | text |
| ape_naf | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : parametres

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| logo_url | text |
| couleur_primaire | text |
| mentions_devis | text |
| mentions_facture | text |
| pied_page_rapport | text |
| numero_agrement | text |
| assurance_rc | text |
| assurance_decennale | text |
| iban | text |
| bic | text |
| mode_paiement_defaut | text |
| delai_paiement_jours | integer |
| tva_applicable | boolean |
| taux_tva | numeric |
| updated_at | timestamp with time zone |

---

### TABLE : sav

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| contrat_id | uuid |
| technicien_id | uuid |
| stt_id | uuid |
| domaine | text |
| numero | text |
| priorite | text |
| demandeur_nom | text |
| demandeur_tel | text |
| date_demande | timestamp with time zone |
| symptome_declare | text |
| date_prevue | date |
| date_realisation | date |
| diagnostic | text |
| travaux_realises | text |
| cout | numeric |
| budget_stt | numeric |
| resultat | text |
| observations | text |
| signature_client | text |
| nom_signataire | text |
| facturable | boolean |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : sites

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| client_id | uuid |
| technicien_id | uuid |
| code_site | text |
| nom | text |
| adresse | text |
| code_postal | text |
| ville | text |
| acces_instructions | text |
| contact_nom | text |
| contact_telephone | text |
| contact_email | text |
| type_erp | text |
| categorie_erp | integer |
| effectif | integer |
| latitude | numeric |
| longitude | numeric |
| domaines_actifs | ARRAY |
| notes | text |
| actif | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : sous_traitants

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| raison_sociale | text |
| siret | text |
| contact_nom | text |
| contact_prenom | text |
| telephone | text |
| email | text |
| adresse | text |
| code_postal | text |
| ville | text |
| domaines_competence | ARRAY |
| taux_horaire | numeric |
| actif | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : techniciens

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| groupe_id | uuid |
| auth_id | uuid |
| matricule | text |
| nom | text |
| prenom | text |
| email | text |
| telephone | text |
| adresse | text |
| code_postal | text |
| ville | text |
| date_naissance | date |
| date_embauche | date |
| type_contrat | text |
| habilitations | jsonb |
| certifications | jsonb |
| couleur_planning | text |
| actif | boolean |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : travaux

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| site_id | uuid |
| client_id | uuid |
| devis_id | uuid |
| technicien_id | uuid |
| stt_id | uuid |
| domaine | text |
| numero | text |
| objet | text |
| description | text |
| bon_commande_client | text |
| date_prevue | date |
| date_realisation | date |
| travaux_realises | text |
| materiel_pose | text |
| cout | numeric |
| budget_stt | numeric |
| observations | text |
| signature_client | text |
| nom_signataire | text |
| statut | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : utilisateurs

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| auth_id | uuid |
| email | text |
| nom | text |
| prenom | text |
| telephone | text |
| role | text |
| actif | boolean |
| derniere_connexion | timestamp with time zone |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

### TABLE : vehicules

| Colonne | Type |
|---------|------|
| id | uuid |
| organisation_id | uuid |
| technicien_id | uuid |
| immatriculation | text |
| marque | text |
| modele | text |
| type | text |
| date_mise_circulation | date |
| date_achat | date |
| km_actuel | integer |
| date_controle_technique | date |
| date_prochain_ct | date |
| assurance_numero | text |
| assurance_echeance | date |
| statut | text |
| notes | text |
| created_at | timestamp with time zone |
| updated_at | timestamp with time zone |

---

# 6. RLS POLICIES

## 6.1 Pattern Multi-Tenant Standard

Appliqué à la majorité des tables :

```sql
organisation_id IN (
  SELECT utilisateurs.organisation_id
  FROM utilisateurs
  WHERE utilisateurs.auth_id = auth.uid()
)
```

## 6.2 Liste complète des policies

| Table | Policy | Commande | Condition |
|-------|--------|----------|-----------|
| parametres | rls_parametres | ALL | Multi-tenant standard |
| abonnements | rls_abonnements | ALL | Multi-tenant standard |
| groupes | rls_groupes | ALL | Multi-tenant standard |
| utilisateurs | user_insert | INSERT | null (autorisé) |
| utilisateurs | user_select | SELECT | auth_id = auth.uid() |
| utilisateurs | user_update | UPDATE | auth_id = auth.uid() |
| sous_traitants | rls_sous_traitants | ALL | Multi-tenant standard |
| techniciens | rls_techniciens | ALL | Multi-tenant standard |
| clients | rls_clients | ALL | Multi-tenant standard |
| maintenances_ria | rls_maintenances_ria | ALL | Multi-tenant standard |
| sites | rls_sites | ALL | Multi-tenant standard |
| equipements_baes | rls_equipements_baes | ALL | Multi-tenant standard |
| equipements_ssi | rls_equipements_ssi | ALL | Multi-tenant standard |
| equipements_cmp | rls_equipements_cmp | ALL | Multi-tenant standard |
| equipements_dsf | rls_equipements_dsf | ALL | Multi-tenant standard |
| equipements_ext | rls_equipements_ext | ALL | Multi-tenant standard |
| equipements_colsec | rls_equipements_colsec | ALL | Multi-tenant standard |
| equipements_ria | rls_equipements_ria | ALL | Multi-tenant standard |
| maintenances_colsec | rls_maintenances_colsec | ALL | Multi-tenant standard |
| mises_en_service_ssi | rls_mises_en_service_ssi | ALL | Multi-tenant standard |
| sav | rls_sav | ALL | Multi-tenant standard |
| travaux | rls_travaux | ALL | Multi-tenant standard |
| maintenances_dsf_naturel | rls_maintenances_dsf_naturel | ALL | Multi-tenant standard |
| maintenances_ext | rls_maintenances_ext | ALL | Multi-tenant standard |
| maintenances_ssi | rls_maintenances_ssi | ALL | Multi-tenant standard |
| contrats | rls_contrats | ALL | Multi-tenant standard |
| maintenances_baes | rls_maintenances_baes | ALL | Multi-tenant standard |
| maintenances_cmp | rls_maintenances_cmp | ALL | Multi-tenant standard |
| maintenances_dsf_mecanique | rls_maintenances_dsf_mecanique | ALL | Multi-tenant standard |
| alertes | rls_alertes | ALL | Multi-tenant standard |
| astreintes | rls_astreintes | ALL | Multi-tenant standard |
| devis | rls_devis | ALL | Multi-tenant standard |
| factures | rls_factures | ALL | Multi-tenant standard |
| lignes_devis | rls_lignes_devis | ALL | Via devis.organisation_id |
| lignes_factures | rls_lignes_factures | ALL | Via factures.organisation_id |
| observations | rls_observations | ALL | Multi-tenant standard |
| demandes_prospects | rls_demandes_prospects | ALL | Multi-tenant standard |
| demo_sessions | rls_demo_sessions | ALL | Multi-tenant standard |
| email_logs | rls_email_logs | ALL | Multi-tenant standard |
| onboarding_progress | onboarding_insert | INSERT | null (autorisé) |
| onboarding_progress | onboarding_select | SELECT | true |
| onboarding_progress | onboarding_update | UPDATE | true |
| onboarding_progress | rls_onboarding_progress | ALL | Multi-tenant standard |
| fichiers | rls_fichiers | ALL | Multi-tenant standard |
| logs_activite | rls_logs_activite | ALL | Multi-tenant standard |
| logs_imports_exports | rls_logs_imports_exports | ALL | Multi-tenant standard |
| vehicules | rls_vehicules | ALL | Multi-tenant standard |
| organisations | org_insert | INSERT | null (autorisé) |
| organisations | org_select | SELECT | true |
| organisations | org_update | UPDATE | true |

---

# 7. FRONTEND

## 7.1 Structure des fichiers

```
src/
├── App.jsx                          # Routes principales
├── main.jsx                         # Point d'entrée
├── config/
│   └── supabase.js                  # Client Supabase (PKCE)
├── contexts/
│   ├── AuthContext.jsx              # Gestion auth + session
│   └── DemoContext.jsx              # Mode démo 3 minutes
├── pages/
│   ├── LandingPage.jsx              # Page d'accueil
│   ├── LoginPage.jsx                # Connexion
│   ├── RegisterPage.jsx             # Inscription (email+mdp)
│   ├── AuthCallbackPage.jsx         # Callback email confirmation
│   ├── CompleteProfilePage.jsx      # Étape 2 inscription
│   ├── DashboardPage.jsx            # Tableau de bord
│   ├── ClientsPage.jsx              # CRUD Clients
│   ├── SitesPage.jsx                # CRUD Sites
│   ├── TechniciensPage.jsx          # CRUD Techniciens
│   ├── InterventionsPage.jsx        # Interventions
│   ├── PlanningPage.jsx             # Planning
│   ├── DevisPage.jsx                # Devis
│   ├── FacturesPage.jsx             # Factures
│   ├── AlertesPage.jsx              # Alertes
│   └── SettingsPage.jsx             # Paramètres
├── components/
│   ├── ui/                          # Composants UI réutilisables
│   ├── onboarding/
│   │   └── OnboardingWizard.jsx     # Wizard 7 étapes
│   └── demo/
│       ├── DemoBanner.jsx           # Bannière mode démo
│       └── LockedFeatureModal.jsx   # Modal fonctionnalité verrouillée
├── layouts/
│   └── MainLayout.jsx               # Layout avec sidebar
├── services/
│   ├── authService.js               # Helpers auth
│   ├── emailService.js              # Envoi emails
│   ├── numberingService.js          # Numérotation auto
│   └── organizationService.js       # Helpers organisation
├── hooks/
│   └── useVersionCheck.js           # Vérification version
├── utils/
│   └── pricingAlgorithm.js          # Algorithme tarification
└── styles/
    └── index.css                    # Styles Tailwind
```

## 7.2 Routes

| Route | Composant | Protection |
|-------|-----------|------------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public (redirect si connecté) |
| `/register` | RegisterPage | Public (redirect si connecté) |
| `/auth/callback` | AuthCallbackPage | Callback Supabase |
| `/complete-profile` | CompleteProfilePage | Authentifié + profil incomplet |
| `/dashboard` | DashboardPage | Protégé |
| `/clients` | ClientsPage | Protégé |
| `/sites` | SitesPage | Protégé |
| `/techniciens` | TechniciensPage | Protégé |
| `/planning` | PlanningPage | Protégé |
| `/interventions` | InterventionsPage | Protégé |
| `/devis` | DevisPage | Protégé |
| `/factures` | FacturesPage | Protégé |
| `/alertes` | AlertesPage | Protégé |
| `/settings` | SettingsPage | Protégé |

---

# 8. AUTHENTIFICATION

## 8.1 Stack Auth

| Élément | Technologie |
|---------|-------------|
| Provider | **Supabase Auth** |
| Flow | **PKCE** (Proof Key for Code Exchange) |
| Session | LocalStorage (persistSession: true) |
| Tokens | JWT auto-refresh |

## 8.2 Flux d'inscription

```
1. RegisterPage
   └── Email + Mot de passe
       └── supabase.auth.signUp()
           └── Email envoyé avec lien de confirmation

2. Email de confirmation
   └── Lien : /auth/callback?code=xxx (PKCE)
   └── Ou : /auth/callback?token_hash=xxx&type=email

3. AuthCallbackPage
   └── Si code → exchangeCodeForSession(code)
   └── Si token_hash → verifyOtp({ token_hash, type })
   └── Redirect → /complete-profile

4. CompleteProfilePage
   └── Prénom, Nom, Téléphone (obligatoire)
   └── Entreprise, SIRET, Ville
   └── INSERT organisations + INSERT utilisateurs
   └── Redirect → /dashboard
```

## 8.3 Configuration Supabase

```javascript
// src/config/supabase.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: "pkce",
  },
});
```

---

# 9. TARIFICATION

## 9.1 Tarification personnalisée (algorithme)

Le prix est calculé selon :
- Nombre de domaines sélectionnés
- Nombre d'utilisateurs demandés

| Domaines | 1 user | 2-5 users | 6-10 users | 11+ users |
|----------|--------|-----------|------------|-----------|
| 1 domaine | 59€ | 89€ | 149€ | Sur devis |
| 2 domaines | 69€ | 99€ | 159€ | Sur devis |
| 3+ domaines | 79€ | 109€ | 169€ | 299€ |

## 9.2 Modules optionnels

| Module | Prix/mois |
|--------|-----------|
| IA (aide rédaction) | +9€ à +29€ |
| Export comptable | +5€ à +15€ |
| Veille réglementaire | +5€ à +19€ |

## 9.3 Offre commerciale

- **-10% le premier mois**
- **Pas d'essai gratuit** → Démo 3 minutes en lecture seule
- Téléphone **obligatoire** à l'inscription

---

# 10. ROADMAP

## 10.1 État d'avancement

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1. Infrastructure | Supabase, GitHub | ✅ FAIT |
| 2. Landing Page | V3 avec modals | ✅ FAIT |
| 3. Base de données | 43 tables + RLS | ✅ FAIT |
| 4. Authentification | Supabase Auth + PKCE | ✅ FAIT |
| 5. Frontend structure | Pages + Routes + Contexts | ✅ FAIT |
| **6. CRUD** | Clients, Sites, Équipements | ⏳ EN COURS |
| 7. Dashboard | Stats temps réel | ⏳ À FAIRE |
| 8. Techniciens | Groupes, Affectations | ⏳ À FAIRE |
| 9. Planning | Interventions, Calendrier | ⏳ À FAIRE |
| 10. Rapports | Formulaires dynamiques (29 types) | ⏳ À FAIRE |
| 11. SAV | Priorités, Astreintes | ⏳ À FAIRE |
| 12. PWA Terrain | App mobile | ⏳ À FAIRE |
| 13. PDF | Génération rapports | ⏳ À FAIRE |
| 14. Facturation | Devis, Factures, Stripe | ⏳ À FAIRE |
| 15. Déploiement | Production | ⏳ À FAIRE |

## 10.2 Prochaines étapes immédiates

1. ✅ Authentification Supabase fonctionnelle
2. ⏳ Connecter `ClientsPage.jsx` au vrai CRUD
3. ⏳ Connecter `SitesPage.jsx` au vrai CRUD
4. ⏳ Premier rapport fonctionnel

---

# 📎 ANNEXES

## A. Liens utiles

| Ressource | URL |
|-----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/ofoibgbrviywlqxrnxvq |
| GitHub | https://github.com/easylogpro/easy-incendie |

## B. Variables d'environnement

```env
VITE_SUPABASE_URL=https://ofoibgbrviywlqxrnxvq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

**Document maintenu à jour à chaque avancement du projet.**

*Dernière mise à jour : 3 janvier 2026 - V5.0*
