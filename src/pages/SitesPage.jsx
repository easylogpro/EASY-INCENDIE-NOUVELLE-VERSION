// =============================================================================
// EASY INCENDIE - SitesPage.jsx
// CRUD Sites avec connexion Supabase
// Champs BDD: id, organisation_id, client_id, technicien_id, code_site,
//             nom (NOT NULL), adresse (NOT NULL), code_postal, ville,
//             acces_instructions, contact_nom, contact_telephone, contact_email,
//             type_erp, categorie_erp, effectif, latitude, longitude,
//             domaines_actifs (text[]), notes, actif
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const DOMAINES = [
  { code: 'SSI', label: 'SSI', icon: '🔥', color: 'red' },
  { code: 'DSF', label: 'DSF', icon: '💨', color: 'blue' },
  { code: 'CMP', label: 'CMP', icon: '🚪', color: 'purple' },
  { code: 'BAES', label: 'BAES', icon: '🚨', color: 'yellow' },
  { code: 'EXT', label: 'EXT', icon: '🧯', color: 'red' },
  { code: 'RIA', label: 'RIA', icon: '💧', color: 'cyan' },
  { code: 'COLSEC', label: 'COLSEC', icon: '📌', color: 'gray' },
];

const TYPES_ERP = ['J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'PA', 'CTS', 'SG', 'PS', 'GA', 'OA', 'EF', 'REF'];

export default function SitesPage() {
  const { orgId } = useAuth();
  
  // États
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDomaine, setFilterDomaine] = useState('');
  
  // Formulaire
  const [form, setForm] = useState({
    client_id: '',
    technicien_id: '',
    code_site: '',
    nom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    acces_instructions: '',
    contact_nom: '',
    contact_telephone: '',
    contact_email: '',
    type_erp: '',
    categorie_erp: null,
    effectif: null,
    domaines_actifs: [],
    notes: '',
    actif: true
  });

  // Charger données
  useEffect(() => {
    if (orgId) {
      loadSites();
      loadClients();
      loadTechniciens();
    }
  }, [orgId]);

  const loadSites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          client:clients(raison_sociale),
          technicien:techniciens(nom, prenom)
        `)
        .eq('organisation_id', orgId)
        .order('nom');

      if (error) throw error;
      setSites(data || []);
    } catch (err) {
      console.error('Erreur chargement sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, raison_sociale')
      .eq('organisation_id', orgId)
      .eq('actif', true)
      .order('raison_sociale');
    setClients(data || []);
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

  // Générer code site auto
  const generateCodeSite = async () => {
    const { count } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    
    return `SIT-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  // Ouvrir modal création
  const handleNew = async () => {
    const code = await generateCodeSite();
    setForm({
      client_id: '',
      technicien_id: '',
      code_site: code,
      nom: '',
      adresse: '',
      code_postal: '',
      ville: '',
      acces_instructions: '',
      contact_nom: '',
      contact_telephone: '',
      contact_email: '',
      type_erp: '',
      categorie_erp: null,
      effectif: null,
      domaines_actifs: [],
      notes: '',
      actif: true
    });
    setEditingSite(null);
    setShowModal(true);
  };

  // Ouvrir modal édition
  const handleEdit = (site) => {
    setForm({
      client_id: site.client_id || '',
      technicien_id: site.technicien_id || '',
      code_site: site.code_site || '',
      nom: site.nom || '',
      adresse: site.adresse || '',
      code_postal: site.code_postal || '',
      ville: site.ville || '',
      acces_instructions: site.acces_instructions || '',
      contact_nom: site.contact_nom || '',
      contact_telephone: site.contact_telephone || '',
      contact_email: site.contact_email || '',
      type_erp: site.type_erp || '',
      categorie_erp: site.categorie_erp || null,
      effectif: site.effectif || null,
      domaines_actifs: site.domaines_actifs || [],
      notes: site.notes || '',
      actif: site.actif !== false
    });
    setEditingSite(site);
    setShowModal(true);
  };

  // Toggle domaine
  const toggleDomaine = (code) => {
    setForm(prev => ({
      ...prev,
      domaines_actifs: prev.domaines_actifs.includes(code)
        ? prev.domaines_actifs.filter(d => d !== code)
        : [...prev.domaines_actifs, code]
    }));
  };

  // Sauvegarder
  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert('Le nom du site est obligatoire');
      return;
    }
    if (!form.adresse.trim()) {
      alert("L'adresse est obligatoire");
      return;
    }

    try {
      const siteData = {
        ...form,
        organisation_id: orgId,
        client_id: form.client_id || null,
        technicien_id: form.technicien_id || null,
        categorie_erp: form.categorie_erp || null,
        effectif: form.effectif || null,
        updated_at: new Date().toISOString()
      };

      if (editingSite) {
        const { error } = await supabase
          .from('sites')
          .update(siteData)
          .eq('id', editingSite.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sites')
          .insert([siteData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadSites();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer
  const handleDelete = async (site) => {
    if (!confirm(`Supprimer le site "${site.nom}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', site.id);
      if (error) throw error;
      loadSites();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer sites
  const filteredSites = sites.filter(s => {
    const matchSearch = !search || 
      s.nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.code_site?.toLowerCase().includes(search.toLowerCase()) ||
      s.ville?.toLowerCase().includes(search.toLowerCase());
    const matchClient = !filterClient || s.client_id === filterClient;
    const matchDomaine = !filterDomaine || s.domaines_actifs?.includes(filterDomaine);
    return matchSearch && matchClient && matchDomaine;
  });

  // Stats
  const statsERP = sites.filter(s => s.type_erp).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📍 Sites</h1>
          <p className="text-gray-500">Gestion des sites d'intervention</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          ➕ Nouveau site
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-2xl font-bold">{sites.length}</p>
          <p className="text-gray-500 text-xs">Total sites</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-700">{sites.filter(s => s.actif).length}</p>
          <p className="text-green-600 text-xs">Actifs</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{statsERP}</p>
          <p className="text-purple-600 text-xs">ERP</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{sites.filter(s => s.technicien_id).length}</p>
          <p className="text-blue-600 text-xs">Affectés</p>
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
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.raison_sociale}</option>
            ))}
          </select>
          <select 
            value={filterDomaine}
            onChange={(e) => setFilterDomaine(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les domaines</option>
            {DOMAINES.map(d => (
              <option key={d.code} value={d.code}>{d.icon} {d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filteredSites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {sites.length === 0 ? 'Aucun site. Créez votre premier site !' : 'Aucun résultat'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Site</th>
                <th className="text-left p-4 font-medium text-gray-600">Client</th>
                <th className="text-left p-4 font-medium text-gray-600">Adresse</th>
                <th className="text-left p-4 font-medium text-gray-600">Type ERP</th>
                <th className="text-left p-4 font-medium text-gray-600">Technicien</th>
                <th className="text-left p-4 font-medium text-gray-600">Domaines</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map(site => (
                <tr key={site.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{site.nom}</p>
                    <p className="text-xs text-gray-500">{site.code_site}</p>
                  </td>
                  <td className="p-4 text-gray-700">
                    {site.client?.raison_sociale || '-'}
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{site.adresse}</p>
                    <p className="text-xs text-gray-500">{site.code_postal} {site.ville}</p>
                  </td>
                  <td className="p-4">
                    {site.type_erp ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {site.type_erp} {site.categorie_erp ? `- Cat ${site.categorie_erp}` : ''}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4 text-gray-700">
                    {site.technicien 
                      ? `${site.technicien.prenom} ${site.technicien.nom}`.slice(0, 15) 
                      : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {site.domaines_actifs?.map(d => {
                        const dom = DOMAINES.find(x => x.code === d);
                        return dom ? (
                          <span 
                            key={d} 
                            className={`px-1.5 py-0.5 rounded text-xs bg-${dom.color}-100 text-${dom.color}-700`}
                          >
                            {dom.icon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleEdit(site)}
                      className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(site)}
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
        
        {filteredSites.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Affichage {filteredSites.length} sur {sites.length} sites
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
                {editingSite ? 'Modifier le site' : 'Nouveau site'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Client et Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <select 
                    value={form.client_id}
                    onChange={(e) => setForm({...form, client_id: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.raison_sociale}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code site</label>
                  <input 
                    type="text" 
                    value={form.code_site}
                    onChange={(e) => setForm({...form, code_site: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom du site *</label>
                <input 
                  type="text" 
                  value={form.nom}
                  onChange={(e) => setForm({...form, nom: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Carrefour City Guyancourt"
                />
              </div>

              {/* Adresse */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">📍 Adresse</h3>
                <input 
                  type="text" 
                  value={form.adresse}
                  onChange={(e) => setForm({...form, adresse: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Adresse *"
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
                <textarea 
                  value={form.acces_instructions}
                  onChange={(e) => setForm({...form, acces_instructions: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
                  rows={2}
                  placeholder="Instructions d'accès (code porte, interphone...)"
                />
              </div>

              {/* Contact sur site */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👤 Contact sur site</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={form.contact_nom}
                    onChange={(e) => setForm({...form, contact_nom: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Nom"
                  />
                  <input 
                    type="tel" 
                    value={form.contact_telephone}
                    onChange={(e) => setForm({...form, contact_telephone: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Téléphone"
                  />
                  <input 
                    type="email" 
                    value={form.contact_email}
                    onChange={(e) => setForm({...form, contact_email: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="Email"
                  />
                </div>
              </div>

              {/* Type ERP */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">🏢 Classification ERP</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type ERP</label>
                    <select 
                      value={form.type_erp}
                      onChange={(e) => setForm({...form, type_erp: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">-- Type --</option>
                      {TYPES_ERP.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
                    <select 
                      value={form.categorie_erp || ''}
                      onChange={(e) => setForm({...form, categorie_erp: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">-- Cat --</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Effectif</label>
                    <input 
                      type="number" 
                      value={form.effectif || ''}
                      onChange={(e) => setForm({...form, effectif: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Effectif"
                    />
                  </div>
                </div>
              </div>

              {/* Technicien */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">👷 Technicien attitré</h3>
                <select 
                  value={form.technicien_id}
                  onChange={(e) => setForm({...form, technicien_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- Aucun --</option>
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                  ))}
                </select>
              </div>

              {/* Domaines */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-3">🔥 Domaines actifs sur ce site</h3>
                <div className="flex flex-wrap gap-2">
                  {DOMAINES.map(d => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => toggleDomaine(d.code)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.domaines_actifs.includes(d.code)
                          ? `border-${d.color}-500 bg-${d.color}-50 text-${d.color}-700`
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {d.icon} {d.label}
                    </button>
                  ))}
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

              {/* Statut */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="actif"
                  checked={form.actif}
                  onChange={(e) => setForm({...form, actif: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="actif" className="text-sm">Site actif</label>
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
                {editingSite ? 'Enregistrer' : 'Créer le site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
