// src/pages/TechniciensPage.jsx
// Easy Sécurité - Gestion des techniciens

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Modal, Input, Select, Badge, EmptyState, Skeleton } from '../components/ui';
import { UserCog, Plus, Search, Mail, Edit, Trash2 } from 'lucide-react';

const TechniciensPage = () => {
  const { orgId } = useAuth();
  const [techniciens, setTechniciens] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [formData, setFormData] = useState({
    groupe_id: '',
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
  });

  useEffect(() => { loadData(); }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      const [techniciensRes, groupesRes] = await Promise.all([
        supabase.from('techniciens').select('*, groupes(nom)').eq('organisation_id', orgId).order('nom'),
        supabase.from('groupes').select('id, nom').eq('organisation_id', orgId).order('nom'),
      ]);
      if (techniciensRes.error) throw techniciensRes.error;
      if (groupesRes.error) throw groupesRes.error;

      setTechniciens(techniciensRes.data || []);
      setGroupes(groupesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTechniciens = techniciens.filter(t =>
    t.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({ groupe_id: '', matricule: '', nom: '', prenom: '', email: '' });
    setModalMode('create');
  };

  const openEditModal = (tech) => {
    setSelectedTech(tech);
    setFormData({
      groupe_id: tech.groupe_id || '',
      matricule: tech.matricule || '',
      nom: tech.nom || '',
      prenom: tech.prenom || '',
      email: tech.email || '',
    });
    setModalMode('edit');
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await supabase.from('techniciens').insert({ ...formData, organisation_id: orgId, groupe_id: formData.groupe_id || null });
      } else {
        await supabase.from('techniciens').update({ ...formData, groupe_id: formData.groupe_id || null }).eq('id', selectedTech.id);
      }
      setModalMode(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (tech) => {
    if (!confirm(`Supprimer ${tech.prenom} ${tech.nom} ?`)) return;
    try {
      await supabase.from('techniciens').delete().eq('id', tech.id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="title" className="w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Techniciens</h1>
          <p className="text-gray-500">{techniciens.length} technicien(s)</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>Nouveau technicien</Button>
      </div>

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

      {filteredTechniciens.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-16 h-16" />}
          title="Aucun technicien"
          description="Ajoutez votre premier technicien"
          action={<Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>Ajouter</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechniciens.map(tech => (
            <Card key={tech.id} padding="normal" onClick={() => openEditModal(tech)}>
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  {tech.prenom?.[0]}{tech.nom?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{tech.prenom} {tech.nom}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{tech.matricule || 'Sans matricule'}{tech.groupes?.nom ? ` • ${tech.groupes.nom}` : ''}</p>
                  
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    {tech.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{tech.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button onClick={(e) => { e.stopPropagation(); openEditModal(tech); }} className="text-blue-600 hover:text-blue-800 text-sm">Modifier</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(tech); }} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Nouveau technicien' : 'Modifier le technicien'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Annuler</Button>
            <Button onClick={handleSave}>{modalMode === 'create' ? 'Créer' : 'Enregistrer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Groupe"
            value={formData.groupe_id}
            onChange={(e) => setFormData({ ...formData, groupe_id: e.target.value })}
            options={[
              { value: '', label: '-' },
              ...groupes.map((g) => ({ value: g.id, label: g.nom })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom *" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
            <Input label="Nom *" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <Input label="Matricule" value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
};

export default TechniciensPage;
