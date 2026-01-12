// src/pages/CompleteProfilePage.jsx
// VERSION CORRIGÉE - Utilise la fonction RPC complete_registration (bypass RLS)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { supabase } from '../config/supabase';
import {
  Flame, User, Building2, Phone, MapPin,
  AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const { startDemo } = useDemo();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prospectData, setProspectData] = useState(null);
  const [loadingProspect, setLoadingProspect] = useState(true);

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    entreprise: '',
    siret: '',
    ville: ''
  });

  // Charger les données du prospect au montage (AVANT de créer l'org)
  useEffect(() => {
    const loadProspectData = async () => {
      if (!user?.email) {
        setLoadingProspect(false);
        return;
      }
      
      try {
        console.log('🔍 Recherche prospect pour:', user.email);
        
        const { data, error } = await supabase
          .from('demandes_prospects')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.warn('⚠️ Erreur chargement prospect:', error);
        } else if (data) {
          console.log('✅ Prospect trouvé:', data);
          setProspectData(data);
        } else {
          console.log('ℹ️ Aucun prospect trouvé pour cet email');
        }
      } catch (e) {
        console.error('❌ Erreur chargement prospect:', e);
      } finally {
        setLoadingProspect(false);
      }
    };
    
    loadProspectData();
  }, [user?.email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.prenom || !formData.nom) {
      setError('Le prénom et le nom sont obligatoires');
      return;
    }

    if (!formData.telephone) {
      setError('Le téléphone est obligatoire');
      return;
    }

    const telClean = formData.telephone.replace(/[\s\-\.]/g, '');
    if (!/^\d{10}$/.test(telClean)) {
      setError('Le téléphone doit contenir 10 chiffres');
      return;
    }

    if (!formData.entreprise) {
      setError("Le nom de l'entreprise est obligatoire");
      return;
    }

    if (!formData.siret) {
      setError('Le SIRET est obligatoire');
      return;
    }

    const siretClean = formData.siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(siretClean)) {
      setError('Le SIRET doit contenir 14 chiffres');
      return;
    }

    if (!formData.ville) {
      setError('La ville est obligatoire');
      return;
    }

    if (!user?.id) {
      setError("Utilisateur non authentifié");
      return;
    }

    setSubmitting(true);

    try {
      console.log('🚀 Appel RPC complete_registration...');
      
      // Préparer les domaines (convertir les noms du questionnaire)
      const domainesMap = {
        'ssi': 'SSI',
        'dsf': 'DSF', 
        'desenfumage': 'DSF',
        'compartimentage': 'CMP',
        'baes': 'BAES',
        'extincteurs': 'EXT',
        'ria': 'RIA',
        'colonnes_seches': 'COLSEC'
      };
      
      const rawDomaines = prospectData?.domaines_demandes || ['ssi'];
      const domaines = rawDomaines.map(d => domainesMap[d?.toLowerCase()] || d?.toUpperCase() || 'SSI');
      
      console.log('📋 Domaines:', domaines);

      // ========================================
      // APPEL DE LA FONCTION RPC (bypass RLS)
      // ========================================
      const { data: rpcResult, error: rpcError } = await supabase.rpc('complete_registration', {
        p_nom: formData.nom,
        p_prenom: formData.prenom,
        p_telephone: telClean,
        p_entreprise: formData.entreprise,
        p_siret: siretClean,
        p_ville: formData.ville,
        p_domaines: domaines,
        p_formule: prospectData?.profil_demande === 'installateur' ? 'pro' : 'starter',
        p_nb_utilisateurs: parseInt(prospectData?.nb_utilisateurs) || 1
      });

      if (rpcError) {
        console.error('❌ Erreur RPC:', rpcError);
        throw new Error(rpcError.message || "Erreur lors de l'inscription");
      }

      console.log('📦 Résultat RPC:', rpcResult);

      // Vérifier le résultat de la fonction
      if (!rpcResult?.success) {
        throw new Error(rpcResult?.error || "Erreur lors de la création du compte");
      }

      console.log('✅ Inscription réussie!');

      // Rafraîchir les données utilisateur
      await refreshUserData();

      // Préparer les données pour la démo
      const demoRequestData = {
        organisation_id: rpcResult.organisation_id,
        domaines_demandes: domaines,
        profil_demande: prospectData?.profil_demande || 'mainteneur',
        nb_utilisateurs: prospectData?.nb_utilisateurs || '1',
        tarif_calcule: prospectData?.tarif_calcule,
        options_selectionnees: prospectData?.options_selectionnees || {}
      };

      // Démarrer la session démo (3 minutes sur le VRAI dashboard)
      await startDemo(demoRequestData);
      console.log('🎬 Session démo démarrée');

      // Rediriger vers le VRAI dashboard (pas une page fictive)
      navigate('/dashboard', {
        state: {
          isDemo: true,
          request: demoRequestData
        },
        replace: true
      });

    } catch (err) {
      console.error('❌ Erreur submit:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-black">E</span>
          <span className="text-white font-black">S</span>
        </div>
        <Flame className="absolute -top-1 -right-1 w-4 h-4 text-orange-500" />
      </div>
      <div>
        <span className="text-xl font-black text-white">Easy</span>
        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Sécurité</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="w-12 h-1 bg-green-500 rounded" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
            2
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Complétez votre profil
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Étape 2/2 : Vos informations
        </p>

        {/* Afficher les domaines sélectionnés si disponibles */}
        {!loadingProspect && prospectData?.domaines_demandes && (
          <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
            <p className="text-gray-400 text-sm text-center">
              Domaines sélectionnés : {' '}
              <span className="text-white font-medium">
                {prospectData.domaines_demandes.map(d => d.toUpperCase()).join(', ')}
              </span>
            </p>
            {prospectData.tarif_calcule && (
              <p className="text-gray-400 text-sm text-center mt-1">
                Tarif estimé : {' '}
                <span className="text-green-400 font-medium">
                  {prospectData.tarif_calcule}€/mois
                </span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prénom <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Téléphone <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">10 chiffres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de l'entreprise <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                placeholder="Ma Société SARL"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SIRET <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="siret"
              value={formData.siret}
              onChange={handleChange}
              placeholder="123 456 789 00012"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <p className="text-gray-500 text-xs mt-1">14 chiffres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ville <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Paris"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Terminer l'inscription"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
