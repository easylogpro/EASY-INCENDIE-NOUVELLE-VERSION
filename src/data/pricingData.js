export const pricingData = {
  profiles: [
    { id: 'mainteneur', label: 'Mainteneur' },
    { id: 'installateur', label: 'Installateur' },
    { id: 'installateur_mainteneur', label: 'Installateur + Mainteneur' },
    { id: 'artisan', label: 'Artisan' },
    { id: 'sous_traitant', label: 'Sous-traitant' },
  ],
  domains: [
    { id: 'ssi', label: 'SSI' },
    { id: 'dsf', label: 'Désenfumage' },
    { id: 'baes', label: 'BAES' },
    { id: 'extincteurs', label: 'Extincteurs' },
    { id: 'ria', label: 'RIA' },
    { id: 'compartimentage', label: 'Compartimentage' },
    { id: 'colonnes_seches', label: 'Colonnes sèches' },
  ],
};

export const availableAddons = [
  { id: 'ia', name: 'IA (assistant)', description: 'Aide à la rédaction et synthèses', price: 9 },
  { id: 'export_compta', name: 'Export compta', description: 'Exports CSV / formats comptables', price: 5 },
  { id: 'veille_reglementaire', name: 'Veille réglementaire', description: 'Notifications de changements', price: 5 },
];
