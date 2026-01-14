// =============================================================================
// EASY INCENDIE - ObservationsPage.jsx
// CRUD Observations terrain avec connexion Supabase
// Champs BDD: id, organisation_id, site_id, intervention_type, intervention_id,
//             domaine, description (NOT NULL), localisation, priorite, type,
//             statut, date_constat, date_traitement, photos, created_at, updated_at
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Camera, Plus, Search, Building2, MapPin, AlertTriangle, CheckCircle2,
  Clock, Edit2, Trash2, X, FileText, Eye
} from 'lucide-react';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'rose' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray' },
];

const PRIORITES = [
  { value: 'urgente', label: 'Urgente', color: 'red' },
  { value: 'haute', label: 'Haute', color: 'orange' },
  { value: 'normale', label: 'Normale', color: 'blue' },
  { value: 'basse', label: 'Basse', color: 'gray' },
];

const TYPES = [
  { value: 'non_conformite', label: 'Non-conformité' },
  { value: 'defaut', label: 'Défaut' },
  { value: 'degradation', label: 'Dégradation' },
  { value: 'amelioration', label: 'Amélioration suggérée' },
  { value: 'remarque', label: 'Remarque' },
];

const STATUTS = {
  nouveau: { label: 'Nouveau', bg: 'bg-gray-100', text: 'text-gray-700' },
  en_cours: { label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-700' },
  devis_envoye: { label: 'Devis envoyé', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  traite: { label: 'Traité', bg: 'bg-green-100', text: 'text-green-700' },
  refuse: { label: 'Refusé', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ObservationsPage() {
  const { orgId } = useAuth();

  // États
  const [observations, setObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingObs, setEditingObs] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');

  // Formulaire
  const [form, setForm] = useState({
    site_id: '',
    domaine: '',
    description: '',
    localisation: '',
    priorite: 'normale',
    type: 'non_conformite',
    statut: 'nouveau',
    date_constat: new Date().toISOString().split('T')[0],
    date_traitement: '',
    photos: []
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadObservations();
      loadSites();
    }
  }, [orgId]);

  const loadObservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*, site:sites(id, nom, ville, client:clients(raison_sociale))')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObservations(data || []);
    } catch (err) {
      console.error('Erreur chargement observations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('id, nom, ville, client:clients(raison_sociale)')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setSites(data || []);
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: observations.length,
      nouveau: observations.filter(o => o.statut === 'nouveau').length,
      enCours: observations.filter(o => o.statut === 'en_cours' || o.statut === 'devis_envoye').length,
      traite: observations.filter(o => o.statut === 'traite').length,
      urgentes: observations.filter(o => o.priorite === 'urgente' && o.statut !== 'traite').length
    };
  }, [observations]);

  // Ouvrir modal création
  const handleNew = () => {
    setForm({
      site_id: '',
      domaine: '',
      description: '',
      localisation: '',
      priorite: 'normale',
      type: 'non_conformite',
      statut: 'nouveau',
      date_constat: new Date().toISOString().split('T')[0],
      date_traitement: '',
      photos: []
    });
    setEditingObs(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (obs) => {
    setForm({
      site_id: obs.site_id || '',
      domaine: obs.domaine || '',
      description: obs.description || '',
      localisation: obs.localisation || '',
      priorite: obs.priorite || 'normale',
      type: obs.type || 'non_conformite',
      statut: obs.statut || 'nouveau',
      date_constat: obs.date_constat || '',
      date_traitement: obs.date_traitement || '',
      photos: obs.photos || []
    });
    setEditingObs(obs);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.site_id) {
      alert('Veuillez sélectionner un site');
      return;
    }
    if (!form.description.trim()) {
      alert('La description est obligatoire');
      return;
    }
    if (!form.domaine) {
      alert('Veuillez sélectionner un domaine');
      return;
    }

    try {
      const obsData = {
        ...form,
        organisation_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (editingObs) {
        const { error } = await supabase
          .from('observations')
          .update(obsData)
          .eq('id', editingObs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('observations')
          .insert([obsData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadObservations();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (obs) => {
    if (!confirm('Supprimer cette observation ?')) return;

    try {
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', obs.id);
      if (error) throw error;
      loadObservations();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Changer statut rapidement
  const handleChangeStatut = async (obs, newStatut) => {
    try {
      const updates = {
        statut: newStatut,
        updated_at: new Date().toISOString()
      };
      if (newStatut === 'traite') {
        updates.date_traitement = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('observations')
        .update(updates)
        .eq('id', obs.id);

      if (error) throw error;
      loadObservations();
    } catch (err) {
      console.error('Erreur update statut:', err);
    }
  };

  // Filtrer
  const filteredObs = observations.filter(o => {
    const matchSearch = !search ||
      o.description?.toLowerCase().includes(search.toLowerCase()) ||
      o.site?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      o.localisation?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || o.statut === filterStatut;
    const matchDomaine = !filterDomaine || o.domaine === filterDomaine;
    const matchPriorite = !filterPriorite || o.priorite === filterPriorite;
    return matchSearch && matchStatut && matchDomaine && matchPriorite;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-7 h-7 text-cyan-500" />
            Observations
          </h1>
          <p className="text-gray-500">Relevés terrain et génération de devis</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Nouvelle observation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-700">{stats.nouveau}</p>
          <p className="text-gray-500 text-xs">Nouveau</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.enCours}</p>
          <p className="text-blue-600 text-xs">En cours</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.traite}</p>
          <p className="text-green-600 text-xs">Traité</p>
        </div>
        {stats.urgentes > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-2xl font-bold text-red-700">{stats.urgentes}</p>
            <p className="text-red-600 text-xs">Urgentes</p>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous statuts</option>
            {Object.entries(STATUTS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
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
            value={filterPriorite}
            onChange={(e) => setFilterPriorite(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes priorités</option>
            {PRIORITES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Chargement...
        </div>
      ) : filteredObs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {observations.length === 0
              ? 'Aucune observation. Créez votre première observation !'
              : 'Aucun résultat pour votre recherche'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredObs.map(obs => {
            const domaine = DOMAINES.find(d => d.code === obs.domaine);
            const priorite = PRIORITES.find(p => p.value === obs.priorite);
            const statut = STATUTS[obs.statut] || STATUTS.nouveau;
            const typeObs = TYPES.find(t => t.value === obs.type);

            return (
              <div
                key={obs.id}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                  obs.priorite === 'urgente' && obs.statut !== 'traite' ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* En-tête */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs bg-${domaine?.color}-100 text-${domaine?.color}-700`}>
                        {domaine?.icon} {obs.domaine}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs bg-${priorite?.color}-100 text-${priorite?.color}-700`}>
                        {priorite?.label}
                      </span>
                      {typeObs && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                          {typeObs.label}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-900 mb-2">{obs.description}</p>

                    {/* Infos */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {obs.site?.nom} - {obs.site?.client?.raison_sociale}
                      </span>
                      {obs.localisation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {obs.localisation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(obs.date_constat).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(obs)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(obs)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions rapides statut */}
                    {obs.statut === 'nouveau' && (
                      <button
                        onClick={() => handleChangeStatut(obs, 'en_cours')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Prendre en charge
                      </button>
                    )}
                    {obs.statut === 'en_cours' && (
                      <button
                        onClick={() => handleChangeStatut(obs, 'traite')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Marquer traité
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingObs ? 'Modifier l\'observation' : 'Nouvelle observation'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Site */}
              <div>
                <label className="block text-sm font-medium mb-1">Site *</label>
                <select
                  value={form.site_id}
                  onChange={(e) => setForm({...form, site_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner un site</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom} - {s.client?.raison_sociale} ({s.ville})
                    </option>
                  ))}
                </select>
              </div>

              {/* Domaine */}
              <div>
                <label className="block text-sm font-medium mb-2">Domaine *</label>
                <div className="flex flex-wrap gap-2">
                  {DOMAINES.map(d => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => setForm({...form, domaine: d.code})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.domaine === d.code
                          ? `bg-${d.color}-500 text-white`
                          : `bg-${d.color}-50 text-${d.color}-700 hover:bg-${d.color}-100`
                      }`}
                    >
                      {d.icon} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Décrivez l'observation en détail..."
                />
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium mb-1">Localisation</label>
                <input
                  type="text"
                  value={form.localisation}
                  onChange={(e) => setForm({...form, localisation: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: RDC, Cage escalier A, Local technique..."
                />
              </div>

              {/* Type et Priorité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorité</label>
                  <select
                    value={form.priorite}
                    onChange={(e) => setForm({...form, priorite: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {PRIORITES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date et Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date constat</label>
                  <input
                    type="date"
                    value={form.date_constat}
                    onChange={(e) => setForm({...form, date_constat: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({...form, statut: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {Object.entries(STATUTS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date traitement (si traité) */}
              {form.statut === 'traite' && (
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Date traitement</label>
                  <input
                    type="date"
                    value={form.date_traitement}
                    onChange={(e) => setForm({...form, date_traitement: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:opacity-90"
              >
                {editingObs ? 'Enregistrer' : 'Créer l\'observation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
