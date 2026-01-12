// src/utils/pricingAlgorithm.js
// Easy Sécurité - Algorithme de tarification selon grille Excel

// ============================================================
// GRILLE TARIFAIRE EXACTE (profil x nb_domaines x nb_utilisateurs)
// ============================================================
const PRICING_GRID = {
  // MAINTENEUR
  mainteneur: {
    '1_domain': { '1': 59, '2-5': 89, '6-10': 149, '11-25': 299 },
    '2_domains': { '1': 69, '2-5': 99, '6-10': 159, '11-25': 299 },
    '3+_domains': { '1': 79, '2-5': 109, '6-10': 169, '11-25': 299 }
  },
  // INSTALLATEUR + MAINTENEUR
  installateur_mainteneur: {
    '1_domain': { '1': 59, '2-5': 99, '6-10': 159, '11-25': 359 },
    '2_domains': { '1': 69, '2-5': 99, '6-10': 169, '11-25': 359 },
    '3+_domains': { '1': 79, '2-5': 119, '6-10': 179, '11-25': 359 }
  },
  // INSTALLATEUR
  installateur: {
    '1_domain': { '1': 59, '2-5': 89, '6-10': 149, '11-25': 299 },
    '2_domains': { '1': 69, '2-5': 99, '6-10': 159, '11-25': 299 },
    '3+_domains': { '1': 79, '2-5': 109, '6-10': 169, '11-25': 299 }
  },
  // ARTISAN
  artisan: {
    '1_domain': { '1': 59, '2-5': 89, '6-10': 149, '11-25': 299 },
    '2_domains': { '1': 69, '2-5': 99, '6-10': 159, '11-25': 299 },
    '3+_domains': { '1': 79, '2-5': 109, '6-10': 169, '11-25': 299 }
  },
  // SOUS-TRAITANT
  sous_traitant: {
    '1_domain': { '1': 59, '2-5': 89, '6-10': 149, '11-25': 299 },
    '2_domains': { '1': 69, '2-5': 99, '6-10': 159, '11-25': 299 },
    '3+_domains': { '1': 79, '2-5': 109, '6-10': 169, '11-25': 299 }
  }
};

// ============================================================
// OPTIONS ADDITIONNELLES
// ============================================================
const ADDON_PRICES = {
  'ia': 9,
  'export_compta': 5,
  'veille_reglementaire': 5
};

// ============================================================
// LABELS DES DOMAINES
// ============================================================
const DOMAIN_LABELS = {
  'ssi': 'SSI (Système Sécurité Incendie)',
  'dsf': 'Désenfumage',
  'compartimentage': 'Compartimentage',
  'baes': 'BAES / Éclairage sécurité',
  'extincteurs': 'Extincteurs',
  'ria': 'RIA',
  'colonnes_seches': 'Colonnes sèches'
};

// ============================================================
// RAPPORTS PAR PROFIL ET DOMAINE (selon Excel)
// ============================================================
const REPORTS_BY_PROFILE = {
  mainteneur: {
    ssi: ['Cat A', 'Cat B', 'Évac 2/3/4', 'Formation', 'SAV'],
    dsf: ['Naturel', 'Mécanique', 'SAV', 'Travaux'],
    compartimentage: ['Maintenance', 'SAV', 'Travaux'],
    baes: ['Maintenance', 'SAV', 'Travaux'],
    extincteurs: ['Maintenance', 'Travaux'],
    ria: ['Maintenance', 'Travaux'],
    colonnes_seches: ['Maintenance', 'Travaux']
  },
  installateur_mainteneur: {
    ssi: ['Cat A', 'Cat B', 'Évac 2/3/4', 'Formation', 'SAV', 'MES'],
    dsf: ['Naturel', 'Mécanique', 'SAV', 'Travaux'],
    compartimentage: ['Maintenance', 'SAV', 'Travaux'],
    baes: ['Maintenance', 'SAV', 'Travaux'],
    extincteurs: ['Maintenance', 'Travaux'],
    ria: ['Maintenance', 'Travaux'],
    colonnes_seches: ['Maintenance', 'Travaux']
  },
  installateur: {
    ssi: ['SAV', 'MES', 'Formation'],
    dsf: ['Naturel', 'Mécanique', 'SAV', 'Travaux'],
    compartimentage: ['Maintenance', 'SAV', 'Travaux'],
    baes: ['Maintenance', 'SAV', 'Travaux'],
    extincteurs: ['Maintenance', 'Travaux'],
    ria: ['Maintenance', 'Travaux'],
    colonnes_seches: ['Maintenance', 'Travaux']
  },
  artisan: {
    ssi: ['SAV', 'MES', 'Formation'],
    dsf: ['Naturel', 'Mécanique', 'SAV', 'Travaux'],
    compartimentage: ['Maintenance', 'SAV', 'Travaux'],
    baes: ['Maintenance', 'SAV', 'Travaux'],
    extincteurs: ['Maintenance', 'Travaux'],
    ria: ['Maintenance', 'Travaux'],
    colonnes_seches: ['Maintenance', 'Travaux']
  },
  sous_traitant: {
    ssi: ['SAV', 'MES', 'Formation'],
    dsf: ['Naturel', 'Mécanique', 'SAV', 'Travaux'],
    compartimentage: ['Maintenance', 'SAV', 'Travaux'],
    baes: ['Maintenance', 'SAV', 'Travaux'],
    extincteurs: ['Maintenance', 'Travaux'],
    ria: ['Maintenance', 'Travaux'],
    colonnes_seches: ['Maintenance', 'Travaux']
  }
};

// ============================================================
// CALCUL DU PRIX
// ============================================================
export const calculatePrice = (domains = [], userCount = '1', addons = [], profile = 'mainteneur') => {
  // Normaliser le nombre d'utilisateurs
  let userKey = '1';
  const numUsers = parseInt(userCount) || 1;
  if (userCount === '2-5' || (numUsers >= 2 && numUsers <= 5)) {
    userKey = '2-5';
  } else if (userCount === '6-10' || (numUsers >= 6 && numUsers <= 10)) {
    userKey = '6-10';
  } else if (userCount === '11-25' || numUsers >= 11) {
    userKey = '11-25';
  }

  // Clé domaine
  const domainCount = domains.length || 1;
  let domainKey = '1_domain';
  if (domainCount === 2) domainKey = '2_domains';
  if (domainCount >= 3) domainKey = '3+_domains';

  // Profil (défaut mainteneur)
  const profileKey = profile || 'mainteneur';
  const profileGrid = PRICING_GRID[profileKey] || PRICING_GRID.mainteneur;

  // Prix de base
  const basePrice = profileGrid[domainKey]?.[userKey] || 59;

  // Prix des options
  let addonsTotal = 0;
  (addons || []).forEach(addon => {
    addonsTotal += ADDON_PRICES[addon] || 0;
  });

  // Total
  const totalPrice = basePrice + addonsTotal;

  // Remise premier mois (-10%)
  const discount = Math.round(totalPrice * 0.10);
  const finalPrice = totalPrice - discount;

  return {
    basePrice,
    addonsTotal,
    totalPrice,
    discount,
    finalPrice,
    domainCount,
    userKey,
    profileKey
  };
};

// ============================================================
// RAPPORTS DISPONIBLES
// ============================================================
export const getAvailableReports = (profile = 'mainteneur', domains = []) => {
  const reports = {};
  const profileReports = REPORTS_BY_PROFILE[profile] || REPORTS_BY_PROFILE.mainteneur;

  domains.forEach(domain => {
    if (profileReports[domain]) {
      reports[domain] = {
        label: DOMAIN_LABELS[domain] || domain,
        reports: profileReports[domain]
      };
    }
  });

  return reports;
};

// ============================================================
// EXPORTS
// ============================================================
export const getDomainLabels = () => DOMAIN_LABELS;

export const generateRequestSummary = (formData, pricing) => {
  return {
    domaines: formData.modulesInteresses || [],
    profil: formData.typeActivite || 'mainteneur',
    nb_utilisateurs: formData.nombreTechniciens || '1',
    nb_sites: formData.nombreSites || '1-10',
    tarif_base: pricing.basePrice,
    tarif_options: pricing.addonsTotal,
    tarif_total: pricing.totalPrice,
    tarif_final: pricing.finalPrice,
    options: formData.selectedAddons || [],
    rapports_fournis: getAvailableReports(formData.typeActivite, formData.modulesInteresses)
  };
};

export default {
  calculatePrice,
  getAvailableReports,
  getDomainLabels,
  generateRequestSummary,
  PRICING_GRID,
  ADDON_PRICES,
  DOMAIN_LABELS
};
