// src/pages/VehiculesPage.jsx
// Easy Sécurité - Gestion des véhicules

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
  Car, Plus, Search, Edit2, Trash2, AlertTriangle,
  Calendar, Gauge, User, MoreVertical, CheckCircle2
} from 'lucide-react';

const VehiculesPage = () => {
  const { orgId } = useAuth();
  const [vehicules, setVehicules] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    kilometrage: 0,
    date_ct: '',
    technicien_id: '',
    notes: ''
  });

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, techRes] = await Promise.all([
        supabase
          .from('vehicules')
          .select('*, techniciens(id, nom, prenom)')
          .eq('organisation_id', orgId)
          .order('immatriculation'),
        supabase
          .from('techniciens')
          .select('id, nom, prenom')
          .eq('organisation_id', orgId)
          .eq('actif', true)
      ]);

      setVehicules(vehRes.data || []);
      setTechniciens(techRes.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        organisation_id: orgId,
        technicien_id: formData.technicien_id || null
      };

      if (editingVehicule) {
        await supabase
          .from('vehicules')
          .update(payload)
          .eq('id', editingVehicule.id);
      } else {
        await supabase
          .from('vehicules')
          .insert(payload);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    try {
      await supabase.from('vehicules').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      immatriculation: '',
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      kilometrage: 0,
      date_ct: '',
      technicien_id: '',
      notes: ''
    });
    setEditingVehicule(null);
  };

  const openEdit = (vehicule) => {
    setEditingVehicule(vehicule);
    setFormData({
      immatriculation: vehicule.immatriculation || '',
      marque: vehicule.marque || '',
      modele: vehicule.modele || '',
      annee: vehicule.annee || new Date().getFullYear(),
      kilometrage: vehicule.kilometrage || 0,
      date_ct: vehicule.date_ct || '',
      technicien_id: vehicule.technicien_id || '',
      notes: vehicule.notes || ''
    });
    setShowModal(true);
  };

  const isCtExpiringSoon = (date) => {
    if (!date) return false;
    const ctDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((ctDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isCtExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const filteredVehicules = vehicules.filter(v =>
    v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modele?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCtOk = vehicules.filter(v => !isCtExpired(v.date_ct) && !isCtExpiringSoon(v.date_ct)).length;
  const statsCtWarning = vehicules.filter(v => isCtExpiringSoon(v.date_ct)).length;
  const statsCtExpired = vehicules.filter(v => isCtExpired(v.date_ct)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="w-7 h-7 text-red-500" />
            Véhicules
          </h1>
          <p className="text-gray-500">{vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Ajouter un véhicule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vehicules.length}</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCtOk}</p>
              <p className="text-gray-500 text-sm">CT OK</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCtWarning}</p>
              <p className="text-gray-500 text-sm">CT &lt; 30j</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCtExpired}</p>
              <p className="text-gray-500 text-sm">CT expiré</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un véhicule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredVehicules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun véhicule</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicules.map((vehicule) => (
            <div key={vehicule.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">{vehicule.immatriculation}</p>
                  <p className="text-gray-500">{vehicule.marque} {vehicule.modele}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(vehicule)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicule.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="w-4 h-4" />
                  <span>{vehicule.kilometrage?.toLocaleString() || 0} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={`
                    ${isCtExpired(vehicule.date_ct) ? 'text-red-600 font-medium' : ''}
                    ${isCtExpiringSoon(vehicule.date_ct) ? 'text-yellow-600 font-medium' : ''}
                    ${!isCtExpired(vehicule.date_ct) && !isCtExpiringSoon(vehicule.date_ct) ? 'text-gray-600' : ''}
                  `}>
                    CT : {vehicule.date_ct ? new Date(vehicule.date_ct).toLocaleDateString('fr-FR') : 'Non renseigné'}
                    {isCtExpired(vehicule.date_ct) && ' ⚠️ Expiré'}
                    {isCtExpiringSoon(vehicule.date_ct) && ' ⚠️ < 30j'}
                  </span>
                </div>
                {vehicule.techniciens && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{vehicule.techniciens.prenom} {vehicule.techniciens.nom}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingVehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Immatriculation *
                </label>
                <input
                  type="text"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                  placeholder="AB-123-CD"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    placeholder="Renault"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                  <input
                    type="text"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    placeholder="Kangoo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
                    min="2000"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage</label>
                  <input
                    type="number"
                    value={formData.kilometrage}
                    onChange={(e) => setFormData({ ...formData, kilometrage: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date CT</label>
                <input
                  type="date"
                  value={formData.date_ct}
                  onChange={(e) => setFormData({ ...formData, date_ct: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technicien attribué</label>
                <select
                  value={formData.technicien_id}
                  onChange={(e) => setFormData({ ...formData, technicien_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Non attribué --</option>
                  {techniciens.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.prenom} {tech.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
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
                  {editingVehicule ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiculesPage;
