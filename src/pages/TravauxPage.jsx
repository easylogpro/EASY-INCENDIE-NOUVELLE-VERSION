// src/pages/TravauxPage.jsx
// Easy Sécurité - Gestion des travaux

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  Hammer, Plus, Search, Calendar, User, Building2,
  FileText, CheckCircle2, Clock, Euro
} from 'lucide-react';

const STATUTS = {
  devis: { label: 'Devis', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700' },
  planifie: { label: 'Planifié', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700' },
  en_cours: { label: 'En cours', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  termine: { label: 'Terminé', color: 'green', bg: 'bg-green-100', text: 'text-green-700' },
  facture: { label: 'Facturé', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700' }
};

const DOMAINES = ['SSI', 'DSF', 'CMP', 'BAES', 'EXT', 'RIA', 'COLSEC'];

const TravauxPage = () => {
  const { orgId } = useAuth();
  const [travaux, setTravaux] = useState([]);
  const [sites, setSites] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    site_id: '',
    devis_id: '',
    domaine: 'SSI',
    description: '',
    date_prevue: '',
    technicien_id: '',
    montant_ht: ''
  });

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [travauxRes, sitesRes, techRes, devisRes] = await Promise.all([
        supabase
          .from('travaux')
          .select('*, sites(id, nom, ville), techniciens(id, nom, prenom), devis(id, numero, montant_ht)')
          .eq('organisation_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sites')
          .select('id, nom, ville')
          .eq('organisation_id', orgId),
        supabase
          .from('techniciens')
          .select('id, nom, prenom')
          .eq('organisation_id', orgId)
          .eq('actif', true),
        supabase
          .from('devis')
          .select('id, numero, montant_ht, statut')
          .eq('organisation_id', orgId)
          .eq('statut', 'accepte')
      ]);

      setTravaux(travauxRes.data || []);
      setSites(sitesRes.data || []);
      setTechniciens(techRes.data || []);
      setDevis(devisRes.data || []);
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
        .from('travaux')
        .select('*', { count: 'exact', head: true })
        .eq('organisation_id', orgId);
      
      const numero = `TRV-${year}-${String((count || 0) + 1).padStart(3, '0')}`;

      await supabase.from('travaux').insert({
        ...formData,
        organisation_id: orgId,
        numero,
        statut: formData.date_prevue ? 'planifie' : 'devis',
        devis_id: formData.devis_id || null,
        technicien_id: formData.technicien_id || null,
        montant_ht: formData.montant_ht ? parseFloat(formData.montant_ht) : null
      });

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateStatut = async (id, newStatut) => {
    try {
      const updates = { statut: newStatut };
      if (newStatut === 'termine') {
        updates.date_realisation = new Date().toISOString().split('T')[0];
      }
      await supabase.from('travaux').update(updates).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      site_id: '',
      devis_id: '',
      domaine: 'SSI',
      description: '',
      date_prevue: '',
      technicien_id: '',
      montant_ht: ''
    });
  };

  const filteredTravaux = travaux.filter(t => {
    const matchSearch = 
      t.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sites?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = !filterStatut || t.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  // Stats
  const statsTotal = travaux.length;
  const statsEnCours = travaux.filter(t => t.statut === 'en_cours').length;
  const statsPlanifies = travaux.filter(t => t.statut === 'planifie').length;
  const statsTermines = travaux.filter(t => t.statut === 'termine').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hammer className="w-7 h-7 text-purple-500" />
            Travaux
          </h1>
          <p className="text-gray-500">{statsTotal} travau{statsTotal > 1 ? 'x' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouveau travaux
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{statsTotal}</p>
          <p className="text-gray-500 text-sm">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-blue-600">{statsPlanifies}</p>
          <p className="text-gray-500 text-sm">Planifiés</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-yellow-600">{statsEnCours}</p>
          <p className="text-gray-500 text-sm">En cours</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{statsTermines}</p>
          <p className="text-gray-500 text-sm">Terminés</p>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
      ) : filteredTravaux.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Hammer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun travaux</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">N°</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Site</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Domaine</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Devis</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date prévue</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Technicien</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTravaux.map((travail) => {
                const statut = STATUTS[travail.statut] || STATUTS.devis;
                return (
                  <tr key={travail.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{travail.numero}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{travail.sites?.nom}</p>
                      <p className="text-xs text-gray-500">{travail.sites?.ville}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{travail.domaine}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {travail.devis ? (
                        <span className="text-blue-600">{travail.devis.numero}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {travail.date_prevue ? new Date(travail.date_prevue).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {travail.techniciens ? `${travail.techniciens.prenom} ${travail.techniciens.nom}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {travail.statut === 'planifie' && (
                          <button
                            onClick={() => updateStatut(travail.id, 'en_cours')}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                          >
                            Démarrer
                          </button>
                        )}
                        {travail.statut === 'en_cours' && (
                          <button
                            onClick={() => updateStatut(travail.id, 'termine')}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Nouveau travaux</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner un site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.nom} - {site.ville}</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devis lié</label>
                  <select
                    value={formData.devis_id}
                    onChange={(e) => setFormData({ ...formData, devis_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Aucun --</option>
                    {devis.map((d) => (
                      <option key={d.id} value={d.id}>{d.numero} ({d.montant_ht}€)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date prévue</label>
                  <input
                    type="date"
                    value={formData.date_prevue}
                    onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montant_ht}
                    onChange={(e) => setFormData({ ...formData, montant_ht: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technicien</label>
                <select
                  value={formData.technicien_id}
                  onChange={(e) => setFormData({ ...formData, technicien_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Non affecté --</option>
                  {techniciens.map((tech) => (
                    <option key={tech.id} value={tech.id}>{tech.prenom} {tech.nom}</option>
                  ))}
                </select>
              </div>

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

export default TravauxPage;
