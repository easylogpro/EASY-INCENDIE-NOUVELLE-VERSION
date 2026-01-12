// src/pages/DevisPage.jsx
// Easy Sécurité - Gestion des devis

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Badge, EmptyState, Skeleton } from '../components/ui';
import { FileText, Plus, Search, Download, Eye } from 'lucide-react';

const DevisPage = () => {
  const { orgId } = useAuth();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const statuts = {
    brouillon: { label: 'Brouillon', color: 'default' },
    envoye: { label: 'Envoyé', color: 'info' },
    accepte: { label: 'Accepté', color: 'success' },
    refuse: { label: 'Refusé', color: 'danger' },
    expire: { label: 'Expiré', color: 'warning' }
  };

  useEffect(() => { loadData(); }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      const { data } = await supabase.from('devis').select('*, clients(raison_sociale), sites(nom)').eq('organisation_id', orgId).order('created_at', { ascending: false });
      setDevis(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevis = devis.filter(d =>
    d.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clients?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    brouillon: devis.filter(d => d.statut === 'brouillon').length,
    envoye: devis.filter(d => d.statut === 'envoye').length,
    accepte: devis.filter(d => d.statut === 'accepte').length,
    refuse: devis.filter(d => d.statut === 'refuse').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="title" className="w-48" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} variant="card" className="h-20" />)}</div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500">{devis.length} devis</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Nouveau devis</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} padding="normal" hover={false}>
            <p className="text-sm text-gray-500">{statuts[key].label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Table */}
      {filteredDevis.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-16 h-16" />}
          title="Aucun devis"
          description="Créez votre premier devis"
          action={<Button icon={<Plus className="w-4 h-4" />}>Nouveau devis</Button>}
        />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDevis.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.numero || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.clients?.raison_sociale}</div>
                    <div className="text-sm text-gray-500">{d.sites?.nom}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.objet || '-'}</td>
                  <td className="px-4 py-3 font-medium">{d.montant_ttc?.toFixed(2) || '0.00'} €</td>
                  <td className="px-4 py-3"><Badge variant={statuts[d.statut]?.color} size="sm">{statuts[d.statut]?.label}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 mr-2"><Eye className="w-4 h-4 inline" /></button>
                    <button className="text-gray-600 hover:text-gray-800"><Download className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default DevisPage;
