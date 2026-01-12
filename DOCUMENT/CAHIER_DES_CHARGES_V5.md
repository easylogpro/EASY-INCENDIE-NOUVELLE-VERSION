# 📋 CAHIER DES CHARGES EASY INCENDIE
## Version 5.0 - 30 décembre 2024
## Document de référence COMPLET et à jour

---

# 📌 HISTORIQUE DES VERSIONS

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 28/12/2024 | Création initiale |
| 2.0 | 29/12/2024 | Ajout architecture multi-domaines |
| 3.0 | 30/12/2024 | Définition 29 types de rapports |
| 4.0 | 30/12/2024 | Groupes techniciens, SAV, astreintes |
| **5.0** | **30/12/2024** | **Algorithme tarification, Démo 3min, Traçabilité, Champs obligatoires** |

---

# 🔴 DÉCISIONS CLÉS V5

| Décision | Détail |
|----------|--------|
| ❌ PAS de trial gratuit | Risque concurrence qui copie |
| ✅ Démo 3 minutes | Lecture seule, rapports selon demande |
| ✅ -10% premier mois | Offre de lancement |
| ✅ Tarif UNIQUE calculé | Pas de choix de plans |
| ✅ Champs OBLIGATOIRES | Tel, Email, Nom, Ville, SIRET |
| ✅ Traçabilité | Consigner toutes les demandes |
| ⚖️ JURIDIQUE | Dire "aide à" jamais "conforme NF" |

---

# 🎯 FLUX UTILISATEUR COMPLET

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE                              │
│                                                                  │
│  Questionnaire 5 étapes :                                       │
│  1. Domaines d'intervention (SSI, DSF, BAES, EXT, RIA...)      │
│  2. Profil (Mainteneur, Installateur, Sous-traitant, Artisan)  │
│  3. Nombre d'UTILISATEURS (pas "techniciens")                  │
│  4. Nombre de sites                                             │
│  5. Gestion actuelle                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALGORITHME TARIFICATION                       │
│                                                                  │
│  Domaines × Utilisateurs → TARIF UNIQUE                         │
│  + Options sélectionnables (IA, Compta, Veille)                 │
│                                                                  │
│  ⚠️ PAS de choix de "plans" - UN SEUL tarif calculé             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INSCRIPTION                               │
│                                                                  │
│  3 étapes avec champs OBLIGATOIRES :                            │
│                                                                  │
│  Étape 1: Email + Mot de passe                                  │
│  Étape 2: Prénom + Nom + TÉLÉPHONE (obligatoire)               │
│  Étape 3: Entreprise + SIRET (obligatoire) + VILLE (oblig.)    │
│                                                                  │
│  → Enregistrement dans demandes_prospects (TRAÇABILITÉ)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     🆕 DÉMO 3 MINUTES                            │
│                                                                  │
│  ⏱️ Timer visible en permanence                                  │
│                                                                  │
│  ✅ VISIBLE (lecture seule) :                                   │
│     - Dashboard avec stats                                       │
│     - Rapports SELON LEUR DEMANDE uniquement                    │
│     - Planning                                                   │
│     - Navigation                                                 │
│                                                                  │
│  🔒 VERROUILLÉ :                                                │
│     - Créer/Modifier rapport                                    │
│     - Générer PDF                                               │
│     - Exporter données                                          │
│     - Ajouter client/site                                       │
│                                                                  │
│  → Fin 3 min = Modal "Souscrire -10%"                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PAIEMENT                                  │
│                                                                  │
│  Tarif calculé + Options sélectionnées                          │
│  -10% premier mois automatique                                  │
│                                                                  │
│  Paiement Stripe → Création abonnement                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DASHBOARD + ONBOARDING 7 ÉTAPES                  │
│                                                                  │
│  1. Profil entreprise (Logo, Adresse, SIRET, Assurances)       │
│  2. Préférences (Numérotation, Format date)                     │
│  3. Techniciens (Équipe + Habilitations)                        │
│  4. Sous-traitants (Externes + Documents)                       │
│  5. Catalogue (Articles + Prix + Tarifs horaires)               │
│  6. Clients & Sites (Import Excel ou manuel)                    │
│  7. Équipements (Par site + types)                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               SÉQUENCE EMAILS AUTOMATIQUES                       │
│                                                                  │
│  J0  : Bienvenue + Guide PDF                                    │
│  J+1 : Rappel configuration profil                              │
│  J+3 : Rappel import clients (modèle Excel)                     │
│  J+5 : Créez votre premier rapport                              │
│  J+7 : Check-in "Besoin d'aide ?"                               │
│  J+10: Rappel compléter configuration                           │
│  J+30: Fidélité "1 mois avec nous !"                            │
└─────────────────────────────────────────────────────────────────┘
```

---

# 💰 GRILLE TARIFAIRE (selon Excel)

## Prix de base selon Domaines × Utilisateurs

| Nb Utilisateurs | 1 Domaine | 2 Domaines | 3+ Domaines |
|-----------------|-----------|------------|-------------|
| **1 utilisateur** | 59€ | 69€ | 79€ |
| **2 à 5 utilisateurs** | 89€ | 99€ | 109€ |
| **6 à 10 utilisateurs** | 149€ | 159€ | 169€ |
| **11 à 25 utilisateurs** | 299€ | 299€ | 299€ |

## Options additionnelles (sélectionnables)

| Module | Prix/mois | Description |
|--------|-----------|-------------|
| IA | +9€ | Intelligence artificielle pour rapports |
| Export comptable | +5€ | Export vers logiciel comptable |
| Veille réglementaire | +5€ | Alertes évolutions normatives |

## Offre premier mois

**-10% automatique sur le premier mois**

---

# 📋 RAPPORTS FOURNIS PAR PROFIL

## Matrice Profil × Domaine

| Profil | SSI | DSF | CMP | BAES | EXT | RIA | COLSEC |
|--------|-----|-----|-----|------|-----|-----|--------|
| **Mainteneur** | Cat A, Cat B, Evac 2/3/4, Formation, SAV | Naturel, Mécanique, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, SAV, Travaux | Maintenance, Travaux | Maintenance, Travaux | Maintenance, Travaux |
| **Installateur + Mainteneur** | Cat A, Cat B, Evac 2/3/4, Formation, SAV, **MES** | idem | idem | idem | idem | idem | idem |
| **Installateur** | SAV, MES, Formation | idem | idem | idem | idem | idem | idem |
| **Sous-traitant** | SAV, MES, Formation | idem | idem | idem | idem | idem | idem |
| **Artisan** | SAV, MES, Formation | idem | idem | idem | idem | idem | idem |

---

# 🔥 LES 7 DOMAINES MÉTIER

| Code | Domaine | Icône | Couleur |
|------|---------|-------|---------|
| **SSI** | Système Sécurité Incendie | 🔥 | Rouge |
| **DSF** | Désenfumage | 💨 | Orange |
| **CMP** | Compartimentage | 🚪 | Violet |
| **BAES** | Blocs Autonomes | 🚨 | Jaune |
| **EXT** | Extincteurs | 🧯 | Rouge |
| **RIA** | Robinets Incendie Armés | 💧 | Cyan |
| **COLSEC** | Colonnes Sèches | 🔌 | Gris |

---

# 📝 CHAMPS INSCRIPTION OBLIGATOIRES

| Champ | Obligatoire | Validation |
|-------|-------------|------------|
| Email | ✅ OUI | Format email valide |
| Mot de passe | ✅ OUI | Min 6 caractères |
| Prénom | ✅ OUI | Non vide |
| Nom | ✅ OUI | Non vide |
| Téléphone | ✅ OUI | 10 chiffres format FR |
| Entreprise | ✅ OUI | Non vide |
| SIRET | ✅ OUI | 14 chiffres |
| Ville | ✅ OUI | Non vide |

---

# 📊 TABLES SUPABASE V5

## Nouvelles tables

| Table | Description |
|-------|-------------|
| `demo_sessions` | Sessions de démo 3 minutes |
| `demandes_prospects` | Traçabilité complète des demandes |
| `abonnements` | Gestion des abonnements |
| `email_logs` | Historique emails envoyés |
| `onboarding_progress` | Suivi onboarding 7 étapes |

## Structure demandes_prospects

```sql
CREATE TABLE demandes_prospects (
  id UUID PRIMARY KEY,
  organisation_id UUID,
  
  -- Infos OBLIGATOIRES
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  entreprise TEXT NOT NULL,
  siret TEXT NOT NULL,
  ville TEXT NOT NULL,
  
  -- Demande
  domaines_demandes TEXT[],
  profil_demande TEXT,
  nb_utilisateurs TEXT,
  tarif_calcule DECIMAL,
  options_selectionnees TEXT[],
  rapports_fournis JSONB,
  
  -- Suivi
  demo_utilisee BOOLEAN,
  converti BOOLEAN,
  created_at TIMESTAMPTZ
);
```

---

# ⚖️ RÈGLES JURIDIQUES

## Ce qu'on NE DIT PAS

| ❌ NE PAS DIRE | Risque |
|----------------|--------|
| "Conforme NF S61-933" | Engagement juridique |
| "Rapport certifié" | Responsabilité |
| "Garantit la conformité" | Engagement |
| "Conforme APSAD" | Certification |

## Ce qu'on DIT

| ✅ À DIRE | Safe |
|-----------|------|
| "Aide à la conformité" | ✅ |
| "Rapports pré-remplis selon les normes" | ✅ |
| "Facilite vos vérifications" | ✅ |
| "Assistant de gestion" | ✅ |
| "Outil d'aide à la rédaction" | ✅ |

---

# 🛠️ FICHIERS CRÉÉS V5

| Fichier | Description |
|---------|-------------|
| `src/utils/pricingAlgorithm.js` | Algorithme calcul tarif |
| `src/contexts/DemoContext.jsx` | Gestion démo 3 min |
| `src/components/demo/DemoBanner.jsx` | Bandeau countdown |
| `src/components/demo/LockedFeatureModal.jsx` | Modal fonctionnalité verrouillée |
| `src/pages/DemoExpiredPage.jsx` | Page fin de démo |
| `src/pages/RegisterPage.jsx` | Inscription champs obligatoires |
| `src/pages/SubscriptionPage.jsx` | Paiement tarif unique |
| `sql/V5_demo_tracabilite.sql` | Tables Supabase |

---

# 🚀 PROCHAINES ÉTAPES

| # | Tâche | Priorité |
|---|-------|----------|
| 1 | Exécuter SQL V5 dans Supabase | 🔴 HAUTE |
| 2 | Tester flux complet inscription → démo → paiement | 🔴 HAUTE |
| 3 | Intégrer Stripe pour paiement réel | 🟠 MOYENNE |
| 4 | Créer templates emails (SendGrid/Resend) | 🟠 MOYENNE |
| 5 | Développer onboarding wizard | 🟢 NORMALE |
| 6 | Développer rapports SSI/DSF/BAES | 🟢 NORMALE |

---

# 📞 CONTACTS PROJET

| Élément | Valeur |
|---------|--------|
| Supabase | ofoibgbrviywlqxrnxvq.supabase.co |
| GitHub | github.com/easylogpro/easy-incendie |
| Firebase | easyincendie |

---

*Document mis à jour le 30 décembre 2024 - Version 5.0*
