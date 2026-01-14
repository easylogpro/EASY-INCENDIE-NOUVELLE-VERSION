// =============================================================================
// EASY INCENDIE - GroupesPage.jsx
// CRUD Groupes de techniciens avec connexion Supabase
// Champs BDD: id, organisation_id, nom (NOT NULL), description, zone_geographique,
//             actif, created_at, updated_at
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, MapPin, Edit2, Trash2, X } from 'lucide-react';

export default function GroupesPage() {
  const { orgId } = useAuth();

  // États
  const [groupes, setGroupes] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState(null);
  const [search, setSearch] = useState('');
  const [filterActif, setFilterActif] = useState('');

  // Formulaire
  const [form, setForm] = useState({
    nom: '',
    description: '',
    zone_geographique: '',
    actif: true
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadGroupes();
      loadTechniciens();
    }
  }, [orgId]);

  const loadGroupes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .eq('organisation_id', orgId)
        .order('nom');

      if (error) throw error;
      setGroupes(data || []);
    } catch (err) {
      console.error('Erreur chargement groupes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTechniciens = async () => {
    const { data } = await supabase
      .from('techniciens')
      .select('id, nom, prenom, groupe_id, actif')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setTechniciens(data || []);
  };

  // Compter techniciens par groupe
  const getTechniciensByGroupe = (groupeId) => {
    return techniciens.filter(t => t.groupe_id === groupeId);
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: groupes.length,
      actifs: groupes.filter(g => g.actif).length,
      inactifs: groupes.filter(g => !g.actif).length,
      totalTechniciens: techniciens.length,
      nonAffectes: techniciens.filter(t => !t.groupe_id).length
    };
  }, [groupes, techniciens]);

  // Ouvrir modal création
  const handleNew = () => {
    setForm({
      nom: '',
      description: '',
      zone_geographique: '',
      actif: true
    });
    setEditingGroupe(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (groupe) => {
    setForm({
      nom: groupe.nom || '',
      description: groupe.description || '',
      zone_geographique: groupe.zone_geographique || '',
      actif: groupe.actif !== false
    });
    setEditingGroupe(groupe);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert('Le nom du groupe est obligatoire');
      return;
    }

    try {
      const groupeData = {
        ...form,
        organisation_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (editingGroupe) {
        const { error } = await supabase
          .from('groupes')
          .update(groupeData)
          .eq('id', editingGroupe.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('groupes')
          .insert([groupeData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadGroupes();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (groupe) => {
    const techsInGroupe = getTechniciensByGroupe(groupe.id);
    if (techsInGroupe.length > 0) {
      alert(`Impossible de supprimer ce groupe : ${techsInGroupe.length} technicien(s) y sont affectés.`);
      return;
    }

    if (!confirm(`Supprimer le groupe "${groupe.nom}" ?`)) return;

    try {
      const { error } = await supabase
        .from('groupes')
        .delete()
        .eq('id', groupe.id);
      if (error) throw error;
      loadGroupes();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer
  const filteredGroupes = groupes.filter(g => {
    const matchSearch = !search ||
      g.nom?.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase()) ||
      g.zone_geographique?.toLowerCase().includes(search.toLowerCase());
    const matchActif = filterActif === '' ||
      (filterActif === 'actif' && g.actif) ||
      (filterActif === 'inactif' && !g.actif);
    return matchSearch && matchActif;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-500" />
            Groupes de techniciens
          </h1>
          <p className="text-gray-500">Organisez vos équipes par zone ou spécialité</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Nouveau groupe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Groupes</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.actifs}</p>
          <p className="text-green-600 text-xs">Actifs</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-600">{stats.inactifs}</p>
          <p className="text-gray-500 text-xs">Inactifs</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.totalTechniciens}</p>
          <p className="text-blue-600 text-xs">Techniciens</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">{stats.nonAffectes}</p>
          <p className="text-orange-600 text-xs">Non affectés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Liste des groupes (Cards) */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Chargement...
        </div>
      ) : filteredGroupes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {groupes.length === 0
              ? 'Aucun groupe. Créez votre premier groupe !'
              : 'Aucun résultat pour votre recherche'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroupes.map(groupe => {
            const techsGroupe = getTechniciensByGroupe(groupe.id);

            return (
              <div
                key={groupe.id}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                  !groupe.actif ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${groupe.actif ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Users className={`w-6 h-6 ${groupe.actif ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{groupe.nom}</h3>
                      {groupe.zone_geographique && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {groupe.zone_geographique}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    groupe.actif
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {groupe.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {groupe.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {groupe.description}
                  </p>
                )}

                {/* Techniciens du groupe */}
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {techsGroupe.length} technicien{techsGroupe.length > 1 ? 's' : ''}
                  </p>
                  {techsGroupe.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {techsGroupe.slice(0, 5).map(tech => (
                        <span
                          key={tech.id}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {tech.prenom} {tech.nom}
                        </span>
                      ))}
                      {techsGroupe.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                          +{techsGroupe.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucun technicien affecté</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t pt-3 mt-3">
                  <button
                    onClick={() => handleEdit(groupe)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(groupe)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingGroupe ? 'Modifier le groupe' : 'Nouveau groupe'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-1">Nom du groupe *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({...form, nom: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Équipe Nord, SSI Experts..."
                />
              </div>

              {/* Zone géographique */}
              <div>
                <label className="block text-sm font-medium mb-1">Zone géographique</label>
                <input
                  type="text"
                  value={form.zone_geographique}
                  onChange={(e) => setForm({...form, zone_geographique: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Île-de-France, Nord-Ouest..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Description du groupe, spécialités..."
                />
              </div>

              {/* Statut */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => setForm({...form, actif: e.target.checked})}
                    className="rounded"
                  />
                  Groupe actif
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:opacity-90"
              >
                {editingGroupe ? 'Enregistrer' : 'Créer le groupe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
