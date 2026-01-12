// src/pages/ContratsPage.jsx
// Easy Sécurité - Gestion des contrats de maintenance

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  FileText, Plus, Search, Calendar, Building2, AlertTriangle,
  CheckCircle2, Clock, Euro, RefreshCw
} from 'lucide-react';

const STATUTS = {
  actif: { label: 'Actif', color: 'green', bg: 'bg-green-100', text: 'text-green-700' },
  suspendu: { label: 'Suspendu', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  resilie: { label: 'Résilié', color: 'red', bg: 'bg-red-100', text: 'text-red-700' },
  expire: { label: 'Expiré', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-500' }
};

const PERIODICITES = [
  { value: 'mensuel', label: 'Mensuel', visites: 12 },
  { value: 'trimestriel', label: 'Trimestriel', visites: 4 },
  { value: 'semestriel', label: 'Semestriel', visites: 2 },
  { value: 'annuel', label: 'Annuel', visites: 1 }
];

const DOMAINES = ['SSI', 'DSF', 'CMP', 'BAES', 'EXT', 'RIA', 'COLSEC'];

const ContratsPage = () => {
  const { orgId } = useAuth();
  const [contrats, setContrats] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    site_id: '',
    domaine: 'SSI',
    periodicite: 'semestriel',
    prix_annuel_ht: '',
    date_debut: '',
    date_fin: '',
    reconduction_auto: true,
    notes: ''
  });

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contratsRes, clientsRes, sitesRes] = await Promise.all([
        supabase
          .from('contrats')
          .select('*, clients(id, raison_sociale), sites(id, nom, ville)')
          .eq('organisation_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id, raison_sociale')
          .eq('organisation_id', orgId)
          .eq('actif', true),
        supabase
          .from('sites')
          .select('id, nom, ville, client_id')
          .eq('organisation_id', orgId)
      ]);

      setContrats(contratsRes.data || []);
      setClients(clientsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('contrats')
        .select('*', { count: 'exact', head: true })
        .eq('organisation_id', orgId);
      
      const numero = `CTR-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
      const periodicite = PERIODICITES.find(p => p.value === formData.periodicite);

      await supabase.from('contrats').insert({
        ...formData,
        organisation_id: orgId,
        numero_contrat: numero,
        nb_visites_an: periodicite?.visites || 2,
        statut: 'actif',
        prix_annuel_ht: formData.prix_annuel_ht ? parseFloat(formData.prix_annuel_ht) : null
      });

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      site_id: '',
      domaine: 'SSI',
      periodicite: 'semestriel',
      prix_annuel_ht: '',
      date_debut: '',
      date_fin: '',
      reconduction_auto: true,
      notes: ''
    });
  };

  const isExpiringSoon = (dateF) => {
    if (!dateF) return false;
    const date = new Date(dateF);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const filteredContrats = contrats.filter(c => {
    const matchSearch = 
      c.numero_contrat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clients?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sites?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = !filterStatut || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const filteredSites = formData.client_id 
    ? sites.filter(s => s.client_id === formData.client_id)
    : sites;

  // Stats
  const statsActifs = contrats.filter(c => c.statut === 'actif').length;
  const statsExpireSoon = contrats.filter(c => c.statut === 'actif' && isExpiringSoon(c.date_fin)).length;
  const caAnnuel = contrats
    .filter(c => c.statut === 'actif')
    .reduce((sum, c) => sum + (c.prix_annuel_ht || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            Contrats
          </h1>
          <p className="text-gray-500">{contrats.length} contrat{contrats.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouveau contrat
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsActifs}</p>
              <p className="text-gray-500 text-sm">Contrats actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsExpireSoon}</p>
              <p className="text-gray-500 text-sm">Expire &lt; 30j</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{caAnnuel.toLocaleString()} €</p>
              <p className="text-gray-500 text-sm">CA annuel HT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
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
        </div>
      ) : filteredContrats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun contrat</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">N°</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Site</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Domaine</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Périodicité</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Prix HT/an</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Échéance</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContrats.map((contrat) => {
                const statut = STATUTS[contrat.statut] || STATUTS.actif;
                const expiringSoon = isExpiringSoon(contrat.date_fin);
                return (
                  <tr key={contrat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{contrat.numero_contrat}</td>
                    <td className="px-4 py-3 font-medium">{contrat.clients?.raison_sociale}</td>
                    <td className="px-4 py-3 text-sm">{contrat.sites?.nom}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{contrat.domaine}</span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{contrat.periodicite}</td>
                    <td className="px-4 py-3 text-sm">
                      {contrat.prix_annuel_ht ? `${contrat.prix_annuel_ht.toLocaleString()} €` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={expiringSoon ? 'text-yellow-600 font-medium' : ''}>
                        {contrat.date_fin ? new Date(contrat.date_fin).toLocaleDateString('fr-FR') : '-'}
                        {expiringSoon && ' ⚠️'}
                      </span>
                      {contrat.reconduction_auto && (
                        <RefreshCw className="w-3 h-3 inline ml-1 text-gray-400" title="Reconduction auto" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Nouveau contrat</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value, site_id: '' })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.raison_sociale}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  {filteredSites.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom} - {s.ville}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
                  <select
                    value={formData.domaine}
                    onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {DOMAINES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Périodicité *</label>
                  <select
                    value={formData.periodicite}
                    onChange={(e) => setFormData({ ...formData, periodicite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {PERIODICITES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label} ({p.visites} visite{p.visites > 1 ? 's' : ''}/an)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix annuel HT (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix_annuel_ht}
                  onChange={(e) => setFormData({ ...formData, prix_annuel_ht: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.reconduction_auto}
                  onChange={(e) => setFormData({ ...formData, reconduction_auto: e.target.checked })}
                  className="w-4 h-4 text-red-500"
                />
                <span className="text-sm text-gray-700">Reconduction automatique</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratsPage;
