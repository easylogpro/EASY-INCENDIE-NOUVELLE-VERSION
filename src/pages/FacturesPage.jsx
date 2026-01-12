// src/pages/FacturesPage.jsx
// Easy Sécurité - Gestion des factures

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Badge, EmptyState, Skeleton } from '../components/ui';
import { Receipt, Plus, Search, Download, Eye, TrendingUp } from 'lucide-react';

const FacturesPage = () => {
  const { orgId } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const statuts = {
    brouillon: { label: 'Brouillon', color: 'default' },
    emise: { label: 'Émise', color: 'info' },
    payee: { label: 'Payée', color: 'success' },
    partielle: { label: 'Partielle', color: 'warning' },
    retard: { label: 'En retard', color: 'danger' },
    annulee: { label: 'Annulée', color: 'default' }
  };

  useEffect(() => { loadData(); }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      const { data } = await supabase.from('factures').select('*, clients(raison_sociale)').eq('organisation_id', orgId).order('created_at', { ascending: false });
      setFactures(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFactures = factures.filter(f =>
    f.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.clients?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalCA = factures.reduce((sum, f) => sum + (f.montant_ht || 0), 0);
  const totalEncaisse = factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + (f.montant_ht || 0), 0);
  const enAttente = totalCA - totalEncaisse;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="title" className="w-48" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} variant="card" className="h-24" />)}</div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-500">{factures.length} facture(s)</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Nouvelle facture</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="normal" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CA Total</p>
              <p className="text-2xl font-bold">{totalCA.toFixed(2)} €</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card padding="normal" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Encaissé</p>
              <p className="text-2xl font-bold text-green-600">{totalEncaisse.toFixed(2)} €</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Receipt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card padding="normal" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{enAttente.toFixed(2)} €</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
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
      {filteredFactures.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-16 h-16" />}
          title="Aucune facture"
          description="Créez votre première facture"
          action={<Button icon={<Plus className="w-4 h-4" />}>Nouvelle facture</Button>}
        />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactures.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.numero || '-'}</td>
                  <td className="px-4 py-3 font-medium">{f.clients?.raison_sociale}</td>
                  <td className="px-4 py-3 text-gray-600">{f.objet || '-'}</td>
                  <td className="px-4 py-3 font-medium">{f.montant_ttc?.toFixed(2) || '0.00'} €</td>
                  <td className="px-4 py-3"><Badge variant={statuts[f.statut]?.color} size="sm">{statuts[f.statut]?.label}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.date_echeance ? new Date(f.date_echeance).toLocaleDateString('fr-FR') : '-'}</td>
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

export default FacturesPage;
