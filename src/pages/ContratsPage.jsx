// =============================================================================
// EASY INCENDIE - ContratsPage.jsx
// CRUD Contrats avec connexion Supabase
// ⚠️ ATTENTION: PAS de colonne "notes" dans la table contrats
// Champs BDD: id, organisation_id, client_id, site_id, numero_contrat,
//             domaine (NOT NULL), type_contrat, periodicite, nb_visites_an,
//             prestations_incluses (jsonb), prix_annuel_ht, date_debut, date_fin,
//             reconduction_auto, preavis_jours, derniere_visite, prochaine_visite, statut
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'rose' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray' },
];

const TYPES_CONTRAT = [
  { value: 'base', label: 'Base' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'sur_mesure', label: 'Sur mesure' },
];

const PERIODICITES = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'trimestriel', label: 'Trimestriel' },
  { value: 'semestriel', label: 'Semestriel' },
  { value: 'annuel', label: 'Annuel' },
];

const STATUTS = [
  { value: 'actif', label: 'Actif', color: 'green' },
  { value: 'en_attente', label: 'En attente', color: 'yellow' },
  { value: 'suspendu', label: 'Suspendu', color: 'orange' },
  { value: 'resilie', label: 'Résilié', color: 'red' },
  { value: 'termine', label: 'Terminé', color: 'gray' },
];

export default function ContratsPage() {
  const { orgId } = useAuth();
  
  // États
  const [contrats, setContrats] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContrat, setEditingContrat] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  
  // Formulaire - ⚠️ PAS de champ notes
  const [form, setForm] = useState({
    client_id: '',
    site_id: '',
    numero_contrat: '',
    domaine: 'SSI',
    type_contrat: 'base',
    periodicite: 'annuel',
    nb_visites_an: 1,
    prestations_incluses: {},
    prix_annuel_ht: null,
    date_debut: '',
    date_fin: '',
    reconduction_auto: true,
    preavis_jours: 90,
    derniere_visite: '',
    prochaine_visite: '',
    statut: 'actif'
  });

  // Sites filtrés par client
  const [filteredSites, setFilteredSites] = useState([]);

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadContrats();
      loadClients();
      loadSites();
    }
  }, [orgId]);

  // Filtrer sites quand client change
  useEffect(() => {
    if (form.client_id) {
      setFilteredSites(sites.filter(s => s.client_id === form.client_id));
    } else {
      setFilteredSites(sites);
    }
  }, [form.client_id, sites]);

  const loadContrats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contrats')
        .select(`
          *,
          client:clients(raison_sociale),
          site:sites(nom, adresse, ville)
        `)
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContrats(data || []);
    } catch (err) {
      console.error('Erreur chargement contrats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, raison_sociale')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('raison_sociale');
    setClients(data || []);
  };

  const loadSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('id, nom, client_id')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setSites(data || []);
  };

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const actifs = contrats.filter(c => c.statut === 'actif');
    const caTotal = actifs.reduce((sum, c) => sum + (c.prix_annuel_ht || 0), 0);
    const expireSoon = contrats.filter(c => {
      if (!c.date_fin || c.statut !== 'actif') return false;
      const dateFin = new Date(c.date_fin);
      return dateFin <= in30Days && dateFin >= today;
    }).length;
    const visitesRetard = contrats.filter(c => {
      if (!c.prochaine_visite || c.statut !== 'actif') return false;
      return new Date(c.prochaine_visite) < today;
    }).length;

    return {
      total: contrats.length,
      actifs: actifs.length,
      caTotal,
      expireSoon,
      visitesRetard
    };
  }, [contrats]);

  // Générer numéro contrat
  const generateNumeroContrat = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('contrats')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    
    return `CTR-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
  };

  // Ouvrir modal création
  const handleNew = async () => {
    const numero = await generateNumeroContrat();
    setForm({
      client_id: '',
      site_id: '',
      numero_contrat: numero,
      domaine: 'SSI',
      type_contrat: 'base',
      periodicite: 'annuel',
      nb_visites_an: 1,
      prestations_incluses: {},
      prix_annuel_ht: null,
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      reconduction_auto: true,
      preavis_jours: 90,
      derniere_visite: '',
      prochaine_visite: '',
      statut: 'actif'
    });
    setEditingContrat(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (contrat) => {
    setForm({
      client_id: contrat.client_id || '',
      site_id: contrat.site_id || '',
      numero_contrat: contrat.numero_contrat || '',
      domaine: contrat.domaine || 'SSI',
      type_contrat: contrat.type_contrat || 'base',
      periodicite: contrat.periodicite || 'annuel',
      nb_visites_an: contrat.nb_visites_an || 1,
      prestations_incluses: contrat.prestations_incluses || {},
      prix_annuel_ht: contrat.prix_annuel_ht || null,
      date_debut: contrat.date_debut || '',
      date_fin: contrat.date_fin || '',
      reconduction_auto: contrat.reconduction_auto !== false,
      preavis_jours: contrat.preavis_jours || 90,
      derniere_visite: contrat.derniere_visite || '',
      prochaine_visite: contrat.prochaine_visite || '',
      statut: contrat.statut || 'actif'
    });
    setEditingContrat(contrat);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.site_id) {
      alert('Le site est obligatoire');
      return;
    }
    if (!form.domaine) {
      alert('Le domaine est obligatoire');
      return;
    }

    try {
      // Récupérer client_id du site si non défini
      let clientId = form.client_id;
      if (!clientId && form.site_id) {
        const site = sites.find(s => s.id === form.site_id);
        clientId = site?.client_id;
      }

      // ⚠️ PAS de champ notes ici
      const contratData = {
        organisation_id: orgId,
        client_id: clientId || null,
        site_id: form.site_id,
        numero_contrat: form.numero_contrat,
        domaine: form.domaine,
        type_contrat: form.type_contrat,
        periodicite: form.periodicite,
        nb_visites_an: form.nb_visites_an,
        prestations_incluses: form.prestations_incluses,
        prix_annuel_ht: form.prix_annuel_ht || null,
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
        reconduction_auto: form.reconduction_auto,
        preavis_jours: form.preavis_jours,
        derniere_visite: form.derniere_visite || null,
        prochaine_visite: form.prochaine_visite || null,
        statut: form.statut,
        updated_at: new Date().toISOString()
      };

      if (editingContrat) {
        const { error } = await supabase
          .from('contrats')
          .update(contratData)
          .eq('id', editingContrat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contrats')
          .insert([contratData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadContrats();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (contrat) => {
    if (!confirm(`Supprimer le contrat "${contrat.numero_contrat}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('contrats')
        .delete()
        .eq('id', contrat.id);
      if (error) throw error;
      loadContrats();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer
  const filteredContrats = contrats.filter(c => {
    const matchSearch = !search || 
      c.numero_contrat?.toLowerCase().includes(search.toLowerCase()) ||
      c.client?.raison_sociale?.toLowerCase().includes(search.toLowerCase()) ||
      c.site?.nom?.toLowerCase().includes(search.toLowerCase());
    const matchDomaine = !filterDomaine || c.domaine === filterDomaine;
    const matchStatut = !filterStatut || c.statut === filterStatut;
    return matchSearch && matchDomaine && matchStatut;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Contrats</h1>
          <p className="text-gray-500">Gestion des contrats de maintenance</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          ➕ Nouveau contrat
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.actifs}</p>
          <p className="text-green-600 text-xs">Actifs</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xl font-bold text-blue-700">{stats.caTotal.toLocaleString()} €</p>
          <p className="text-blue-600 text-xs">CA annuel</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">{stats.expireSoon}</p>
          <p className="text-orange-600 text-xs">Expire &lt; 30j</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.visitesRetard}</p>
          <p className="text-red-600 text-xs">Visites en retard</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <select 
            value={filterDomaine}
            onChange={(e) => setFilterDomaine(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous domaines</option>
            {DOMAINES.map(d => (
              <option key={d.code} value={d.code}>{d.icon} {d.label}</option>
            ))}
          </select>
          <select 
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous statuts</option>
            {STATUTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filteredContrats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {contrats.length === 0 ? 'Aucun contrat. Créez votre premier contrat !' : 'Aucun résultat'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Contrat</th>
                <th className="text-left p-4 font-medium text-gray-600">Client / Site</th>
                <th className="text-left p-4 font-medium text-gray-600">Domaine</th>
                <th className="text-left p-4 font-medium text-gray-600">Période</th>
                <th className="text-left p-4 font-medium text-gray-600">Prix HT</th>
                <th className="text-left p-4 font-medium text-gray-600">Prochaine visite</th>
                <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContrats.map(contrat => {
                const domaine = DOMAINES.find(d => d.code === contrat.domaine);
                const statut = STATUTS.find(s => s.value === contrat.statut);
                const visitePasse = contrat.prochaine_visite && new Date(contrat.prochaine_visite) < new Date();

                return (
                  <tr key={contrat.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{contrat.numero_contrat}</p>
                      <p className="text-xs text-gray-500">{contrat.type_contrat}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900">{contrat.client?.raison_sociale || '-'}</p>
                      <p className="text-xs text-gray-500">{contrat.site?.nom}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs bg-${domaine?.color}-100 text-${domaine?.color}-700`}>
                        {domaine?.icon} {contrat.domaine}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-700">
                        {contrat.date_debut ? new Date(contrat.date_debut).toLocaleDateString('fr-FR') : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contrat.nb_visites_an} visite(s)/an
                      </p>
                    </td>
                    <td className="p-4 font-medium">
                      {contrat.prix_annuel_ht?.toLocaleString() || '-'} €
                    </td>
                    <td className="p-4">
                      {contrat.prochaine_visite ? (
                        <span className={visitePasse ? 'text-red-600 font-medium' : ''}>
                          {new Date(contrat.prochaine_visite).toLocaleDateString('fr-FR')}
                          {visitePasse && ' ⚠️'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs bg-${statut?.color}-100 text-${statut?.color}-700`}>
                        {statut?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEdit(contrat)}
                        className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(contrat)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingContrat ? 'Modifier le contrat' : 'Nouveau contrat'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Numéro */}
              <div>
                <label className="block text-sm font-medium mb-1">N° Contrat</label>
                <input 
                  type="text" 
                  value={form.numero_contrat}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  readOnly
                />
              </div>

              {/* Client et Site */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <select 
                    value={form.client_id}
                    onChange={(e) => setForm({...form, client_id: e.target.value, site_id: ''})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.raison_sociale}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Site *</label>
                  <select 
                    value={form.site_id}
                    onChange={(e) => setForm({...form, site_id: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {filteredSites.map(s => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Domaine et Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Domaine *</label>
                  <select 
                    value={form.domaine}
                    onChange={(e) => setForm({...form, domaine: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {DOMAINES.map(d => (
                      <option key={d.code} value={d.code}>{d.icon} {d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type contrat</label>
                  <select 
                    value={form.type_contrat}
                    onChange={(e) => setForm({...form, type_contrat: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {TYPES_CONTRAT.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Périodicité et Visites */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📅 Planification</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Périodicité</label>
                    <select 
                      value={form.periodicite}
                      onChange={(e) => setForm({...form, periodicite: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {PERIODICITES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nb visites/an</label>
                    <input 
                      type="number" 
                      value={form.nb_visites_an}
                      onChange={(e) => setForm({...form, nb_visites_an: parseInt(e.target.value) || 1})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Préavis (jours)</label>
                    <input 
                      type="number" 
                      value={form.preavis_jours}
                      onChange={(e) => setForm({...form, preavis_jours: parseInt(e.target.value) || 90})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📆 Durée du contrat</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date début</label>
                    <input 
                      type="date" 
                      value={form.date_debut}
                      onChange={(e) => setForm({...form, date_debut: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date fin</label>
                    <input 
                      type="date" 
                      value={form.date_fin}
                      onChange={(e) => setForm({...form, date_fin: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={form.reconduction_auto}
                      onChange={(e) => setForm({...form, reconduction_auto: e.target.checked})}
                      className="rounded"
                    />
                    Reconduction automatique
                  </label>
                </div>
              </div>

              {/* Prix */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">💰 Tarification</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Prix annuel HT (€)</label>
                  <input 
                    type="number" 
                    value={form.prix_annuel_ht || ''}
                    onChange={(e) => setForm({...form, prix_annuel_ht: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    step="0.01"
                    placeholder="1500.00"
                  />
                </div>
              </div>

              {/* Visites */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📍 Suivi des visites</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dernière visite</label>
                    <input 
                      type="date" 
                      value={form.derniere_visite}
                      onChange={(e) => setForm({...form, derniere_visite: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prochaine visite</label>
                    <input 
                      type="date" 
                      value={form.prochaine_visite}
                      onChange={(e) => setForm({...form, prochaine_visite: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select 
                  value={form.statut}
                  onChange={(e) => setForm({...form, statut: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {STATUTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {editingContrat ? 'Enregistrer' : 'Créer le contrat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
