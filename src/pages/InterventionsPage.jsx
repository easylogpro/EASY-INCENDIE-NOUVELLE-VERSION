// src/pages/InterventionsPage.jsx
// Easy Sécurité - Gestion des interventions (SAV, Maintenance, Travaux)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Modal, Input, Select, Badge, EmptyState, Skeleton, Tabs } from '../components/ui';
import { Wrench, Plus, Search, Calendar, MapPin, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { generateSavNumber } from '../services/numberingService';

const InterventionsPage = () => {
  const { orgId, subscription } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sav');
  const [modalMode, setModalMode] = useState(null);
  const [formData, setFormData] = useState({
    site_id: '', domaine: 'ssi', priorite: 'P3', demandeur_nom: '', demandeur_tel: '', symptome_declare: '', date_prevue: ''
  });

  const priorites = {
    P1: { label: 'P1 - Urgente (4h)', color: 'danger', hours: 4 },
    P2: { label: 'P2 - Haute (24h)', color: 'warning', hours: 24 },
    P3: { label: 'P3 - Normale (72h)', color: 'info', hours: 72 }
  };

  const statuts = {
    nouveau: { label: 'Nouveau', color: 'default' },
    planifie: { label: 'Planifié', color: 'info' },
    en_cours: { label: 'En cours', color: 'warning' },
    termine: { label: 'Terminé', color: 'success' },
    annule: { label: 'Annulé', color: 'default' }
  };

  const tabs = [
    { id: 'sav', label: 'SAV / Dépannage' },
    { id: 'maintenance', label: 'Maintenances' },
    { id: 'travaux', label: 'Travaux' }
  ];

  useEffect(() => { loadData(); }, [orgId, activeTab]);

  const getSavDeadline = (intervention) => {
    const p = priorites[intervention?.priorite] || priorites.P3;
    const baseDate = intervention?.date_demande || intervention?.created_at;
    if (!baseDate) return null;

    const d = new Date(baseDate);
    return new Date(d.getTime() + p.hours * 60 * 60 * 1000);
  };

  const formatCountdown = (deadline) => {
    if (!deadline) return null;
    const diffMs = deadline.getTime() - Date.now();
    if (Number.isNaN(diffMs)) return null;

    if (diffMs <= 0) return { label: 'Dépassé', variant: 'danger' };

    const totalMinutes = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const variant = hours <= 4 ? 'danger' : hours <= 24 ? 'warning' : 'info';
    return { label: `${hours}h ${String(minutes).padStart(2, '0')}m`, variant };
  };

  const loadData = async () => {
    if (!orgId) return;
    try {
      if (activeTab !== 'sav') {
        setInterventions([]);
        return;
      }

      const [interventionsRes, sitesRes] = await Promise.all([
        supabase
          .from('sav')
          .select('*, sites(nom), clients(raison_sociale), techniciens(nom, prenom)')
          .eq('organisation_id', orgId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sites')
          .select('id, nom, client_id, clients(raison_sociale)')
          .eq('organisation_id', orgId),
      ]);

      if (interventionsRes.error) throw interventionsRes.error;
      if (sitesRes.error) throw sitesRes.error;

      setInterventions(interventionsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const site = sites.find(s => s.id === formData.site_id);
      const numero = await generateSavNumber(orgId);

      await supabase.from('sav').insert({
        ...formData,
        organisation_id: orgId,
        client_id: site?.client_id || null,
        numero,
        date_demande: new Date().toISOString(),
        statut: 'nouveau'
      });
      setModalMode(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateStatut = async (id, newStatut) => {
    try {
      await supabase.from('sav').update({ statut: newStatut }).eq('id', id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const activeDomains = subscription?.domaines_actifs || ['ssi'];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
          <p className="text-gray-500">{interventions.length} intervention(s)</p>
        </div>
        <Button onClick={() => setModalMode('create')} icon={<Plus className="w-4 h-4" />}>
          Nouvelle intervention
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab !== 'sav' ? (
        <EmptyState
          icon={<Wrench className="w-16 h-16" />}
          title="Module en cours"
          description="Les maintenances et travaux seront disponibles après le module SAV."
        />
      ) : interventions.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-16 h-16" />}
          title="Aucune intervention"
          description="Créez votre première intervention"
          action={<Button onClick={() => setModalMode('create')} icon={<Plus className="w-4 h-4" />}>Nouvelle intervention</Button>}
        />
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temps restant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {interventions.map(inter => (
                (() => {
                  const deadline = getSavDeadline(inter);
                  const countdown = formatCountdown(deadline);

                  return (
                <tr key={inter.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{inter.numero || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{inter.sites?.nom}</div>
                    <div className="text-sm text-gray-500">{inter.clients?.raison_sociale}</div>
                  </td>
                  <td className="px-4 py-3"><Badge size="sm">{inter.domaine?.toUpperCase()}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={priorites[inter.priorite]?.color} size="sm">{priorites[inter.priorite]?.label}</Badge></td>
                  <td className="px-4 py-3">{countdown ? <Badge variant={countdown.variant} size="sm">{countdown.label}</Badge> : '-'}</td>
                  <td className="px-4 py-3"><Badge variant={statuts[inter.statut]?.color} size="sm">{statuts[inter.statut]?.label}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(inter.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={inter.statut}
                      onChange={(e) => updateStatut(inter.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {Object.entries(statuts).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        isOpen={modalMode === 'create'}
        onClose={() => setModalMode(null)}
        title="Nouvelle intervention SAV"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Annuler</Button>
            <Button onClick={handleSave}>Créer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Site *"
            value={formData.site_id}
            onChange={(e) => setFormData({...formData, site_id: e.target.value})}
            options={[{ value: '', label: 'Sélectionner' }, ...sites.map(s => ({ value: s.id, label: `${s.nom} - ${s.clients?.raison_sociale}` }))]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Domaine *"
              value={formData.domaine}
              onChange={(e) => setFormData({...formData, domaine: e.target.value})}
              options={activeDomains.map(d => ({ value: d, label: d.toUpperCase() }))}
            />
            <Select
              label="Priorité"
              value={formData.priorite}
              onChange={(e) => setFormData({...formData, priorite: e.target.value})}
              options={Object.entries(priorites).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Demandeur" value={formData.demandeur_nom} onChange={(e) => setFormData({...formData, demandeur_nom: e.target.value})} />
            <Input label="Téléphone" value={formData.demandeur_tel} onChange={(e) => setFormData({...formData, demandeur_tel: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptôme déclaré</label>
            <textarea
              value={formData.symptome_declare}
              onChange={(e) => setFormData({...formData, symptome_declare: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <Input label="Date prévue" type="date" value={formData.date_prevue} onChange={(e) => setFormData({...formData, date_prevue: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
};

export default InterventionsPage;
