// =============================================================================
// EASY INCENDIE - ClientsPage.jsx
// CRUD Clients avec connexion Supabase
// Champs BDD: id, organisation_id, numero_client, type, raison_sociale, siret,
//             adresse_facturation, cp_facturation, ville_facturation,
//             contact_nom, contact_prenom, contact_fonction, telephone, email,
//             email_facturation, mode_paiement, delai_paiement_jours, notes, actif
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ClientsPage() {
  const { orgId } = useAuth();
  
  // États
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActif, setFilterActif] = useState('');
  
  // Formulaire
  const [form, setForm] = useState({
    numero_client: '',
    type: 'entreprise',
    raison_sociale: '',
    siret: '',
    adresse_facturation: '',
    cp_facturation: '',
    ville_facturation: '',
    contact_nom: '',
    contact_prenom: '',
    contact_fonction: '',
    telephone: '',
    email: '',
    email_facturation: '',
    mode_paiement: 'virement',
    delai_paiement_jours: 30,
    notes: '',
    actif: true
  });

  // Charger les clients
  useEffect(() => {
    if (orgId) loadClients();
  }, [orgId]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          sites:sites(count),
          contrats:contrats(count)
        `)
        .eq('organisation_id', orgId)
        .order('raison_sociale');

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Générer numéro client auto
  const generateNumeroClient = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    
    return `CLI-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  // Ouvrir modal création
  const handleNew = async () => {
    const numero = await generateNumeroClient();
    setForm({
      numero_client: numero,
      type: 'entreprise',
      raison_sociale: '',
      siret: '',
      adresse_facturation: '',
      cp_facturation: '',
      ville_facturation: '',
      contact_nom: '',
      contact_prenom: '',
      contact_fonction: '',
      telephone: '',
      email: '',
      email_facturation: '',
      mode_paiement: 'virement',
      delai_paiement_jours: 30,
      notes: '',
      actif: true
    });
    setEditingClient(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (client) => {
    setForm({
      numero_client: client.numero_client || '',
      type: client.type || 'entreprise',
      raison_sociale: client.raison_sociale || '',
      siret: client.siret || '',
      adresse_facturation: client.adresse_facturation || '',
      cp_facturation: client.cp_facturation || '',
      ville_facturation: client.ville_facturation || '',
      contact_nom: client.contact_nom || '',
      contact_prenom: client.contact_prenom || '',
      contact_fonction: client.contact_fonction || '',
      telephone: client.telephone || '',
      email: client.email || '',
      email_facturation: client.email_facturation || '',
      mode_paiement: client.mode_paiement || 'virement',
      delai_paiement_jours: client.delai_paiement_jours || 30,
      notes: client.notes || '',
      actif: client.actif !== false
    });
    setEditingClient(client);
    setShowModal(true);
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.raison_sociale.trim()) {
      alert('La raison sociale est obligatoire');
      return;
    }

    try {
      const clientData = {
        ...form,
        organisation_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (editingClient) {
        // UPDATE
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadClients();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer
  const handleDelete = async (client) => {
    if (!confirm(`Supprimer le client "${client.raison_sociale}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);
      if (error) throw error;
      loadClients();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer clients
  const filteredClients = clients.filter(c => {
    const matchSearch = !search || 
      c.raison_sociale?.toLowerCase().includes(search.toLowerCase()) ||
      c.numero_client?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_nom?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || c.type === filterType;
    const matchActif = filterActif === '' || c.actif === (filterActif === 'true');
    return matchSearch && matchType && matchActif;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏢 Clients</h1>
          <p className="text-gray-500">Gestion de vos clients</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            📥 Import Excel
          </button>
          <button 
            onClick={handleNew}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
          >
            ➕ Nouveau client
          </button>
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les types</option>
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
            <option value="collectivite">Collectivité</option>
          </select>
          <select 
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{clients.length}</p>
          <p className="text-gray-500 text-xs">Total clients</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{clients.filter(c => c.actif).length}</p>
          <p className="text-green-600 text-xs">Actifs</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{clients.filter(c => c.type === 'entreprise').length}</p>
          <p className="text-blue-600 text-xs">Entreprises</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{clients.filter(c => c.type === 'collectivite').length}</p>
          <p className="text-purple-600 text-xs">Collectivités</p>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {clients.length === 0 ? 'Aucun client. Créez votre premier client !' : 'Aucun résultat'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Client</th>
                <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                <th className="text-left p-4 font-medium text-gray-600">Sites</th>
                <th className="text-left p-4 font-medium text-gray-600">Contrats</th>
                <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{client.raison_sociale}</p>
                    <p className="text-xs text-gray-500">{client.numero_client}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{client.contact_nom || '-'}</p>
                    <p className="text-xs text-gray-500">{client.telephone || '-'}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {client.sites?.[0]?.count || 0} sites
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {client.contrats?.[0]?.count || 0} actifs
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.actif 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(client)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {filteredClients.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Affichage {filteredClients.length} sur {clients.length} clients
            </p>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">N° Client</label>
                  <input 
                    type="text" 
                    value={form.numero_client}
                    onChange={(e) => setForm({...form, numero_client: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="particulier">Particulier</option>
                    <option value="entreprise">Entreprise</option>
                    <option value="collectivite">Collectivité</option>
                  </select>
                </div>
              </div>

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

              {/* Adresse facturation */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📍 Adresse de facturation</h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={form.adresse_facturation}
                    onChange={(e) => setForm({...form, adresse_facturation: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Adresse"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      value={form.cp_facturation}
                      onChange={(e) => setForm({...form, cp_facturation: e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm"
                      placeholder="Code postal"
                    />
                    <input 
                      type="text" 
                      value={form.ville_facturation}
                      onChange={(e) => setForm({...form, ville_facturation: e.target.value})}
                      className="col-span-2 border rounded-lg px-3 py-2 text-sm"
                      placeholder="Ville"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👤 Contact principal</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    value={form.contact_prenom}
                    onChange={(e) => setForm({...form, contact_prenom: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Prénom"
                  />
                  <input 
                    type="text" 
                    value={form.contact_nom}
                    onChange={(e) => setForm({...form, contact_nom: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Nom"
                  />
                </div>
                <input 
                  type="text" 
                  value={form.contact_fonction}
                  onChange={(e) => setForm({...form, contact_fonction: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
                  placeholder="Fonction"
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input 
                    type="tel" 
                    value={form.telephone}
                    onChange={(e) => setForm({...form, telephone: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Téléphone"
                  />
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Email"
                  />
                </div>
                <input 
                  type="email" 
                  value={form.email_facturation}
                  onChange={(e) => setForm({...form, email_facturation: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
                  placeholder="Email facturation (si différent)"
                />
              </div>

              {/* Paiement */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">💳 Conditions de paiement</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mode de paiement</label>
                    <select 
                      value={form.mode_paiement}
                      onChange={(e) => setForm({...form, mode_paiement: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="virement">Virement</option>
                      <option value="cheque">Chèque</option>
                      <option value="cb">Carte bancaire</option>
                      <option value="prelevement">Prélèvement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Délai paiement (jours)</label>
                    <input 
                      type="number" 
                      value={form.delai_paiement_jours}
                      onChange={(e) => setForm({...form, delai_paiement_jours: parseInt(e.target.value) || 30})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
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
                  rows={3}
                  placeholder="Notes internes..."
                />
              </div>

              {/* Statut */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="actif"
                  checked={form.actif}
                  onChange={(e) => setForm({...form, actif: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="actif" className="text-sm">Client actif</label>
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
                {editingClient ? 'Enregistrer' : 'Créer le client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
