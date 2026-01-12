// src/pages/SitesPage.jsx
// Easy Sécurité - Gestion des sites

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, Button, Modal, Input, Select, Badge, EmptyState, Skeleton } from '../components/ui';
import { 
  MapPin, Plus, Search, Building2, Phone, Mail, Edit, Trash2, 
  Eye, ChevronRight, Filter, LayoutGrid, List, AlertTriangle
} from 'lucide-react';

const SitesPage = () => {
  const navigate = useNavigate();
  const { orgId } = useAuth();
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [modalMode, setModalMode] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    technicien_id: '',
    nom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    type_erp: '',
    categorie_erp: '',
    contact_nom: '',
    contact_telephone: '',
    contact_email: '',
    acces_instructions: '',
    domaines_actifs: []
  });

  const typesERP = ['J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
  const domaines = [
    { id: 'ssi', label: 'SSI' },
    { id: 'dsf', label: 'Désenfumage' },
    { id: 'baes', label: 'BAES' },
    { id: 'extincteurs', label: 'Extincteurs' },
    { id: 'ria', label: 'RIA' },
    { id: 'compartimentage', label: 'Compartimentage' },
    { id: 'colonnes_seches', label: 'Colonnes sèches' }
  ];

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      const [sitesRes, clientsRes, techniciensRes] = await Promise.all([
        supabase
          .from('sites')
          .select('*, clients(raison_sociale), techniciens(nom, prenom)')
          .eq('organisation_id', orgId)
          .order('nom'),
        supabase
          .from('clients')
          .select('id, raison_sociale')
          .eq('organisation_id', orgId)
          .order('raison_sociale'),
        supabase
          .from('techniciens')
          .select('id, nom, prenom')
          .eq('organisation_id', orgId)
          .order('nom'),
      ]);
      setSites(sitesRes.data || []);
      setClients(clientsRes.data || []);
      setTechniciens(techniciensRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSites = sites.filter(site =>
    site.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.clients?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({ client_id: '', technicien_id: '', nom: '', adresse: '', code_postal: '', ville: '', type_erp: '', categorie_erp: '', contact_nom: '', contact_telephone: '', contact_email: '', acces_instructions: '', domaines_actifs: [] });
    setModalMode('create');
  };

  const openEditModal = (site) => {
    setSelectedSite(site);
    setFormData({
      client_id: site.client_id || '',
      technicien_id: site.technicien_id || '',
      nom: site.nom || '',
      adresse: site.adresse || '',
      code_postal: site.code_postal || '',
      ville: site.ville || '',
      type_erp: site.type_erp || '',
      categorie_erp: site.categorie_erp?.toString?.() || '',
      contact_nom: site.contact_nom || '',
      contact_telephone: site.contact_telephone || '',
      contact_email: site.contact_email || '',
      acces_instructions: site.acces_instructions || '',
      domaines_actifs: site.domaines_actifs || []
    });
    setModalMode('edit');
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        categorie_erp: formData.categorie_erp ? parseInt(formData.categorie_erp, 10) : null,
      };

      if (modalMode === 'create') {
        await supabase.from('sites').insert({ ...payload, organisation_id: orgId });
      } else {
        await supabase.from('sites').update(payload).eq('id', selectedSite.id);
      }
      setModalMode(null);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (site) => {
    if (!confirm(`Supprimer le site "${site.nom}" ?`)) return;
    try {
      await supabase.from('sites').delete().eq('id', site.id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const toggleDomaine = (domaineId) => {
    setFormData(prev => ({
      ...prev,
      domaines_actifs: prev.domaines_actifs.includes(domaineId)
        ? prev.domaines_actifs.filter(d => d !== domaineId)
        : [...prev.domaines_actifs, domaineId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton variant="title" className="w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500">{sites.length} site(s) enregistré(s)</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Nouveau site
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2.5 rounded-lg ${viewMode === 'cards' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredSites.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-16 h-16" />}
          title="Aucun site"
          description="Créez votre premier site pour commencer"
          action={<Button onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>Nouveau site</Button>}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map(site => (
            <Card key={site.id} padding="none" onClick={() => openEditModal(site)}>
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{site.nom}</h3>
                      <p className="text-sm text-gray-500">{site.clients?.raison_sociale}</p>
                    </div>
                  </div>
                  {site.type_erp && (
                    <Badge variant="info" size="sm">ERP {site.type_erp}</Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{site.adresse}, {site.code_postal} {site.ville}</span>
                  </div>
                  {site.contact_telephone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{site.contact_telephone}</span>
                    </div>
                  )}
                </div>

                {site.domaines_actifs?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {site.domaines_actifs.map(d => (
                      <Badge key={d} size="sm" variant="default">{d.toUpperCase()}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ERP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaines</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSites.map(site => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{site.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{site.clients?.raison_sociale}</td>
                  <td className="px-4 py-3 text-gray-600">{site.ville}</td>
                  <td className="px-4 py-3">{site.type_erp && <Badge size="sm">ERP {site.type_erp}</Badge>}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">{site.domaines_actifs?.map(d => <Badge key={d} size="sm">{d}</Badge>)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditModal(site)} className="text-blue-600 hover:text-blue-800 mr-2">Modifier</button>
                    <button onClick={() => handleDelete(site)} className="text-red-600 hover:text-red-800">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Nouveau site' : 'Modifier le site'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalMode(null)}>Annuler</Button>
            <Button onClick={handleSave}>{modalMode === 'create' ? 'Créer' : 'Enregistrer'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Client *"
            value={formData.client_id}
            onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            options={[{ value: '', label: 'Sélectionner un client' }, ...clients.map(c => ({ value: c.id, label: c.raison_sociale }))]}
          />
          <Select
            label="Technicien attribué"
            value={formData.technicien_id}
            onChange={(e) => setFormData({ ...formData, technicien_id: e.target.value })}
            options={[
              { value: '', label: '-' },
              ...techniciens.map((t) => ({ value: t.id, label: `${t.prenom || ''} ${t.nom || ''}`.trim() })),
            ]}
          />
          <Input label="Nom du site *" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          <Input label="Adresse" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code postal" value={formData.code_postal} onChange={(e) => setFormData({...formData, code_postal: e.target.value})} />
            <Input label="Ville" value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type ERP"
              value={formData.type_erp}
              onChange={(e) => setFormData({...formData, type_erp: e.target.value})}
              options={[{ value: '', label: '-' }, ...typesERP.map(t => ({ value: t, label: `Type ${t}` }))]}
            />
            <Select
              label="Catégorie"
              value={formData.categorie_erp}
              onChange={(e) => setFormData({...formData, categorie_erp: e.target.value})}
              options={[{ value: '', label: '-' }, ...['1','2','3','4','5'].map(c => ({ value: c, label: `Catégorie ${c}` }))]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact sur site" value={formData.contact_nom} onChange={(e) => setFormData({...formData, contact_nom: e.target.value})} />
            <Input label="Téléphone contact" value={formData.contact_telephone} onChange={(e) => setFormData({...formData, contact_telephone: e.target.value})} />
          </div>
          <Input label="Email contact" type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domaines actifs</label>
            <div className="flex flex-wrap gap-2">
              {domaines.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDomaine(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.domaines_actifs.includes(d.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SitesPage;
