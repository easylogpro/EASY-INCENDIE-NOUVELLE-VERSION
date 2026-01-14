// =============================================================================
// EASY INCENDIE - SoustraitantsPage.jsx
// CRUD Sous-traitants avec connexion Supabase
// Champs BDD: id, organisation_id, raison_sociale (NOT NULL), siret, contact_nom,
//             contact_prenom, telephone, email, adresse, code_postal, ville,
//             domaines_competence[], taux_horaire, actif, created_at, updated_at
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Euro } from 'lucide-react';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'rose' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray' },
];

export default function SoustraitantsPage() {
  const { orgId } = useAuth();

  // États
  const [soustraitants, setSoustraitants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStt, setEditingStt] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  const [filterActif, setFilterActif] = useState('');

  // Formulaire
  const [form, setForm] = useState({
    raison_sociale: '',
    siret: '',
    contact_nom: '',
    contact_prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    code_postal: '',
    ville: '',
    domaines_competence: [],
    taux_horaire: null,
    actif: true
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadSoustraitants();
    }
  }, [orgId]);

  const loadSoustraitants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sous_traitants')
        .select('*')
        .eq('organisation_id', orgId)
        .order('raison_sociale');

      if (error) throw error;
      setSoustraitants(data || []);
    } catch (err) {
      console.error('Erreur chargement sous-traitants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const actifs = soustraitants.filter(s => s.actif);
    const avecTaux = soustraitants.filter(s => s.taux_horaire);
    const tauxMoyen = avecTaux.length > 0
      ? avecTaux.reduce((sum, s) => sum + s.taux_horaire, 0) / avecTaux.length
      : 0;

    return {
      total: soustraitants.length,
      actifs: actifs.length,
      inactifs: soustraitants.filter(s => !s.actif).length,
      tauxMoyen: tauxMoyen.toFixed(0)
    };
  }, [soustraitants]);

  // Toggle domaine dans le formulaire
  const toggleDomaine = (code) => {
    setForm(prev => {
      const domaines = prev.domaines_competence || [];
      if (domaines.includes(code)) {
        return { ...prev, domaines_competence: domaines.filter(d => d !== code) };
      } else {
        return { ...prev, domaines_competence: [...domaines, code] };
      }
    });
  };

  // Ouvrir modal création
  const handleNew = () => {
    setForm({
      raison_sociale: '',
      siret: '',
      contact_nom: '',
      contact_prenom: '',
      telephone: '',
      email: '',
      adresse: '',
      code_postal: '',
      ville: '',
      domaines_competence: [],
      taux_horaire: null,
      actif: true
    });
    setEditingStt(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (stt) => {
    setForm({
      raison_sociale: stt.raison_sociale || '',
      siret: stt.siret || '',
      contact_nom: stt.contact_nom || '',
      contact_prenom: stt.contact_prenom || '',
      telephone: stt.telephone || '',
      email: stt.email || '',
      adresse: stt.adresse || '',
      code_postal: stt.code_postal || '',
      ville: stt.ville || '',
      domaines_competence: stt.domaines_competence || [],
      taux_horaire: stt.taux_horaire || null,
      actif: stt.actif !== false
    });
    setEditingStt(stt);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.raison_sociale.trim()) {
      alert('La raison sociale est obligatoire');
      return;
    }

    try {
      const sttData = {
        ...form,
        organisation_id: orgId,
        taux_horaire: form.taux_horaire || null,
        updated_at: new Date().toISOString()
      };

      if (editingStt) {
        const { error } = await supabase
          .from('sous_traitants')
          .update(sttData)
          .eq('id', editingStt.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sous_traitants')
          .insert([sttData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadSoustraitants();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (stt) => {
    if (!confirm(`Supprimer le sous-traitant "${stt.raison_sociale}" ?`)) return;

    try {
      const { error } = await supabase
        .from('sous_traitants')
        .delete()
        .eq('id', stt.id);
      if (error) throw error;
      loadSoustraitants();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer
  const filteredStt = soustraitants.filter(s => {
    const matchSearch = !search ||
      s.raison_sociale?.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.ville?.toLowerCase().includes(search.toLowerCase());
    const matchDomaine = !filterDomaine ||
      (s.domaines_competence && s.domaines_competence.includes(filterDomaine));
    const matchActif = filterActif === '' ||
      (filterActif === 'actif' && s.actif) ||
      (filterActif === 'inactif' && !s.actif);
    return matchSearch && matchDomaine && matchActif;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-purple-500" />
            Sous-traitants
          </h1>
          <p className="text-gray-500">Gérez vos partenaires sous-traitants</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Nouveau sous-traitant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Sous-traitants</p>
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
          <p className="text-2xl font-bold text-blue-700">{stats.tauxMoyen} €</p>
          <p className="text-blue-600 text-xs">Taux horaire moyen</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filterDomaine}
            onChange={(e) => setFilterDomaine(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous domaines</option>
            {DOMAINES.map(d => (
              <option key={d.code} value={d.code}>{d.icon} {d.label}</option>
            ))}
          </select>
          <select
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Chargement...
        </div>
      ) : filteredStt.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {soustraitants.length === 0
              ? 'Aucun sous-traitant. Ajoutez votre premier partenaire !'
              : 'Aucun résultat pour votre recherche'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStt.map(stt => (
            <div
              key={stt.id}
              className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                !stt.actif ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{stt.raison_sociale}</h3>
                  {stt.contact_nom && (
                    <p className="text-sm text-gray-600">
                      {stt.contact_prenom} {stt.contact_nom}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  stt.actif
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stt.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Domaines */}
              {stt.domaines_competence && stt.domaines_competence.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {stt.domaines_competence.map(code => {
                    const domaine = DOMAINES.find(d => d.code === code);
                    return (
                      <span
                        key={code}
                        className={`px-2 py-0.5 rounded text-xs bg-${domaine?.color}-100 text-${domaine?.color}-700`}
                      >
                        {domaine?.icon} {code}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Infos contact */}
              <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                {stt.telephone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {stt.telephone}
                  </p>
                )}
                {stt.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{stt.email}</span>
                  </p>
                )}
                {stt.ville && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {stt.code_postal} {stt.ville}
                  </p>
                )}
                {stt.taux_horaire && (
                  <p className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-gray-400" />
                    {stt.taux_horaire} €/h
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-3 mt-3">
                <button
                  onClick={() => handleEdit(stt)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(stt)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  <Trash2 className="w-4 h-4" />
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
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingStt ? 'Modifier le sous-traitant' : 'Nouveau sous-traitant'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Raison sociale et SIRET */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Raison sociale *</label>
                  <input
                    type="text"
                    value={form.raison_sociale}
                    onChange={(e) => setForm({...form, raison_sociale: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SIRET</label>
                  <input
                    type="text"
                    value={form.siret}
                    onChange={(e) => setForm({...form, siret: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={form.contact_prenom}
                      onChange={(e) => setForm({...form, contact_prenom: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nom</label>
                    <input
                      type="text"
                      value={form.contact_nom}
                      onChange={(e) => setForm({...form, contact_nom: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => setForm({...form, telephone: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="contact@entreprise.fr"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Adresse</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => setForm({...form, adresse: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="123 rue de la Paix"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                    <input
                      type="text"
                      value={form.code_postal}
                      onChange={(e) => setForm({...form, code_postal: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="75001"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Ville</label>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={(e) => setForm({...form, ville: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>

              {/* Domaines de compétence */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Domaines de compétence</h3>
                <div className="flex flex-wrap gap-2">
                  {DOMAINES.map(domaine => {
                    const isSelected = form.domaines_competence?.includes(domaine.code);
                    return (
                      <button
                        key={domaine.code}
                        type="button"
                        onClick={() => toggleDomaine(domaine.code)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? `bg-${domaine.color}-500 text-white`
                            : `bg-${domaine.color}-50 text-${domaine.color}-700 hover:bg-${domaine.color}-100`
                        }`}
                      >
                        {domaine.icon} {domaine.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Taux horaire */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">Tarification</h3>
                <div className="w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">Taux horaire (€)</label>
                  <input
                    type="number"
                    value={form.taux_horaire || ''}
                    onChange={(e) => setForm({...form, taux_horaire: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    step="0.01"
                    placeholder="45.00"
                  />
                </div>
              </div>

              {/* Statut */}
              <div className="border-t pt-4 mt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => setForm({...form, actif: e.target.checked})}
                    className="rounded"
                  />
                  Sous-traitant actif
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:opacity-90"
              >
                {editingStt ? 'Enregistrer' : 'Créer le sous-traitant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
