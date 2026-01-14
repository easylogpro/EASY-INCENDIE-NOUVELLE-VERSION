// =============================================================================
// EASY INCENDIE - MaintenancesPage.jsx
// Suivi des maintenances par domaine - Charge depuis les VRAIES tables maintenances_*
// Tables: maintenances_ssi, maintenances_dsf_naturel, maintenances_baes,
//         maintenances_ext, maintenances_ria, maintenances_cmp, maintenances_colsec
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  Wrench, Search, Calendar, Building2, User, Plus, Filter,
  CheckCircle2, Clock, AlertTriangle, Edit2, X
} from 'lucide-react';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red', table: 'maintenances_ssi' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue', table: 'maintenances_dsf_naturel' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow', table: 'maintenances_baes' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'rose', table: 'maintenances_ext' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan', table: 'maintenances_ria' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple', table: 'maintenances_cmp' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray', table: 'maintenances_colsec' }
];

const STATUTS = {
  a_planifier: { label: 'À planifier', bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
  planifie: { label: 'Planifié', bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar },
  en_cours: { label: 'En cours', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Wrench },
  realise: { label: 'Réalisé', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 }
};

export default function MaintenancesPage() {
  const { orgId, subscription } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [sites, setSites] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomaine, setSelectedDomaine] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaint, setEditingMaint] = useState(null);

  // Domaines actifs selon l'abonnement
  const domainesActifs = subscription?.domaines_actifs || ['SSI'];

  // Formulaire
  const [form, setForm] = useState({
    site_id: '',
    contrat_id: '',
    technicien_id: '',
    numero: '',
    date_prevue: '',
    date_realisation: '',
    observations: '',
    statut: 'a_planifier'
  });

  useEffect(() => {
    if (orgId) {
      loadMaintenances();
      loadSites();
      loadTechniciens();
      loadContrats();
    }
  }, [orgId, selectedDomaine]);

  const loadMaintenances = async () => {
    setLoading(true);
    try {
      const allMaintenances = [];

      // Déterminer quelles tables charger
      const domainesToLoad = selectedDomaine === 'all'
        ? DOMAINES.filter(d => domainesActifs.includes(d.code))
        : DOMAINES.filter(d => d.code === selectedDomaine);

      // Charger depuis chaque table de maintenance
      for (const domaine of domainesToLoad) {
        try {
          const { data, error } = await supabase
            .from(domaine.table)
            .select(`
              *,
              site:sites(id, nom, ville, client:clients(raison_sociale)),
              technicien:techniciens(id, nom, prenom),
              contrat:contrats(id, numero_contrat)
            `)
            .eq('organisation_id', orgId)
            .order('created_at', { ascending: false })
            .limit(100);

          if (!error && data) {
            // Ajouter le domaine à chaque maintenance
            const maintenancesWithDomaine = data.map(m => ({
              ...m,
              domaine: domaine.code,
              domaine_table: domaine.table
            }));
            allMaintenances.push(...maintenancesWithDomaine);
          }
        } catch (err) {
          console.warn(`Table ${domaine.table} non accessible:`, err.message);
        }
      }

      // Trier par date prévue (les plus proches en premier)
      allMaintenances.sort((a, b) => {
        if (!a.date_prevue) return 1;
        if (!b.date_prevue) return -1;
        return new Date(a.date_prevue) - new Date(b.date_prevue);
      });

      setMaintenances(allMaintenances);
    } catch (error) {
      console.error('Erreur chargement maintenances:', error);
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

  const loadTechniciens = async () => {
    const { data } = await supabase
      .from('techniciens')
      .select('id, nom, prenom')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setTechniciens(data || []);
  };

  const loadContrats = async () => {
    const { data } = await supabase
      .from('contrats')
      .select('id, numero_contrat, site_id, domaine')
      .eq('organisation_id', orgId)
      .eq('statut', 'actif')
      .order('numero_contrat');
    setContrats(data || []);
  };

  // Filtrer les maintenances
  const filteredMaintenances = maintenances.filter(m => {
    const matchSearch =
      !searchTerm ||
      m.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.site?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.site?.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = !filterStatut || m.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // Stats
  const stats = useMemo(() => {
    return {
      total: maintenances.length,
      aPlanifier: maintenances.filter(m => m.statut === 'a_planifier').length,
      planifie: maintenances.filter(m => m.statut === 'planifie').length,
      enCours: maintenances.filter(m => m.statut === 'en_cours').length,
      realise: maintenances.filter(m => m.statut === 'realise').length,
      enRetard: maintenances.filter(m =>
        m.date_prevue &&
        new Date(m.date_prevue) < new Date() &&
        m.statut !== 'realise'
      ).length
    };
  }, [maintenances]);

  // Ouvrir modal création
  const handleNew = () => {
    const domaine = selectedDomaine !== 'all' ? selectedDomaine : domainesActifs[0];
    setForm({
      site_id: '',
      contrat_id: '',
      technicien_id: '',
      numero: '',
      date_prevue: '',
      date_realisation: '',
      observations: '',
      statut: 'a_planifier',
      domaine: domaine
    });
    setEditingMaint(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (maint) => {
    setForm({
      site_id: maint.site_id || '',
      contrat_id: maint.contrat_id || '',
      technicien_id: maint.technicien_id || '',
      numero: maint.numero || '',
      date_prevue: maint.date_prevue || '',
      date_realisation: maint.date_realisation || '',
      observations: maint.observations || '',
      statut: maint.statut || 'a_planifier',
      domaine: maint.domaine,
      domaine_table: maint.domaine_table
    });
    setEditingMaint(maint);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.site_id) {
      alert('Veuillez sélectionner un site');
      return;
    }

    try {
      const domaineInfo = DOMAINES.find(d => d.code === form.domaine);
      const tableName = editingMaint?.domaine_table || domaineInfo?.table;

      if (!tableName) {
        alert('Domaine invalide');
        return;
      }

      const maintData = {
        organisation_id: orgId,
        site_id: form.site_id,
        contrat_id: form.contrat_id || null,
        technicien_id: form.technicien_id || null,
        numero: form.numero || null,
        date_prevue: form.date_prevue || null,
        date_realisation: form.date_realisation || null,
        observations: form.observations || null,
        statut: form.statut,
        updated_at: new Date().toISOString()
      };

      if (editingMaint) {
        const { error } = await supabase
          .from(tableName)
          .update(maintData)
          .eq('id', editingMaint.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert([maintData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadMaintenances();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Changer statut rapidement
  const handleChangeStatut = async (maint, newStatut) => {
    try {
      const updates = {
        statut: newStatut,
        updated_at: new Date().toISOString()
      };

      if (newStatut === 'realise') {
        updates.date_realisation = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from(maint.domaine_table)
        .update(updates)
        .eq('id', maint.id);

      if (error) throw error;
      loadMaintenances();
    } catch (err) {
      console.error('Erreur update statut:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-500" />
            Maintenances
          </h1>
          <p className="text-gray-500">Suivi des visites de maintenance préventive</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Nouvelle maintenance
        </button>
      </div>

      {/* Onglets domaines */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDomaine('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedDomaine === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous ({maintenances.length})
        </button>
        {DOMAINES.filter(d => domainesActifs.includes(d.code)).map(domaine => {
          const count = maintenances.filter(m => m.domaine === domaine.code).length;
          return (
            <button
              key={domaine.code}
              onClick={() => setSelectedDomaine(domaine.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedDomaine === domaine.code
                  ? `bg-${domaine.color}-500 text-white`
                  : `bg-${domaine.color}-50 text-${domaine.color}-700 hover:bg-${domaine.color}-100`
              }`}
            >
              <span>{domaine.icon}</span>
              {domaine.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-600">{stats.aPlanifier}</p>
          <p className="text-gray-500 text-xs">À planifier</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{stats.planifie}</p>
          <p className="text-blue-600 text-xs">Planifié</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{stats.enCours}</p>
          <p className="text-yellow-600 text-xs">En cours</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-600">{stats.realise}</p>
          <p className="text-green-600 text-xs">Réalisé</p>
        </div>
        {stats.enRetard > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-2xl font-bold text-red-600">{stats.enRetard}</p>
            <p className="text-red-600 text-xs">En retard</p>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par site, client, numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Tous statuts</option>
          {Object.entries(STATUTS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-3">Chargement des maintenances...</p>
        </div>
      ) : filteredMaintenances.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune maintenance trouvée</p>
          <p className="text-gray-400 text-sm mt-1">
            {maintenances.length === 0
              ? 'Créez votre première maintenance'
              : 'Modifiez vos critères de recherche'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Site</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Domaine</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date prévue</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Technicien</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaintenances.map((maintenance) => {
                const statut = STATUTS[maintenance.statut] || STATUTS.a_planifier;
                const domaine = DOMAINES.find(d => d.code === maintenance.domaine);
                const isLate = maintenance.date_prevue &&
                  new Date(maintenance.date_prevue) < new Date() &&
                  maintenance.statut !== 'realise';

                return (
                  <tr key={`${maintenance.domaine}-${maintenance.id}`} className={`hover:bg-gray-50 ${isLate ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{maintenance.site?.nom || '-'}</p>
                      <p className="text-xs text-gray-500">
                        {maintenance.site?.client?.raison_sociale}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-${domaine?.color}-100 text-${domaine?.color}-700`}>
                        <span>{domaine?.icon}</span>
                        {maintenance.domaine}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {maintenance.date_prevue ? (
                        <span className={isLate ? 'text-red-600 font-medium' : ''}>
                          {new Date(maintenance.date_prevue).toLocaleDateString('fr-FR')}
                          {isLate && <AlertTriangle className="inline w-4 h-4 ml-1" />}
                        </span>
                      ) : (
                        <span className="text-gray-400">Non planifié</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {maintenance.technicien
                        ? `${maintenance.technicien.prenom} ${maintenance.technicien.nom}`
                        : <span className="text-gray-400">Non affecté</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(maintenance)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {maintenance.statut !== 'realise' && (
                          <button
                            onClick={() => handleChangeStatut(maintenance, 'realise')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Terminer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingMaint ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Domaine (seulement en création) */}
              {!editingMaint && (
                <div>
                  <label className="block text-sm font-medium mb-2">Domaine *</label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINES.filter(d => domainesActifs.includes(d.code)).map(d => (
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
              )}

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
                      {s.nom} - {s.client?.raison_sociale}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contrat */}
              <div>
                <label className="block text-sm font-medium mb-1">Contrat</label>
                <select
                  value={form.contrat_id}
                  onChange={(e) => setForm({...form, contrat_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Aucun contrat</option>
                  {contrats
                    .filter(c => !form.site_id || c.site_id === form.site_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.numero_contrat} ({c.domaine})
                      </option>
                    ))}
                </select>
              </div>

              {/* Technicien */}
              <div>
                <label className="block text-sm font-medium mb-1">Technicien</label>
                <select
                  value={form.technicien_id}
                  onChange={(e) => setForm({...form, technicien_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Non affecté</option>
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date prévue</label>
                  <input
                    type="date"
                    value={form.date_prevue}
                    onChange={(e) => setForm({...form, date_prevue: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date réalisation</label>
                  <input
                    type="date"
                    value={form.date_realisation}
                    onChange={(e) => setForm({...form, date_realisation: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Statut */}
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

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={form.observations}
                  onChange={(e) => setForm({...form, observations: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Notes, remarques..."
                />
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
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:opacity-90"
              >
                {editingMaint ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
