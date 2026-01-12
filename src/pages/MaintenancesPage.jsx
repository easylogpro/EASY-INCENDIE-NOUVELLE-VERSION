// src/pages/MaintenancesPage.jsx
// Easy Sécurité - Suivi des maintenances par domaine

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  Wrench, Search, Calendar, Building2, User, Filter,
  CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red', table: 'maintenances_ssi' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue', table: 'maintenances_dsf_naturel' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow', table: 'maintenances_baes' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'red', table: 'maintenances_ext' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan', table: 'maintenances_ria' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple', table: 'maintenances_cmp' },
  { code: 'COLSEC', label: 'COLSEC', icon: '🔌', color: 'gray', table: 'maintenances_colsec' }
];

const STATUTS = {
  a_planifier: { label: 'À planifier', bg: 'bg-gray-100', text: 'text-gray-700' },
  planifie: { label: 'Planifié', bg: 'bg-blue-100', text: 'text-blue-700' },
  en_cours: { label: 'En cours', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  realise: { label: 'Réalisé', bg: 'bg-green-100', text: 'text-green-700' }
};

const MaintenancesPage = () => {
  const { orgId, subscription } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomaine, setSelectedDomaine] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  // Domaines actifs selon l'abonnement
  const domainesActifs = subscription?.domaines_actifs || ['SSI'];

  useEffect(() => {
    if (orgId) loadMaintenances();
  }, [orgId, selectedDomaine]);

  const loadMaintenances = async () => {
    setLoading(true);
    try {
      // Pour simplifier, on charge depuis une vue ou on simule
      // En réalité, il faudrait charger depuis chaque table de maintenance
      const { data, error } = await supabase
        .from('sav') // Temporaire - utiliser une vraie table maintenances
        .select('*, sites(id, nom, ville), techniciens(id, nom, prenom)')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transformer en format maintenance
      const maintenancesData = (data || []).map(item => ({
        id: item.id,
        numero: item.numero || `MAINT-${item.id.slice(0,8)}`,
        site: item.sites,
        technicien: item.techniciens,
        domaine: item.domaine || 'SSI',
        date_prevue: item.date_prevue,
        date_realisation: item.date_resolution,
        statut: item.statut === 'termine' ? 'realise' : 
                item.date_prevue ? 'planifie' : 'a_planifier',
        type_visite: 'Maintenance'
      }));

      setMaintenances(maintenancesData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaintenances = maintenances.filter(m => {
    const matchDomaine = selectedDomaine === 'all' || m.domaine === selectedDomaine;
    const matchSearch = 
      m.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.site?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = !filterStatut || m.statut === filterStatut;
    return matchDomaine && matchSearch && matchStatut;
  });

  // Stats
  const statsTotal = maintenances.length;
  const statsAPlanifier = maintenances.filter(m => m.statut === 'a_planifier').length;
  const statsPlanifie = maintenances.filter(m => m.statut === 'planifie').length;
  const statsRealise = maintenances.filter(m => m.statut === 'realise').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-500" />
            Maintenances
          </h1>
          <p className="text-gray-500">Suivi des visites de maintenance</p>
        </div>
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
          Tous
        </button>
        {DOMAINES.filter(d => domainesActifs.includes(d.code)).map(domaine => (
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
            {domaine.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold">{statsTotal}</p>
          <p className="text-gray-500 text-sm">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-600">{statsAPlanifier}</p>
          <p className="text-gray-500 text-sm">À planifier</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-blue-600">{statsPlanifie}</p>
          <p className="text-gray-500 text-sm">Planifié</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{statsRealise}</p>
          <p className="text-gray-500 text-sm">Réalisé</p>
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
      ) : filteredMaintenances.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune maintenance</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Site</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Domaine</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date prévue</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Technicien</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaintenances.map((maintenance) => {
                const statut = STATUTS[maintenance.statut] || STATUTS.a_planifier;
                const domaine = DOMAINES.find(d => d.code === maintenance.domaine);
                return (
                  <tr key={maintenance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{maintenance.site?.nom || '-'}</p>
                      <p className="text-xs text-gray-500">{maintenance.site?.ville}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <span>{domaine?.icon}</span>
                        <span className="text-sm">{maintenance.domaine}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{maintenance.type_visite}</td>
                    <td className="px-4 py-3 text-sm">
                      {maintenance.date_prevue 
                        ? new Date(maintenance.date_prevue).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {maintenance.technicien 
                        ? `${maintenance.technicien.prenom} ${maintenance.technicien.nom}`
                        : '-'}
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
    </div>
  );
};

export default MaintenancesPage;
