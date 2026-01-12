// src/pages/SavPage.jsx
// Easy Sécurité - Gestion SAV avec priorités P1/P2/P3

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  AlertTriangle, Plus, Search, Phone, Clock, User,
  MapPin, CheckCircle2, AlertCircle, Filter, MoreVertical
} from 'lucide-react';

const PRIORITES = {
  P1: { label: 'Urgence', delai: 4, color: 'red', bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  P2: { label: 'Normal', delai: 24, color: 'orange', bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  P3: { label: 'Mineur', delai: 72, color: 'yellow', bg: 'bg-yellow-500', bgLight: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
};

const STATUTS = {
  nouveau: { label: 'Nouveau', color: 'blue' },
  affecte: { label: 'Affecté', color: 'purple' },
  en_cours: { label: 'En cours', color: 'yellow' },
  termine: { label: 'Terminé', color: 'green' },
  facture: { label: 'Facturé', color: 'gray' }
};

const DOMAINES = ['SSI', 'DSF', 'CMP', 'BAES', 'EXT', 'RIA', 'COLSEC'];

const SavPage = () => {
  const { orgId } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [sites, setSites] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    site_id: '',
    domaine: 'SSI',
    priorite: 'P2',
    description: '',
    contact_nom: '',
    contact_telephone: '',
    technicien_id: ''
  });

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  // Rafraîchir les compteurs toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setDemandes(prev => [...prev]); // Force re-render pour mettre à jour les compteurs
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [savRes, sitesRes, techRes] = await Promise.all([
        supabase
          .from('sav')
          .select('*, sites(id, nom, adresse, ville), techniciens(id, nom, prenom)')
          .eq('organisation_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sites')
          .select('id, nom, adresse, ville, clients(raison_sociale)')
          .eq('organisation_id', orgId),
        supabase
          .from('techniciens')
          .select('id, nom, prenom')
          .eq('organisation_id', orgId)
          .eq('actif', true)
      ]);

      setDemandes(savRes.data || []);
      setSites(sitesRes.data || []);
      setTechniciens(techRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prioriteConfig = PRIORITES[formData.priorite];
      const dateLimite = new Date();
      dateLimite.setHours(dateLimite.getHours() + prioriteConfig.delai);

      // Générer numéro SAV
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('sav')
        .select('*', { count: 'exact', head: true })
        .eq('organisation_id', orgId);
      
      const numero = `SAV-${year}-${String((count || 0) + 1).padStart(3, '0')}`;

      await supabase.from('sav').insert({
        ...formData,
        organisation_id: orgId,
        numero,
        statut: formData.technicien_id ? 'affecte' : 'nouveau',
        date_limite: dateLimite.toISOString(),
        technicien_id: formData.technicien_id || null
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
        updates.date_resolution = new Date().toISOString();
      }
      await supabase.from('sav').update(updates).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const assignTechnicien = async (savId, technicienId) => {
    try {
      await supabase
        .from('sav')
        .update({ 
          technicien_id: technicienId,
          statut: 'affecte'
        })
        .eq('id', savId);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      site_id: '',
      domaine: 'SSI',
      priorite: 'P2',
      description: '',
      contact_nom: '',
      contact_telephone: '',
      technicien_id: ''
    });
  };

  const getTimeRemaining = (dateLimite) => {
    if (!dateLimite) return null;
    const now = new Date();
    const limit = new Date(dateLimite);
    const diff = limit - now;

    if (diff <= 0) return { expired: true, text: 'Dépassé' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return { expired: false, text: `${days}j ${hours % 24}h` };
    }

    return { expired: false, text: `${hours}h${String(minutes).padStart(2, '0')}` };
  };

  const filteredDemandes = demandes.filter(d => {
    const matchSearch = 
      d.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sites?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriorite = !filterPriorite || d.priorite === filterPriorite;
    const matchStatut = !filterStatut || d.statut === filterStatut;
    return matchSearch && matchPriorite && matchStatut;
  });

  // Stats
  const statsEnCours = demandes.filter(d => !['termine', 'facture'].includes(d.statut));
  const statsP1 = statsEnCours.filter(d => d.priorite === 'P1').length;
  const statsP2 = statsEnCours.filter(d => d.priorite === 'P2').length;
  const statsP3 = statsEnCours.filter(d => d.priorite === 'P3').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            SAV / Dépannages
          </h1>
          <p className="text-gray-500">{statsEnCours.length} demande{statsEnCours.length > 1 ? 's' : ''} en cours</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvelle demande
        </button>
      </div>

      {/* Stats par priorité */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 border-2 ${PRIORITES.P1.border} ${PRIORITES.P1.bgLight}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${PRIORITES.P1.text}`}>{statsP1}</p>
              <p className="text-gray-600">P1 - Urgence (4h)</p>
            </div>
            <div className={`w-12 h-12 ${PRIORITES.P1.bg} rounded-full flex items-center justify-center`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-4 border-2 ${PRIORITES.P2.border} ${PRIORITES.P2.bgLight}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${PRIORITES.P2.text}`}>{statsP2}</p>
              <p className="text-gray-600">P2 - Normal (24h)</p>
            </div>
            <div className={`w-12 h-12 ${PRIORITES.P2.bg} rounded-full flex items-center justify-center`}>
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-4 border-2 ${PRIORITES.P3.border} ${PRIORITES.P3.bgLight}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${PRIORITES.P3.text}`}>{statsP3}</p>
              <p className="text-gray-600">P3 - Mineur (72h)</p>
            </div>
            <div className={`w-12 h-12 ${PRIORITES.P3.bg} rounded-full flex items-center justify-center`}>
              <AlertCircle className="w-6 h-6 text-white" />
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={filterPriorite}
          onChange={(e) => setFilterPriorite(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITES).map(([key, val]) => (
            <option key={key} value={key}>{key} - {val.label}</option>
          ))}
        </select>
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
      ) : filteredDemandes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune demande SAV</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDemandes.map((demande) => {
            const priorite = PRIORITES[demande.priorite] || PRIORITES.P2;
            const statut = STATUTS[demande.statut] || STATUTS.nouveau;
            const timeRemaining = getTimeRemaining(demande.date_limite);
            const isActive = !['termine', 'facture'].includes(demande.statut);

            return (
              <div
                key={demande.id}
                className={`bg-white rounded-xl border-l-4 ${priorite.border.replace('border-', 'border-l-')} border border-gray-200 p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${priorite.bg} text-white`}>
                        {demande.priorite}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium bg-${statut.color}-100 text-${statut.color}-700`}>
                        {statut.label}
                      </span>
                      <span className="text-gray-500 text-sm font-mono">{demande.numero}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{demande.domaine}</span>
                    </div>
                    <p className="font-medium text-gray-900">{demande.sites?.nom || 'Site inconnu'}</p>
                    <p className="text-gray-500 text-sm">{demande.description}</p>
                  </div>

                  {/* Compte à rebours */}
                  {isActive && timeRemaining && (
                    <div className={`px-4 py-2 rounded-lg ${timeRemaining.expired ? 'bg-red-100' : priorite.bgLight}`}>
                      <p className="text-xs text-gray-500">Délai</p>
                      <p className={`text-xl font-bold ${timeRemaining.expired ? 'text-red-600' : priorite.text}`}>
                        {timeRemaining.text}
                      </p>
                    </div>
                  )}

                  {/* Technicien */}
                  <div className="min-w-[150px]">
                    {demande.techniciens ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{demande.techniciens.prenom} {demande.techniciens.nom}</span>
                      </div>
                    ) : (
                      <select
                        onChange={(e) => assignTechnicien(demande.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                        defaultValue=""
                      >
                        <option value="">Affecter...</option>
                        {techniciens.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.prenom} {tech.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {demande.statut === 'affecte' && (
                      <button
                        onClick={() => updateStatut(demande.id, 'en_cours')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                      >
                        Démarrer
                      </button>
                    )}
                    {demande.statut === 'en_cours' && (
                      <button
                        onClick={() => updateStatut(demande.id, 'termine')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nouvelle demande */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Nouvelle demande SAV</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site *</label>
                <select
                  value={formData.site_id}
                  onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Sélectionner un site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.nom} - {site.ville}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
                  <select
                    value={formData.domaine}
                    onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {DOMAINES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité *</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {Object.entries(PRIORITES).map(([key, val]) => (
                      <option key={key} value={key}>{key} - {val.label} ({val.delai}h)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Décrivez le problème..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact sur site</label>
                  <input
                    type="text"
                    value={formData.contact_nom}
                    onChange={(e) => setFormData({ ...formData, contact_nom: e.target.value })}
                    placeholder="Nom du contact"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone contact</label>
                  <input
                    type="tel"
                    value={formData.contact_telephone}
                    onChange={(e) => setFormData({ ...formData, contact_telephone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technicien</label>
                <select
                  value={formData.technicien_id}
                  onChange={(e) => setFormData({ ...formData, technicien_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Non affecté --</option>
                  {techniciens.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.prenom} {tech.nom}
                    </option>
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600"
                >
                  Créer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavPage;
