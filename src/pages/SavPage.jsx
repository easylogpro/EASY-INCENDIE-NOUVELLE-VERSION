// =============================================================================
// EASY INCENDIE - SavPage.jsx
// CRUD SAV avec connexion Supabase
// ⚠️ CHAMPS CORRECTS: symptome_declare (PAS description), demandeur_nom (PAS contact_nom),
//                     demandeur_tel (PAS contact_telephone), PAS de date_limite
// Champs BDD: id, organisation_id, site_id, client_id, contrat_id, technicien_id,
//             stt_id, domaine (NOT NULL), numero, priorite, demandeur_nom, demandeur_tel,
//             date_demande, symptome_declare, date_prevue, date_realisation,
//             diagnostic, travaux_realises, cout, budget_stt, resultat,
//             observations, signature_client, nom_signataire, facturable, statut
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'rose' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray' },
];

const PRIORITES = [
  { value: 'p1', label: 'P1 - Urgent', delai: 4, color: 'red', bg: 'bg-red-500' },
  { value: 'p2', label: 'P2 - Normal', delai: 24, color: 'orange', bg: 'bg-orange-500' },
  { value: 'p3', label: 'P3 - Mineur', delai: 72, color: 'yellow', bg: 'bg-yellow-500' },
];

const STATUTS = [
  { value: 'nouveau', label: 'Nouveau', color: 'blue' },
  { value: 'affecte', label: 'Affecté', color: 'purple' },
  { value: 'en_cours', label: 'En cours', color: 'yellow' },
  { value: 'termine', label: 'Terminé', color: 'green' },
  { value: 'annule', label: 'Annulé', color: 'gray' },
];

export default function SavPage() {
  const { orgId } = useAuth();
  
  // États
  const [savList, setSavList] = useState([]);
  const [sites, setSites] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSav, setEditingSav] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  
  // Formulaire - ⚠️ Champs CORRECTS
  const [form, setForm] = useState({
    site_id: '',
    technicien_id: '',
    domaine: 'SSI',
    numero: '',
    priorite: 'p3',
    demandeur_nom: '',      // ⚠️ PAS contact_nom
    demandeur_tel: '',      // ⚠️ PAS contact_telephone
    symptome_declare: '',   // ⚠️ PAS description
    date_prevue: '',
    diagnostic: '',
    travaux_realises: '',
    cout: null,
    observations: '',
    facturable: true,
    statut: 'nouveau'
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadSav();
      loadSites();
      loadTechniciens();
    }
  }, [orgId]);

  const loadSav = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sav')
        .select(`
          *,
          site:sites(nom, adresse, ville),
          technicien:techniciens(nom, prenom)
        `)
        .eq('organisation_id', orgId)
        .order('date_demande', { ascending: false });

      if (error) throw error;
      setSavList(data || []);
    } catch (err) {
      console.error('Erreur chargement SAV:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('id, nom, adresse, ville, client_id')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('nom');
    setSites(data || []);
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

  // Générer numéro SAV
  const generateNumeroSav = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('sav')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    
    return `SAV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
  };

  // Calculer temps restant
  const getTempsRestant = (sav) => {
    if (!sav.date_demande || sav.statut === 'termine' || sav.statut === 'annule') return null;
    
    const prio = PRIORITES.find(p => p.value === sav.priorite);
    if (!prio) return null;
    
    const dateCreation = new Date(sav.date_demande);
    const dateLimite = new Date(dateCreation.getTime() + prio.delai * 60 * 60 * 1000);
    const maintenant = new Date();
    const diff = dateLimite - maintenant;
    
    if (diff <= 0) return { heures: 0, minutes: 0, depasse: true };
    
    const heures = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { heures, minutes, depasse: false };
  };

  // Stats
  const stats = useMemo(() => {
    const enCours = savList.filter(s => !['termine', 'annule'].includes(s.statut));
    return {
      total: savList.length,
      p1: enCours.filter(s => s.priorite === 'p1').length,
      p2: enCours.filter(s => s.priorite === 'p2').length,
      p3: enCours.filter(s => s.priorite === 'p3').length,
      enCours: enCours.length,
    };
  }, [savList]);

  // Ouvrir modal création
  const handleNew = async () => {
    const numero = await generateNumeroSav();
    setForm({
      site_id: '',
      technicien_id: '',
      domaine: 'SSI',
      numero,
      priorite: 'p3',
      demandeur_nom: '',
      demandeur_tel: '',
      symptome_declare: '',
      date_prevue: '',
      diagnostic: '',
      travaux_realises: '',
      cout: null,
      observations: '',
      facturable: true,
      statut: 'nouveau'
    });
    setEditingSav(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (sav) => {
    setForm({
      site_id: sav.site_id || '',
      technicien_id: sav.technicien_id || '',
      domaine: sav.domaine || 'SSI',
      numero: sav.numero || '',
      priorite: sav.priorite || 'p3',
      demandeur_nom: sav.demandeur_nom || '',
      demandeur_tel: sav.demandeur_tel || '',
      symptome_declare: sav.symptome_declare || '',
      date_prevue: sav.date_prevue || '',
      diagnostic: sav.diagnostic || '',
      travaux_realises: sav.travaux_realises || '',
      cout: sav.cout || null,
      observations: sav.observations || '',
      facturable: sav.facturable !== false,
      statut: sav.statut || 'nouveau'
    });
    setEditingSav(sav);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.site_id) {
      alert('Le site est obligatoire');
      return;
    }
    if (!form.domaine) {
      alert('Le domaine est obligatoire');
      return;
    }

    try {
      // Récupérer client_id du site
      const site = sites.find(s => s.id === form.site_id);
      
      const savData = {
        ...form,
        organisation_id: orgId,
        client_id: site?.client_id || null,
        technicien_id: form.technicien_id || null,
        date_prevue: form.date_prevue || null,
        cout: form.cout || null,
        updated_at: new Date().toISOString()
      };

      // Si technicien affecté et statut nouveau → passer à affecté
      if (savData.technicien_id && savData.statut === 'nouveau') {
        savData.statut = 'affecte';
      }

      if (editingSav) {
        const { error } = await supabase
          .from('sav')
          .update(savData)
          .eq('id', editingSav.id);
        if (error) throw error;
      } else {
        // Ajouter date_demande pour nouvelle entrée
        savData.date_demande = new Date().toISOString();
        const { error } = await supabase
          .from('sav')
          .insert([savData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadSav();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  // Supprimer
  const handleDelete = async (sav) => {
    if (!confirm(`Supprimer la demande SAV "${sav.numero}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('sav')
        .delete()
        .eq('id', sav.id);
      if (error) throw error;
      loadSav();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer
  const filteredSav = savList.filter(s => {
    const matchSearch = !search || 
      s.numero?.toLowerCase().includes(search.toLowerCase()) ||
      s.site?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.symptome_declare?.toLowerCase().includes(search.toLowerCase());
    const matchPrio = !filterPriorite || s.priorite === filterPriorite;
    const matchStatut = !filterStatut || s.statut === filterStatut;
    const matchDomaine = !filterDomaine || s.domaine === filterDomaine;
    return matchSearch && matchPrio && matchStatut && matchDomaine;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚨 SAV</h1>
          <p className="text-gray-500">Gestion des demandes de dépannage</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          ➕ Nouvelle demande
        </button>
      </div>

      {/* Stats Priorités */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">P1</span>
            <p className="text-2xl font-bold text-red-700">{stats.p1}</p>
          </div>
          <p className="text-red-600 text-xs">Urgent (4h)</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">P2</span>
            <p className="text-2xl font-bold text-orange-700">{stats.p2}</p>
          </div>
          <p className="text-orange-600 text-xs">Normal (24h)</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">P3</span>
            <p className="text-2xl font-bold text-yellow-700">{stats.p3}</p>
          </div>
          <p className="text-yellow-600 text-xs">Mineur (72h)</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.enCours}</p>
          <p className="text-blue-600 text-xs">En cours</p>
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
            value={filterPriorite}
            onChange={(e) => setFilterPriorite(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes priorités</option>
            {PRIORITES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select 
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous statuts</option>
            {STATUTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
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
        </div>
      </div>

      {/* Liste SAV */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">Chargement...</div>
        ) : filteredSav.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
            {savList.length === 0 ? 'Aucune demande SAV. Créez votre première demande !' : 'Aucun résultat'}
          </div>
        ) : (
          filteredSav.map(sav => {
            const prio = PRIORITES.find(p => p.value === sav.priorite);
            const statut = STATUTS.find(s => s.value === sav.statut);
            const domaine = DOMAINES.find(d => d.code === sav.domaine);
            const tempsRestant = getTempsRestant(sav);

            return (
              <div 
                key={sav.id} 
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  tempsRestant?.depasse ? 'border-red-300 bg-red-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Priorité */}
                  <div className="flex flex-col items-center">
                    <span className={`px-3 py-1.5 ${prio?.bg} text-white text-sm font-bold rounded`}>
                      {sav.priorite?.toUpperCase()}
                    </span>
                    {tempsRestant && !tempsRestant.depasse && (
                      <div className="mt-2 text-center">
                        <p className={`font-bold text-${prio?.color}-600`}>
                          {tempsRestant.heures}h{tempsRestant.minutes.toString().padStart(2, '0')}
                        </p>
                        <p className="text-xs text-gray-500">restantes</p>
                      </div>
                    )}
                    {tempsRestant?.depasse && (
                      <div className="mt-2 text-center">
                        <p className="font-bold text-red-600 animate-pulse">DÉPASSÉ</p>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{sav.numero}</span>
                          <span className={`px-2 py-0.5 rounded text-xs bg-${domaine?.color}-100 text-${domaine?.color}-700`}>
                            {domaine?.icon} {sav.domaine}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs bg-${statut?.color}-100 text-${statut?.color}-700`}>
                            {statut?.label}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{sav.site?.nom || 'Site inconnu'}</p>
                        <p className="text-sm text-gray-500">{sav.site?.adresse}, {sav.site?.ville}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{new Date(sav.date_demande).toLocaleDateString('fr-FR')}</p>
                        <p>{new Date(sav.date_demande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    {/* Symptôme */}
                    {sav.symptome_declare && (
                      <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                        💬 {sav.symptome_declare}
                      </p>
                    )}

                    {/* Infos */}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>👤</span>
                        <span>{sav.demandeur_nom || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>📱</span>
                        <span>{sav.demandeur_tel || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>👷</span>
                        <span>
                          {sav.technicien 
                            ? `${sav.technicien.prenom} ${sav.technicien.nom}` 
                            : 'Non affecté'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => handleEdit(sav)}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(sav)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingSav ? 'Modifier la demande SAV' : 'Nouvelle demande SAV'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Numéro et Priorité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">N° SAV</label>
                  <input 
                    type="text" 
                    value={form.numero}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorité *</label>
                  <select 
                    value={form.priorite}
                    onChange={(e) => setForm({...form, priorite: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {PRIORITES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Site et Domaine */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Site *</label>
                  <select 
                    value={form.site_id}
                    onChange={(e) => setForm({...form, site_id: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.nom} - {s.ville}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Domaine *</label>
                  <select 
                    value={form.domaine}
                    onChange={(e) => setForm({...form, domaine: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {DOMAINES.map(d => (
                      <option key={d.code} value={d.code}>{d.icon} {d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Demandeur - ⚠️ BONS CHAMPS */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👤 Demandeur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom du demandeur</label>
                    <input 
                      type="text" 
                      value={form.demandeur_nom}
                      onChange={(e) => setForm({...form, demandeur_nom: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Ex: M. Martin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <input 
                      type="tel" 
                      value={form.demandeur_tel}
                      onChange={(e) => setForm({...form, demandeur_tel: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
              </div>

              {/* Symptôme déclaré - ⚠️ BON CHAMP */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">💬 Symptôme déclaré</h3>
                <textarea 
                  value={form.symptome_declare}
                  onChange={(e) => setForm({...form, symptome_declare: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Description du problème signalé par le client..."
                />
              </div>

              {/* Affectation */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👷 Affectation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Technicien</label>
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
                    <label className="block text-sm font-medium mb-1">Date prévue</label>
                    <input 
                      type="date" 
                      value={form.date_prevue}
                      onChange={(e) => setForm({...form, date_prevue: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnostic et travaux (si édition) */}
              {editingSav && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-3">🔧 Intervention</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Diagnostic</label>
                      <textarea 
                        value={form.diagnostic}
                        onChange={(e) => setForm({...form, diagnostic: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Diagnostic établi..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Travaux réalisés</label>
                      <textarea 
                        value={form.travaux_realises}
                        onChange={(e) => setForm({...form, travaux_realises: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Travaux effectués..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Coût (€)</label>
                        <input 
                          type="number" 
                          value={form.cout || ''}
                          onChange={(e) => setForm({...form, cout: e.target.value ? parseFloat(e.target.value) : null})}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Statut</label>
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
                </div>
              )}

              {/* Options */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={form.facturable}
                      onChange={(e) => setForm({...form, facturable: e.target.checked})}
                      className="rounded"
                    />
                    Facturable
                  </label>
                </div>
              </div>

              {/* Observations */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium mb-1">Observations internes</label>
                <textarea 
                  value={form.observations}
                  onChange={(e) => setForm({...form, observations: e.target.value})}
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
                {editingSav ? 'Enregistrer' : 'Créer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
