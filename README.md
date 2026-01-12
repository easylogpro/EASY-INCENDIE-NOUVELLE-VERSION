# Logiciel Gestion Énergie & Incendie

Solution SaaS de gestion pour entreprises des secteurs énergie, chauffage, incendie et isolation.

## 🚀 Fonctionnalités

### Tronc Commun
- ✅ Authentification multi-rôles (Admin, Gestionnaire, Technicien, STT, Client)
- ✅ Gestion des organisations (multi-tenant isolé)
- ✅ Paramétrage entreprise (logo, infos légales, CGV)
- ✅ Système de licence et modules activables
- 🔜 Gestion clients payeurs et sites
- 🔜 Planning centralisé
- 🔜 Interventions (SAV, Travaux, MES, Audit, Visite, Réception)
- 🔜 Devis avec signature électronique
- 🔜 Factures et export comptable
- 🔜 Rapports d'intervention
- 🔜 Système d'alertes
- 🔜 Notifications automatiques

### Modules Métier
- 🔹 **Énergie** : PAC, Climatisation, Fluides frigorigènes
- 🔹 **Chauffage** : Chaudières gaz/fioul/électrique, Plancher chauffant
- 🔹 **Incendie** : SSI, BAES, Extincteurs, RIA, Désenfumage
- 🔹 **Isolation** : Combles, Murs, Menuiserie

## 🛠️ Stack Technique

- **Frontend** : React 18, TailwindCSS, React Router
- **Backend** : Supabase (Postgres, Auth, Storage)
- **Paiements** : Stripe
- **PWA** : Mode hors-ligne pour techniciens terrain

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Supabase
- Compte Stripe (pour les paiements)

### Configuration

1. Cloner le projet
```bash
git clone <repo>
cd logiciel-energie-incendie
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer Supabase
```bash
cp .env.example .env
# Éditer .env avec vos clés Supabase
```

4. Démarrer en développement
```bash
npm run dev
```

## 🔐 Sécurité

- Architecture multi-tenant avec isolation stricte des données
- RLS (Row Level Security) sur Postgres
- Authentification Supabase Auth
- Audit log de toutes les actions
- Conformité RGPD

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── layout/         # Layout principal
│   ├── ui/             # Composants UI (boutons, inputs...)
│   └── ...
├── config/             # Configuration Supabase
├── contexts/           # Contexts React (Auth...)
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── services/           # Services (auth, org, numbering...)
├── styles/             # CSS / Tailwind
└── utils/              # Fonctions utilitaires
```

## 🚀 Déploiement

Build:
```bash
npm run build
```

## 🔄 Roadmap

### Sprint 1 ✅
- [x] Architecture Firebase
- [x] Authentification
- [x] Paramétrage organisation
- [x] Système de licence

### Sprint 2
- [ ] Gestion clients payeurs
- [ ] Gestion sites
- [ ] Référentiel matériel
- [ ] Import Excel

### Sprint 3
- [ ] Planning centralisé
- [ ] Gestion interventions
- [ ] Assignation techniciens/STT

### Sprint 4
- [ ] Création devis
- [ ] Signature électronique
- [ ] Génération factures
- [ ] PDF design unifié

### Sprint 5
- [ ] Rapports d'intervention
- [ ] Système d'alertes
- [ ] Notifications automatiques

### Sprint 6
- [ ] PWA terrain
- [ ] Mode hors-ligne
- [ ] Synchronisation

### Sprint 7
- [ ] Espace client
- [ ] Intégration Stripe
- [ ] Onboarding automatique

## 📄 Licence

Propriétaire - Tous droits réservés
