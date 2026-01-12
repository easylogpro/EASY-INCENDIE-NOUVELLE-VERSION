// src/pages/SettingsPage.jsx
// Page de paramétrage de l'organisation

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { updateOrganizationSettings, uploadLogo } from '../services/organizationService';
import toast from 'react-hot-toast';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CreditCard,
  Palette,
  Upload,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Bell,
  Users,
  Shield
} from 'lucide-react';

const SettingsPage = () => {
  const { orgSettings, orgId, userData, refreshSettings, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('identite');
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  // Charger les données actuelles
  useEffect(() => {
    if (orgSettings) {
      reset(orgSettings);
      setLogoPreview(orgSettings.logo_url);
    }
  }, [orgSettings, reset]);

  // Sauvegarder les modifications
  const onSubmit = async (data) => {
    if (!isAdmin()) {
      toast.error('Seul un administrateur peut modifier les paramètres');
      return;
    }

    setLoading(true);
    try {
      await updateOrganizationSettings(orgId, userData.uid, data);
      await refreshSettings();
      toast.success('Paramètres enregistrés');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Upload logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    try {
      const url = await uploadLogo(orgId, userData.uid, file);
      setLogoPreview(url);
      await refreshSettings();
      toast.success('Logo mis à jour');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
      setLogoPreview(orgSettings?.logo_url);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Onglets
  const tabs = [
    { id: 'identite', label: 'Identité', icon: Building2 },
    { id: 'coordonnees', label: 'Coordonnées', icon: MapPin },
    { id: 'legal', label: 'Informations légales', icon: FileText },
    { id: 'bancaire', label: 'Bancaire', icon: CreditCard },
    { id: 'apparence', label: 'Apparence', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'espace_client', label: 'Espace client', icon: Users },
    { id: 'licence', label: 'Licence', icon: Shield }
  ];

  if (!orgSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Settings className="w-7 h-7 text-blue-500" />
          Paramètres de l'organisation
        </h1>
        <p className="text-slate-500 mt-1">
          Configurez les informations de votre entreprise
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar onglets */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              
              {/* Identité */}
              {activeTab === 'identite' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Identité de l'entreprise
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Raison sociale *
                      </label>
                      <input
                        type="text"
                        {...register('nom', { required: 'Raison sociale requise' })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                      {errors.nom && (
                        <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Forme juridique
                      </label>
                      <select
                        {...register('forme_juridique')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner</option>
                        <option value="SAS">SAS</option>
                        <option value="SARL">SARL</option>
                        <option value="SA">SA</option>
                        <option value="EURL">EURL</option>
                        <option value="EI">Entreprise Individuelle</option>
                        <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Capital social
                      </label>
                      <input
                        type="text"
                        {...register('capital')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 10 000 €"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Coordonnées */}
              {activeTab === 'coordonnees' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Coordonnées
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        {...register('adresse')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numéro et nom de rue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        {...register('code_postal')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="75001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        {...register('ville')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          {...register('telephone')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          {...register('email')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="contact@entreprise.fr"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Site web
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="url"
                          {...register('site_web')}
                          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.entreprise.fr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations légales */}
              {activeTab === 'legal' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Informations légales
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        SIRET
                      </label>
                      <input
                        type="text"
                        {...register('siret')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXX XXX XXX XXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        SIREN
                      </label>
                      <input
                        type="text"
                        {...register('siren')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Code APE
                      </label>
                      <input
                        type="text"
                        {...register('code_ape')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXXX X"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        RCS
                      </label>
                      <input
                        type="text"
                        {...register('rcs')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ville du RCS"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        N° TVA Intracommunautaire
                      </label>
                      <input
                        type="text"
                        {...register('tva_intracommunautaire')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="FR XX XXX XXX XXX"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Lien CGV
                      </label>
                      <input
                        type="url"
                        {...register('cgv_url')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.entreprise.fr/cgv"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mention légale pied de page (documents)
                      </label>
                      <textarea
                        {...register('mention_legale_pied_page')}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Toute commande implique l'acceptation des CGV..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bancaire */}
              {activeTab === 'bancaire' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Coordonnées bancaires
                  </h2>
                  <p className="text-sm text-slate-500 -mt-2">
                    Ces informations apparaîtront sur vos factures
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        IBAN
                      </label>
                      <input
                        type="text"
                        {...register('iban')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        BIC
                      </label>
                      <input
                        type="text"
                        {...register('bic')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Apparence */}
              {activeTab === 'apparence' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Apparence
                  </h2>
                  
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      Logo de l'entreprise
                    </label>
                    <div className="flex items-start gap-6">
                      {/* Prévisualisation */}
                      <div className="w-40 h-24 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-400 text-sm">Aucun logo</span>
                        )}
                      </div>
                      
                      {/* Upload */}
                      <div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                          {uploadingLogo ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                          {uploadingLogo ? 'Upload...' : 'Changer le logo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={uploadingLogo}
                          />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">
                          PNG ou JPG, max 2 Mo<br />
                          Dimensions recommandées : 300x100 px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Couleur primaire */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Couleur primaire
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        {...register('couleur_primaire')}
                        className="w-12 h-12 rounded-xl cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        {...register('couleur_primaire')}
                        className="w-32 px-4 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                        placeholder="#1E3A5F"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Notifications automatiques
                  </h2>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-700">Notifications clients</h3>
                    
                    {[
                      { key: 'notifications.client_rapport_disponible', label: 'Rapport disponible' },
                      { key: 'notifications.client_devis_cree', label: 'Nouveau devis' },
                      { key: 'notifications.client_relance_devis', label: 'Relance devis sans réponse' },
                      { key: 'notifications.client_facture_emise', label: 'Facture émise' },
                      { key: 'notifications.client_relance_facture', label: 'Relance facture impayée' },
                      { key: 'notifications.client_alerte_critique', label: 'Alerte critique' },
                      { key: 'notifications.client_rappel_maintenance', label: 'Rappel maintenance' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(item.key)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-slate-600">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-slate-700">Notifications sous-traitants</h3>
                    
                    {[
                      { key: 'notifications.stt_mission_assignee', label: 'Mission assignée' },
                      { key: 'notifications.stt_mission_modifiee', label: 'Mission modifiée' },
                      { key: 'notifications.stt_rappel_j1', label: 'Rappel J-1' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(item.key)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-slate-600">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Espace client */}
              {activeTab === 'espace_client' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Espace client en ligne
                  </h2>
                  <p className="text-sm text-slate-500 -mt-2">
                    Choisissez les informations visibles par vos clients
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'espace_client.sites_visible', label: 'Mes sites' },
                      { key: 'espace_client.materiel_visible', label: 'Matériel installé' },
                      { key: 'espace_client.historique_interventions_visible', label: 'Historique interventions' },
                      { key: 'espace_client.devis_visible', label: 'Devis' },
                      { key: 'espace_client.factures_visible', label: 'Factures' },
                      { key: 'espace_client.rapports_visible', label: 'Rapports' },
                      { key: 'espace_client.alertes_visible', label: 'Alertes' },
                      { key: 'espace_client.planning_visible', label: 'Planning interventions' },
                      { key: 'espace_client.contrats_visible', label: 'Contrats de maintenance' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(item.key)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-slate-600">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Licence */}
              {activeTab === 'licence' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 pb-4 border-b">
                    Informations de licence
                  </h2>
                  
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Clé de licence</span>
                      <span className="font-mono font-medium">{orgSettings.licence?.cle || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Plan</span>
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                        {orgSettings.licence?.plan || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Statut</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        orgSettings.licence?.statut === 'actif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {orgSettings.licence?.statut === 'actif' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {orgSettings.licence?.statut || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Modules actifs</span>
                      <div className="flex gap-2">
                        {orgSettings.licence?.modules_actifs?.map((module) => (
                          <span
                            key={module}
                            className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium capitalize"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-slate-600">Expiration</span>
                      <span className="font-medium">
                        {orgSettings.licence?.date_expiration?.toDate
                          ? orgSettings.licence.date_expiration.toDate().toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500">
                    Pour modifier votre abonnement ou ajouter des modules, contactez le support.
                  </p>
                </div>
              )}

            </div>

            {/* Bouton sauvegarder */}
            {activeTab !== 'licence' && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Enregistrer les modifications
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;