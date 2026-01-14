// =============================================================================
// EASY INCENDIE - VehiculesPage.jsx
// CRUD Véhicules avec connexion Supabase
// ⚠️ CHAMPS CORRECTS: km_actuel (PAS kilometrage), date_prochain_ct (PAS date_ct),
//                     date_mise_circulation (PAS annee)
// Champs BDD: id, organisation_id, technicien_id, immatriculation (NOT NULL),
//             marque, modele, type, date_mise_circulation, date_achat, km_actuel,
//             date_controle_technique, date_prochain_ct, assurance_numero,
//             assurance_echeance, statut, notes
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const STATUTS = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'en_service', label: 'En service', color: 'blue' },
  { value: 'maintenance', label: 'En maintenance', color: 'orange' },
  { value: 'hors_service', label: 'Hors service', color: 'red' },
];

export default function VehiculesPage() {
  const { orgId } = useAuth();
  
  // États
  const [vehicules, setVehicules] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState(null);
  
  // Formulaire - ⚠️ Champs CORRECTS
  const [form, setForm] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    type: 'utilitaire',
    date_mise_circulation: '',  // ⚠️ PAS annee
    date_achat: '',
    km_actuel: null,            // ⚠️ PAS kilometrage
    date_controle_technique: '',
    date_prochain_ct: '',       // ⚠️ PAS date_ct
    assurance_numero: '',
    assurance_echeance: '',
    technicien_id: '',
    statut: 'disponible',
    notes: ''
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadVehicules();
      loadTechniciens();
    }
  }, [orgId]);

  const loadVehicules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicules')
        .select(`
          *,
          technicien:techniciens(nom, prenom)
        `)
        .eq('organisation_id', orgId)
        .order('immatriculation');

      if (error) throw error;
      setVehicules(data || []);
    } catch (err) {
      console.error('Erreur chargement véhicules:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTechniciens = async () => {
    const { data } = await supabase
      .from('techniciens')
      .select('id, nom, prenom')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setTechniciens(data || []);
  };

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: vehicules.length,
      ctOk: vehicules.filter(v => {
        if (!v.date_prochain_ct) return true;
        return new Date(v.date_prochain_ct) > in30Days;
      }).length,
      ctSoon: vehicules.filter(v => {
        if (!v.date_prochain_ct) return false;
        const date = new Date(v.date_prochain_ct);
        return date > in15Days && date <= in30Days;
      }).length,
      ctUrgent: vehicules.filter(v => {
        if (!v.date_prochain_ct) return false;
        return new Date(v.date_prochain_ct) <= in15Days;
      }).length,
      kmMoyen: vehicules.length > 0 
        ? Math.round(vehicules.reduce((sum, v) => sum + (v.km_actuel || 0), 0) / vehicules.length)
        : 0
    };
  }, [vehicules]);

  // Statut CT
  const getCtStatus = (dateProchainCt) => {
    if (!dateProchainCt) return { status: 'ok', label: 'CT OK', color: 'green' };
    
    const today = new Date();
    const dateCt = new Date(dateProchainCt);
    const diffDays = Math.ceil((dateCt - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', label: 'CT Expiré', color: 'red' };
    if (diffDays <= 15) return { status: 'urgent', label: `CT ${diffDays}j`, color: 'red' };
    if (diffDays <= 30) return { status: 'soon', label: `CT ${diffDays}j`, color: 'orange' };
    return { status: 'ok', label: 'CT OK', color: 'green' };
  };

  // Ouvrir modal création
  const handleNew = () => {
    setForm({
      immatriculation: '',
      marque: '',
      modele: '',
      type: 'utilitaire',
      date_mise_circulation: '',
      date_achat: '',
      km_actuel: null,
      date_controle_technique: '',
      date_prochain_ct: '',
      assurance_numero: '',
      assurance_echeance: '',
      technicien_id: '',
      statut: 'disponible',
      notes: ''
    });
    setEditingVehicule(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (vehicule) => {
    setForm({
      immatriculation: vehicule.immatriculation || '',
      marque: vehicule.marque || '',
      modele: vehicule.modele || '',
      type: vehicule.type || 'utilitaire',
      date_mise_circulation: vehicule.date_mise_circulation || '',
      date_achat: vehicule.date_achat || '',
      km_actuel: vehicule.km_actuel || null,
      date_controle_technique: vehicule.date_controle_technique || '',
      date_prochain_ct: vehicule.date_prochain_ct || '',
      assurance_numero: vehicule.assurance_numero || '',
      assurance_echeance: vehicule.assurance_echeance || '',
      technicien_id: vehicule.technicien_id || '',
      statut: vehicule.statut || 'disponible',
      notes: vehicule.notes || ''
    });
    setEditingVehicule(vehicule);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.immatriculation.trim()) {
      alert("L'immatriculation est obligatoire");
      return;
    }

    try {
      const vehiculeData = {
        ...form,
        organisation_id: orgId,
        technicien_id: form.technicien_id || null,
        km_actuel: form.km_actuel || null,
        date_mise_circulation: form.date_mise_circulation || null,
        date_achat: form.date_achat || null,
        date_controle_technique: form.date_controle_technique || null,
        date_prochain_ct: form.date_prochain_ct || null,
        assurance_echeance: form.assurance_echeance || null,
        updated_at: new Date().toISOString()
      };

      if (editingVehicule) {
        const { error } = await supabase
          .from('vehicules')
          .update(vehiculeData)
          .eq('id', editingVehicule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vehicules')
          .insert([vehiculeData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadVehicules();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (vehicule) => {
    if (!confirm(`Supprimer le véhicule "${vehicule.immatriculation}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('vehicules')
        .delete()
        .eq('id', vehicule.id);
      if (error) throw error;
      loadVehicules();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚗 Véhicules</h1>
          <p className="text-gray-500">Gestion du parc automobile</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          ➕ Nouveau véhicule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Véhicules</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.ctOk}</p>
          <p className="text-green-600 text-xs">CT OK</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-2xl font-bold text-orange-700">{stats.ctSoon}</p>
          <p className="text-orange-600 text-xs">CT &lt; 30j</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.ctUrgent}</p>
          <p className="text-red-600 text-xs">CT &lt; 15j</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.kmMoyen.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">km moyen</p>
        </div>
      </div>

      {/* Liste Véhicules (Cards) */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">Chargement...</div>
      ) : vehicules.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
          Aucun véhicule. Ajoutez votre premier véhicule !
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicules.map(vehicule => {
            const ctStatus = getCtStatus(vehicule.date_prochain_ct);
            
            return (
              <div 
                key={vehicule.id} 
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  ctStatus.status === 'urgent' || ctStatus.status === 'expired' 
                    ? 'border-orange-200' 
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚐</span>
                    <div>
                      <p className="font-bold text-gray-900">{vehicule.immatriculation}</p>
                      <p className="text-sm text-gray-500">{vehicule.marque} {vehicule.modele}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ctStatus.status === 'expired' ? 'bg-red-100 text-red-700 animate-pulse' :
                    ctStatus.status === 'urgent' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                    ctStatus.status === 'soon' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ctStatus.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Affecté à</span>
                    <span className="font-medium">
                      {vehicule.technicien 
                        ? `${vehicule.technicien.prenom} ${vehicule.technicien.nom}` 
                        : 'Non affecté'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kilométrage</span>
                    <span>{vehicule.km_actuel?.toLocaleString() || '-'} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prochain CT</span>
                    <span className={ctStatus.status !== 'ok' ? `text-${ctStatus.color}-600 font-medium` : ''}>
                      {vehicule.date_prochain_ct 
                        ? new Date(vehicule.date_prochain_ct).toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assurance</span>
                    <span>
                      {vehicule.assurance_echeance 
                        ? new Date(vehicule.assurance_echeance).toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 border-t pt-3 mt-3">
                  <button 
                    onClick={() => handleEdit(vehicule)}
                    className="flex-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(vehicule)}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Supprimer
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingVehicule ? 'Modifier le véhicule' : 'Nouveau véhicule'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Identification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Immatriculation *</label>
                  <input 
                    type="text" 
                    value={form.immatriculation}
                    onChange={(e) => setForm({...form, immatriculation: e.target.value.toUpperCase()})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="AB-123-CD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="utilitaire">Utilitaire</option>
                    <option value="fourgon">Fourgon</option>
                    <option value="camionnette">Camionnette</option>
                    <option value="berline">Berline</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marque</label>
                  <input 
                    type="text" 
                    value={form.marque}
                    onChange={(e) => setForm({...form, marque: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Renault, Peugeot..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modèle</label>
                  <input 
                    type="text" 
                    value={form.modele}
                    onChange={(e) => setForm({...form, modele: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Kangoo, Partner..."
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📅 Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date mise en circulation</label>
                    <input 
                      type="date" 
                      value={form.date_mise_circulation}
                      onChange={(e) => setForm({...form, date_mise_circulation: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date d'achat</label>
                    <input 
                      type="date" 
                      value={form.date_achat}
                      onChange={(e) => setForm({...form, date_achat: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Kilométrage */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📊 Kilométrage</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Kilométrage actuel</label>
                  <input 
                    type="number" 
                    value={form.km_actuel || ''}
                    onChange={(e) => setForm({...form, km_actuel: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="52340"
                  />
                </div>
              </div>

              {/* Contrôle technique */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">🔧 Contrôle technique</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dernier CT</label>
                    <input 
                      type="date" 
                      value={form.date_controle_technique}
                      onChange={(e) => setForm({...form, date_controle_technique: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prochain CT</label>
                    <input 
                      type="date" 
                      value={form.date_prochain_ct}
                      onChange={(e) => setForm({...form, date_prochain_ct: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assurance */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">🛡️ Assurance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">N° Police</label>
                    <input 
                      type="text" 
                      value={form.assurance_numero}
                      onChange={(e) => setForm({...form, assurance_numero: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Échéance</label>
                    <input 
                      type="date" 
                      value={form.assurance_echeance}
                      onChange={(e) => setForm({...form, assurance_echeance: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Affectation */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👷 Affectation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Technicien</label>
                    <select 
                      value={form.technicien_id}
                      onChange={(e) => setForm({...form, technicien_id: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">-- Non affecté --</option>
                      {techniciens.map(t => (
                        <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Statut</label>
                    <select 
                      value={form.statut}
                      onChange={(e) => setForm({...form, statut: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      {STATUTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Notes internes..."
                />
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {editingVehicule ? 'Enregistrer' : 'Créer le véhicule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
