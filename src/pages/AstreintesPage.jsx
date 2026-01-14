// =============================================================================
// EASY INCENDIE - AstreintesPage.jsx
// CRUD Planning des astreintes avec connexion Supabase
// Champs BDD: id, organisation_id, technicien_id, date_debut (NOT NULL),
//             date_fin (NOT NULL), telephone_astreinte, notes, created_at, updated_at
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Phone, Plus, Search, Calendar, User, Clock, Edit2, Trash2, X,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

export default function AstreintesPage() {
  const { orgId } = useAuth();

  // États
  const [astreintes, setAstreintes] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAstreinte, setEditingAstreinte] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterTechnicien, setFilterTechnicien] = useState('');

  // Formulaire
  const [form, setForm] = useState({
    technicien_id: '',
    date_debut: '',
    date_fin: '',
    telephone_astreinte: '',
    notes: ''
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadAstreintes();
      loadTechniciens();
    }
  }, [orgId]);

  const loadAstreintes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('astreintes')
        .select('*, technicien:techniciens(id, nom, prenom, telephone, couleur_planning)')
        .eq('organisation_id', orgId)
        .order('date_debut', { ascending: false });

      if (error) throw error;
      setAstreintes(data || []);
    } catch (err) {
      console.error('Erreur chargement astreintes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTechniciens = async () => {
    const { data } = await supabase
      .from('techniciens')
      .select('id, nom, prenom, telephone, couleur_planning')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setTechniciens(data || []);
  };

  // Navigation semaine
  const getWeekDays = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1); // Lundi
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const weekDays = getWeekDays();
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  // Astreintes de la semaine
  const astreintesThisWeek = useMemo(() => {
    return astreintes.filter(a => {
      const debut = new Date(a.date_debut);
      const fin = new Date(a.date_fin);
      return debut <= weekEnd && fin >= weekStart;
    });
  }, [astreintes, weekStart, weekEnd]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const enCours = astreintes.filter(a =>
      new Date(a.date_debut) <= now && new Date(a.date_fin) >= now
    );
    const semaine = astreintesThisWeek.length;
    const sansAstreinte = weekDays.filter(day => {
      const dayStr = day.toISOString().split('T')[0];
      return !astreintes.some(a => {
        const debut = new Date(a.date_debut);
        const fin = new Date(a.date_fin);
        debut.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        return day >= debut && day <= fin;
      });
    }).length;

    return {
      total: astreintes.length,
      enCours: enCours.length,
      semaine,
      joursSansAstreinte: sansAstreinte
    };
  }, [astreintes, astreintesThisWeek, weekDays]);

  // Vérifier si un jour a une astreinte
  const getAstreintesForDay = (day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return astreintes.filter(a => {
      const debut = new Date(a.date_debut);
      const fin = new Date(a.date_fin);
      return debut <= dayEnd && fin >= dayStart;
    });
  };

  // Ouvrir modal création
  const handleNew = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);

    setForm({
      technicien_id: '',
      date_debut: nextMonday.toISOString().split('T')[0],
      date_fin: nextSunday.toISOString().split('T')[0],
      telephone_astreinte: '',
      notes: ''
    });
    setEditingAstreinte(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (astreinte) => {
    setForm({
      technicien_id: astreinte.technicien_id || '',
      date_debut: astreinte.date_debut || '',
      date_fin: astreinte.date_fin || '',
      telephone_astreinte: astreinte.telephone_astreinte || '',
      notes: astreinte.notes || ''
    });
    setEditingAstreinte(astreinte);
    setShowModal(true);
  };

  // Pré-remplir le téléphone quand on sélectionne un technicien
  const handleTechnicienChange = (techId) => {
    const tech = techniciens.find(t => t.id === techId);
    setForm(prev => ({
      ...prev,
      technicien_id: techId,
      telephone_astreinte: prev.telephone_astreinte || tech?.telephone || ''
    }));
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.technicien_id) {
      alert('Veuillez sélectionner un technicien');
      return;
    }
    if (!form.date_debut || !form.date_fin) {
      alert('Les dates de début et fin sont obligatoires');
      return;
    }
    if (new Date(form.date_fin) < new Date(form.date_debut)) {
      alert('La date de fin doit être après la date de début');
      return;
    }

    try {
      const astreinteData = {
        ...form,
        organisation_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (editingAstreinte) {
        const { error } = await supabase
          .from('astreintes')
          .update(astreinteData)
          .eq('id', editingAstreinte.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('astreintes')
          .insert([astreinteData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadAstreintes();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (astreinte) => {
    const techNom = astreinte.technicien
      ? `${astreinte.technicien.prenom} ${astreinte.technicien.nom}`
      : 'ce technicien';

    if (!confirm(`Supprimer l'astreinte de ${techNom} ?`)) return;

    try {
      const { error } = await supabase
        .from('astreintes')
        .delete()
        .eq('id', astreinte.id);
      if (error) throw error;
      loadAstreintes();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-7 h-7 text-orange-500" />
            Planning des astreintes
          </h1>
          <p className="text-gray-500">Gérez les astreintes de vos techniciens</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Nouvelle astreinte
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total astreintes</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.enCours}</p>
          <p className="text-green-600 text-xs">En cours</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.semaine}</p>
          <p className="text-blue-600 text-xs">Cette semaine</p>
        </div>
        {stats.joursSansAstreinte > 0 && (
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-2xl font-bold text-orange-700">{stats.joursSansAstreinte}</p>
            <p className="text-orange-600 text-xs">Jours non couverts</p>
          </div>
        )}
      </div>

      {/* Navigation semaine */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-lg">
              Semaine du {formatDate(weekStart)} au {formatDate(weekEnd)}
            </h2>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Revenir à aujourd'hui
            </button>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendrier semaine */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Chargement...
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden mb-6">
          {/* En-tête jours */}
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayAstreintes = getAstreintesForDay(day);
              const hasAstreinte = dayAstreintes.length > 0;

              return (
                <div
                  key={i}
                  className={`p-3 text-center border-r last:border-r-0 ${
                    isToday ? 'bg-orange-50' : ''
                  }`}
                >
                  <p className={`text-xs font-medium ${isToday ? 'text-orange-600' : 'text-gray-500'}`}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? 'text-orange-600' : ''}`}>
                    {day.getDate()}
                  </p>
                  {!hasAstreinte && (
                    <AlertCircle className="w-4 h-4 text-orange-400 mx-auto mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Corps calendrier */}
          <div className="grid grid-cols-7 min-h-[200px]">
            {weekDays.map((day, i) => {
              const dayAstreintes = getAstreintesForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`p-2 border-r last:border-r-0 ${
                    isToday ? 'bg-orange-50/30' : ''
                  }`}
                >
                  {dayAstreintes.map(astreinte => (
                    <div
                      key={astreinte.id}
                      onClick={() => handleEdit(astreinte)}
                      className="mb-2 p-2 rounded-lg text-white text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: astreinte.technicien?.couleur_planning || '#3B82F6'
                      }}
                    >
                      <p className="font-medium truncate">
                        {astreinte.technicien?.prenom} {astreinte.technicien?.nom}
                      </p>
                      {astreinte.telephone_astreinte && (
                        <p className="opacity-80 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {astreinte.telephone_astreinte}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste des astreintes */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold">Toutes les astreintes</h3>
          <select
            value={filterTechnicien}
            onChange={(e) => setFilterTechnicien(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Tous les techniciens</option>
            {techniciens.map(t => (
              <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
            ))}
          </select>
        </div>

        {astreintes.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune astreinte planifiée</p>
          </div>
        ) : (
          <div className="divide-y">
            {astreintes
              .filter(a => !filterTechnicien || a.technicien_id === filterTechnicien)
              .slice(0, 20)
              .map(astreinte => {
                const isActive = new Date(astreinte.date_debut) <= new Date() &&
                                 new Date(astreinte.date_fin) >= new Date();

                return (
                  <div
                    key={astreinte.id}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                      isActive ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          backgroundColor: astreinte.technicien?.couleur_planning || '#3B82F6'
                        }}
                      >
                        {astreinte.technicien?.prenom?.[0]}{astreinte.technicien?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {astreinte.technicien?.prenom} {astreinte.technicien?.nom}
                          {isActive && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              En cours
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(astreinte.date_debut)} → {formatDate(astreinte.date_fin)}
                          </span>
                          {astreinte.telephone_astreinte && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {astreinte.telephone_astreinte}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(astreinte)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(astreinte)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingAstreinte ? 'Modifier l\'astreinte' : 'Nouvelle astreinte'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Technicien */}
              <div>
                <label className="block text-sm font-medium mb-1">Technicien *</label>
                <select
                  value={form.technicien_id}
                  onChange={(e) => handleTechnicienChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner un technicien</option>
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date début *</label>
                  <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) => setForm({...form, date_debut: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date fin *</label>
                  <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm({...form, date_fin: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Téléphone astreinte */}
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone d'astreinte</label>
                <input
                  type="tel"
                  value={form.telephone_astreinte}
                  onChange={(e) => setForm({...form, telephone_astreinte: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="06 12 34 56 78"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour utiliser le téléphone du technicien
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
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
                {editingAstreinte ? 'Enregistrer' : 'Créer l\'astreinte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
