// src/pages/AlertesPage.jsx
// Easy Sécurité - Gestion des alertes

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Badge, EmptyState, Skeleton, Tabs } from '../components/ui';
import { AlertTriangle, Bell, CheckCircle2, Eye, X } from 'lucide-react';

const AlertesPage = () => {
  const { orgId } = useAuth();
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('nouvelle');

  const statuts = {
    nouvelle: { label: 'Nouvelles', color: 'danger' },
    vue: { label: 'Vues', color: 'warning' },
    traitee: { label: 'Traitées', color: 'success' },
    ignoree: { label: 'Ignorées', color: 'default' }
  };

  const priorites = {
    critique: { label: 'Critique', color: 'danger' },
    haute: { label: 'Haute', color: 'warning' },
    moyenne: { label: 'Moyenne', color: 'info' },
    basse: { label: 'Basse', color: 'default' }
  };

  const tabs = [
    { id: 'all', label: 'Toutes' },
    { id: 'nouvelle', label: 'Nouvelles' },
    { id: 'vue', label: 'Vues' },
    { id: 'traitee', label: 'Traitées' }
  ];

  useEffect(() => { loadData(); }, [orgId, filter]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      let query = supabase.from('alertes').select('*, sites(nom), clients(raison_sociale)').eq('organisation_id', orgId).order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('statut', filter);
      const { data } = await query;
      setAlertes(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id, newStatut) => {
    try {
      const updates = { statut: newStatut };
      if (newStatut === 'vue') updates.date_vue = new Date().toISOString();
      if (newStatut === 'traitee') updates.date_traitement = new Date().toISOString();
      await supabase.from('alertes').update(updates).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="title" className="w-48" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
          <p className="text-gray-500">{alertes.length} alerte(s)</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} />

      {alertes.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-16 h-16" />}
          title="Aucune alerte"
          description={filter === 'all' ? "Vous n'avez aucune alerte" : `Aucune alerte ${statuts[filter]?.label.toLowerCase()}`}
        />
      ) : (
        <div className="space-y-4">
          {alertes.map(alerte => (
            <Card key={alerte.id} padding="normal" hover={false}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  alerte.priorite === 'critique' ? 'bg-red-100' :
                  alerte.priorite === 'haute' ? 'bg-orange-100' :
                  alerte.priorite === 'moyenne' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    alerte.priorite === 'critique' ? 'text-red-600' :
                    alerte.priorite === 'haute' ? 'text-orange-600' :
                    alerte.priorite === 'moyenne' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{alerte.titre}</h3>
                      <p className="text-gray-600 mt-1">{alerte.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorites[alerte.priorite]?.color} size="sm">{priorites[alerte.priorite]?.label}</Badge>
                      <Badge variant={statuts[alerte.statut]?.color} size="sm">{statuts[alerte.statut]?.label}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{alerte.sites?.nom}</span>
                    <span>•</span>
                    <span>{alerte.domaine?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(alerte.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {alerte.statut !== 'traitee' && (
                    <div className="flex gap-2 mt-4">
                      {alerte.statut === 'nouvelle' && (
                        <Button variant="secondary" size="sm" onClick={() => updateStatut(alerte.id, 'vue')}>
                          <Eye className="w-4 h-4 mr-1" /> Marquer comme vue
                        </Button>
                      )}
                      <Button variant="primary" size="sm" onClick={() => updateStatut(alerte.id, 'traitee')}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Traiter
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => updateStatut(alerte.id, 'ignoree')}>
                        <X className="w-4 h-4 mr-1" /> Ignorer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertesPage;
