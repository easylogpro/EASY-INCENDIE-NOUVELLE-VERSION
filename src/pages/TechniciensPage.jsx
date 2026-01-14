// =============================================================================
// EASY INCENDIE - TechniciensPage.jsx
// CRUD Techniciens avec connexion Supabase
// Champs BDD: id, organisation_id, groupe_id, auth_id, matricule,
//             nom (NOT NULL), prenom (NOT NULL), email, telephone (NOT NULL),
//             adresse, code_postal, ville, date_naissance, date_embauche,
//             type_contrat, habilitations (jsonb), certifications (jsonb),
//             couleur_planning, actif
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const COULEURS_PLANNING = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // yellow
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

const TYPES_CONTRAT = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'alternance', label: 'Alternance' },
  { value: 'stage', label: 'Stage' },
  { value: 'interim', label: 'Intérim' },
];

export default function TechniciensPage() {
  const { orgId } = useAuth();
  
  // États
  const [techniciens, setTechniciens] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGroupe, setFilterGroupe] = useState('');
  
  // Formulaire
  const [form, setForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    date_naissance: '',
    date_embauche: '',
    type_contrat: 'cdi',
    groupe_id: '',
    habilitations: {},
    certifications: {},
    couleur_planning: '#3B82F6',
    actif: true
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadTechniciens();
      loadGroupes();
    }
  }, [orgId]);

  const loadTechniciens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('techniciens')
        .select(`
          *,
          groupe:groupes(nom),
          vehicule:vehicules(immatriculation)
        `)
        .eq('organisation_id', orgId)
        .order('nom');

      if (error) throw error;
      setTechniciens(data || []);
    } catch (err) {
      console.error('Erreur chargement techniciens:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupes = async () => {
    const { data } = await supabase
      .from('groupes')
      .select('id, nom')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setGroupes(data || []);
  };

  // Générer matricule auto
  const generateMatricule = async () => {
    const { count } = await supabase
      .from('techniciens')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    
    return `TECH-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  // Ouvrir modal création
  const handleNew = async () => {
    const matricule = await generateMatricule();
    setForm({
      matricule,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      code_postal: '',
      ville: '',
      date_naissance: '',
      date_embauche: '',
      type_contrat: 'cdi',
      groupe_id: '',
      habilitations: {},
      certifications: {},
      couleur_planning: COULEURS_PLANNING[Math.floor(Math.random() * COULEURS_PLANNING.length)],
      actif: true
    });
    setEditingTech(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (tech) => {
    setForm({
      matricule: tech.matricule || '',
      nom: tech.nom || '',
      prenom: tech.prenom || '',
      email: tech.email || '',
      telephone: tech.telephone || '',
      adresse: tech.adresse || '',
      code_postal: tech.code_postal || '',
      ville: tech.ville || '',
      date_naissance: tech.date_naissance || '',
      date_embauche: tech.date_embauche || '',
      type_contrat: tech.type_contrat || 'cdi',
      groupe_id: tech.groupe_id || '',
      habilitations: tech.habilitations || {},
      certifications: tech.certifications || {},
      couleur_planning: tech.couleur_planning || '#3B82F6',
      actif: tech.actif !== false
    });
    setEditingTech(tech);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert('Le nom est obligatoire');
      return;
    }
    if (!form.prenom.trim()) {
      alert('Le prénom est obligatoire');
      return;
    }
    if (!form.telephone.trim()) {
      alert('Le téléphone est obligatoire');
      return;
    }

    try {
      const techData = {
        ...form,
        organisation_id: orgId,
        groupe_id: form.groupe_id || null,
        date_naissance: form.date_naissance || null,
        date_embauche: form.date_embauche || null,
        updated_at: new Date().toISOString()
      };

      if (editingTech) {
        const { error } = await supabase
          .from('techniciens')
          .update(techData)
          .eq('id', editingTech.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('techniciens')
          .insert([techData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadTechniciens();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer
  const handleDelete = async (tech) => {
    if (!confirm(`Supprimer le technicien "${tech.prenom} ${tech.nom}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('techniciens')
        .delete()
        .eq('id', tech.id);
      if (error) throw error;
      loadTechniciens();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer
  const filteredTech = techniciens.filter(t => {
    const matchSearch = !search || 
      t.nom?.toLowerCase().includes(search.toLowerCase()) ||
      t.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      t.matricule?.toLowerCase().includes(search.toLowerCase());
    const matchGroupe = !filterGroupe || t.groupe_id === filterGroupe;
    return matchSearch && matchGroupe;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👷 Techniciens</h1>
          <p className="text-gray-500">Gestion de votre équipe terrain</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          ➕ Nouveau technicien
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{techniciens.length}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{techniciens.filter(t => t.actif).length}</p>
          <p className="text-green-600 text-xs">Actifs</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{techniciens.filter(t => t.type_contrat === 'cdi').length}</p>
          <p className="text-blue-600 text-xs">CDI</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{groupes.length}</p>
          <p className="text-purple-600 text-xs">Groupes</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <select 
            value={filterGroupe}
            onChange={(e) => setFilterGroupe(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les groupes</option>
            {groupes.map(g => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille Techniciens (Cards) */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">Chargement...</div>
      ) : filteredTech.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          {techniciens.length === 0 ? 'Aucun technicien. Créez votre premier technicien !' : 'Aucun résultat'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTech.map(tech => (
            <div key={tech.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: tech.couleur_planning || '#3B82F6' }}
                >
                  {tech.prenom?.[0]}{tech.nom?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{tech.prenom} {tech.nom}</p>
                  <p className="text-xs text-gray-500">{tech.matricule}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  tech.actif 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tech.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📱</span>
                  <span>{tech.telephone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📧</span>
                  <span className="truncate">{tech.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>👥</span>
                  <span>{tech.groupe?.nom || 'Aucun groupe'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📋</span>
                  <span>{TYPES_CONTRAT.find(t => t.value === tech.type_contrat)?.label || tech.type_contrat || '-'}</span>
                </div>
                {tech.vehicule && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🚐</span>
                    <span>{tech.vehicule.immatriculation}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t pt-3">
                <button 
                  onClick={() => handleEdit(tech)}
                  className="flex-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => handleDelete(tech)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingTech ? 'Modifier le technicien' : 'Nouveau technicien'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Identité */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Matricule</label>
                  <input 
                    type="text" 
                    value={form.matricule}
                    onChange={(e) => setForm({...form, matricule: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input 
                    type="text" 
                    value={form.prenom}
                    onChange={(e) => setForm({...form, prenom: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input 
                    type="text" 
                    value={form.nom}
                    onChange={(e) => setForm({...form, nom: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📱 Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone *</label>
                    <input 
                      type="tel" 
                      value={form.telephone}
                      onChange={(e) => setForm({...form, telephone: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📍 Adresse</h3>
                <input 
                  type="text" 
                  value={form.adresse}
                  onChange={(e) => setForm({...form, adresse: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Adresse"
                />
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <input 
                    type="text" 
                    value={form.code_postal}
                    onChange={(e) => setForm({...form, code_postal: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Code postal"
                  />
                  <input 
                    type="text" 
                    value={form.ville}
                    onChange={(e) => setForm({...form, ville: e.target.value})}
                    className="col-span-2 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Ville"
                  />
                </div>
              </div>

              {/* Contrat */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📋 Contrat</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type contrat</label>
                    <select 
                      value={form.type_contrat}
                      onChange={(e) => setForm({...form, type_contrat: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {TYPES_CONTRAT.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date embauche</label>
                    <input 
                      type="date" 
                      value={form.date_embauche}
                      onChange={(e) => setForm({...form, date_embauche: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date naissance</label>
                    <input 
                      type="date" 
                      value={form.date_naissance}
                      onChange={(e) => setForm({...form, date_naissance: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Groupe */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👥 Groupe</h3>
                <select 
                  value={form.groupe_id}
                  onChange={(e) => setForm({...form, groupe_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- Aucun groupe --</option>
                  {groupes.map(g => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
              </div>

              {/* Couleur Planning */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">🎨 Couleur Planning</h3>
                <div className="flex gap-2">
                  {COULEURS_PLANNING.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({...form, couleur_planning: color})}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        form.couleur_planning === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div className="flex items-center gap-2 border-t pt-4 mt-4">
                <input 
                  type="checkbox" 
                  id="actif"
                  checked={form.actif}
                  onChange={(e) => setForm({...form, actif: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="actif" className="text-sm">Technicien actif</label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {editingTech ? 'Enregistrer' : 'Créer le technicien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
