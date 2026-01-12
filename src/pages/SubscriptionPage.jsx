// src/pages/SubscriptionPage.jsx
// VERSION CORRIGÉE - Charge données depuis BDD + affiche tout + endDemo direct

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, CheckCircle2, Shield, Zap, Lock, Users, Building2,
  Clock, AlertTriangle, ArrowRight, Loader2, Check, Flame, ArrowLeft
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { calculatePrice, getAvailableReports, getDomainLabels } from '../utils/pricingAlgorithm';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, refreshSubscription, refreshUserData } = useAuth();
  const { isDemoMode, endDemo } = useDemo();
  
  // État pour les données prospect
  const [prospectData, setProspectData] = useState(null);
  const [loadingProspect, setLoadingProspect] = useState(true);
  
  const fromDemo = location.state?.fromDemo || isDemoMode;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [pricing, setPricing] = useState({
    basePrice: 0,
    addonsTotal: 0,
    totalPrice: 0,
    discount: 0,
    finalPrice: 0
  });
  
  const mountedRef = useRef(true);

  // Labels des domaines
  const DOMAIN_LABELS = getDomainLabels();

  // Options disponibles
  const availableAddons = [
    { id: 'ia', name: 'Assistant IA', price: 9, description: 'Aide à la rédaction des rapports' },
    { id: 'veille_reglementaire', name: 'Veille réglementaire', price: 5, description: 'Alertes sur les évolutions normatives' },
    { id: 'export_compta', name: 'Export comptable', price: 5, description: 'Export vers logiciels comptables' }
  ];

  // ============================================================
  // CHARGEMENT DES DONNÉES PROSPECT (depuis BDD ou location.state)
  // ============================================================
  useEffect(() => {
    const loadProspectData = async () => {
      setLoadingProspect(true);
      
      try {
        // 1) Essayer location.state d'abord
        const stateRequest = location.state?.request || location.state?.demoRequest;
        
        if (stateRequest && stateRequest.domaines_demandes?.length > 0) {
          console.log('📋 Données prospect depuis location.state');
          setProspectData(stateRequest);
          
          // Restaurer les addons sélectionnés
          const addons = stateRequest.options_selectionnees?.addons || [];
          setSelectedAddons(addons);
          
          setLoadingProspect(false);
          return;
        }

        // 2) Sinon charger depuis la BDD par email
        if (user?.email) {
          console.log('🔍 Chargement prospect depuis BDD pour:', user.email);
          
          const { data, error } = await supabase
            .from('demandes_prospects')
            .select('*')
            .eq('email', user.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error('Erreur chargement prospect:', error);
          } else if (data) {
            console.log('✅ Prospect trouvé en BDD:', data.id);
            setProspectData(data);
            
            // Restaurer les addons sélectionnés
            const addons = data.options_selectionnees?.addons || [];
            setSelectedAddons(addons);
            
            setLoadingProspect(false);
            return;
          }
        }

        // 3) Essayer sessionStorage en dernier recours
        const storedData = sessionStorage.getItem('questionnaire_data');
        if (storedData) {
          console.log('📦 Données prospect depuis sessionStorage');
          const parsed = JSON.parse(storedData);
          setProspectData({
            domaines_demandes: parsed.formData?.modulesInteresses || ['ssi'],
            profil_demande: parsed.formData?.typeActivite || 'mainteneur',
            nb_utilisateurs: parsed.formData?.nombreTechniciens || '1',
            tarif_calcule: parsed.pricing?.finalPrice,
            options_selectionnees: {
              addons: parsed.pricing?.selectedAddons || [],
              tarif_base: parsed.pricing?.basePrice,
              tarif_options: parsed.pricing?.addonsTotal,
              tarif_total: parsed.pricing?.totalPrice,
              discount: parsed.pricing?.discount
            }
          });
          setSelectedAddons(parsed.pricing?.selectedAddons || []);
        } else {
          // 4) Valeurs par défaut si rien trouvé
          console.log('⚠️ Aucune donnée prospect, utilisation des valeurs par défaut');
          setProspectData({
            domaines_demandes: ['ssi'],
            profil_demande: 'mainteneur',
            nb_utilisateurs: '1'
          });
        }
        
      } catch (err) {
        console.error('Erreur loadProspectData:', err);
      }
      
      setLoadingProspect(false);
    };

    loadProspectData();
  }, [user?.email, location.state]);

  // ============================================================
  // CALCUL DU PRIX QUAND LES DONNÉES CHANGENT
  // ============================================================
  useEffect(() => {
    if (!prospectData) return;

    const domains = prospectData.domaines_demandes || ['ssi'];
    const userCount = prospectData.nb_utilisateurs || '1';
    const profile = prospectData.profil_demande || 'mainteneur';

    const calculatedPricing = calculatePrice(domains, userCount, selectedAddons, profile);
    setPricing(calculatedPricing);
    
  }, [prospectData, selectedAddons]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePaymentChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 3);
    }
    
    setPaymentInfo(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(a => a !== addonId)
        : [...prev, addonId]
    );
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);
  const formatPrice = (price) => `${price}€`;

  // ============================================================
  // SOUMISSION - UTILISE RPC create_subscription + endDemo direct
  // ============================================================
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Création abonnement via RPC...');
      console.log('📋 ProspectData:', prospectData);
      console.log('💰 Pricing:', pricing);
      console.log('🔧 Addons:', selectedAddons);

      // Préparer les domaines
      const domainesMap = {
        'ssi': 'SSI', 'dsf': 'DSF', 'desenfumage': 'DSF',
        'compartimentage': 'CMP', 'baes': 'BAES',
        'extincteurs': 'EXT', 'ria': 'RIA', 'colonnes_seches': 'COLSEC'
      };
      
      const rawDomaines = prospectData?.domaines_demandes || ['ssi'];
      const domaines = rawDomaines.map(d => domainesMap[d?.toLowerCase()] || d?.toUpperCase() || 'SSI');
      
      const nbUtilisateurs = parseInt(prospectData?.nb_utilisateurs || '1') || 1;

      // ========================================
      // APPEL DE LA FONCTION RPC (bypass RLS)
      // ========================================
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_subscription', {
        p_domaines: domaines,
        p_nb_utilisateurs: nbUtilisateurs,
        p_prix_mensuel: pricing.totalPrice,
        p_options: {
          addons: selectedAddons,
          prix_base: pricing.basePrice,
          prix_options: pricing.addonsTotal,
          remise_premier_mois: pricing.discount,
          premier_mois_remise: true,
          payment_method: 'card',
          profil: prospectData?.profil_demande
        }
      });

      if (rpcError) {
        console.error('❌ Erreur RPC:', rpcError);
        throw new Error(rpcError.message || 'Erreur lors de la création de l\'abonnement');
      }

      console.log('📦 Résultat RPC:', rpcResult);

      if (!rpcResult?.success) {
        throw new Error(rpcResult?.error || 'Erreur lors de l\'activation');
      }

      console.log('✅ Abonnement créé avec succès!');

      // ========================================
      // TERMINER LA SESSION DÉMO (appel direct)
      // ========================================
      if (fromDemo || isDemoMode) {
        try {
          await endDemo(true); // converted = true
          console.log('✅ Session démo terminée');
        } catch (e) {
          console.warn('Erreur endDemo:', e);
        }
      }

      // Nettoyer sessionStorage
      sessionStorage.removeItem('prospect_id');
      sessionStorage.removeItem('questionnaire_data');

      // Rafraîchir les données
      if (refreshSubscription) await refreshSubscription();
      if (refreshUserData) await refreshUserData();

      // Rediriger vers le dashboard
      navigate('/dashboard', { 
        state: { 
          subscriptionSuccess: true, 
          firstMonth: true 
        },
        replace: true
      });

    } catch (err) {
      console.error('❌ Erreur souscription:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Easy Sécurité</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            Paiement sécurisé
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Activer votre abonnement</h1>
        <p className="text-gray-600 text-center mb-8">
          Accédez à toutes les fonctionnalités immédiatement
        </p>

        {error && (
          <div className="max-w-lg mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Informations de paiement
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiry}
                        onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvc}
                        onChange={(e) => handlePaymentChange('cvc', e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.name}
                      onChange={(e) => handlePaymentChange('name', e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={nextStep}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    Paiement sécurisé - Données chiffrées
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Confirmation
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Prêt à activer votre abonnement</p>
                    <p className="text-green-700 text-sm mt-1">
                      Votre abonnement sera activé immédiatement après confirmation.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={prevStep}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Activation...
                        </>
                      ) : (
                        <>
                          Activer l'abonnement
                          <Zap className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary - AFFICHAGE COMPLET DES SÉLECTIONS */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Votre sélection
              </h3>

              {loadingProspect ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* PROFIL */}
                  <div className="pb-4 border-b">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Profil</p>
                    <p className="font-medium text-gray-900">
                      {prospectData?.profil_demande === 'mainteneur' && '🔧 Mainteneur'}
                      {prospectData?.profil_demande === 'installateur' && '⚡ Installateur'}
                      {prospectData?.profil_demande === 'installateur_mainteneur' && '🔧⚡ Installateur + Mainteneur'}
                      {prospectData?.profil_demande === 'artisan' && '🛠️ Artisan'}
                      {prospectData?.profil_demande === 'sous_traitant' && '🤝 Sous-traitant'}
                      {!prospectData?.profil_demande && '🔧 Mainteneur'}
                    </p>
                  </div>

                  {/* DOMAINES SÉLECTIONNÉS */}
                  <div className="pb-4 border-b">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Domaines ({(prospectData?.domaines_demandes || []).length})
                    </p>
                    <div className="space-y-1">
                      {(prospectData?.domaines_demandes || ['ssi']).map((domain, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-800">
                            {DOMAIN_LABELS[domain] || domain?.toUpperCase() || 'SSI'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UTILISATEURS */}
                  <div className="pb-4 border-b">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Techniciens</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {prospectData?.nb_utilisateurs === '1' && '1 utilisateur'}
                        {prospectData?.nb_utilisateurs === '2-5' && '2 à 5 utilisateurs'}
                        {prospectData?.nb_utilisateurs === '6-10' && '6 à 10 utilisateurs'}
                        {prospectData?.nb_utilisateurs === '11-25' && '11 à 25 utilisateurs'}
                        {!prospectData?.nb_utilisateurs && '1 utilisateur'}
                      </span>
                    </div>
                  </div>

                  {/* OPTIONS ADDITIONNELLES */}
                  <div className="pb-4 border-b">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Options</h4>
                    <div className="space-y-2">
                      {availableAddons.map(addon => (
                        <label 
                          key={addon.id} 
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedAddons.includes(addon.id) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id)}
                            onChange={() => toggleAddon(addon.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{addon.name}</span>
                              <span className="text-sm font-semibold text-blue-600">+{addon.price}€</span>
                            </div>
                            <p className="text-xs text-gray-500">{addon.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* RÉCAPITULATIF PRIX */}
                  <div className="bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Tarification</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Abonnement base ({pricing.domainCount || 1} domaine{(pricing.domainCount || 1) > 1 ? 's' : ''})
                        </span>
                        <span className="font-medium">{pricing.basePrice}€/mois</span>
                      </div>

                      {selectedAddons.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Options ({selectedAddons.length})
                          </span>
                          <span className="font-medium">+{pricing.addonsTotal}€/mois</span>
                        </div>
                      )}

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Sous-total</span>
                          <span className="font-medium">{pricing.totalPrice}€/mois</span>
                        </div>
                      </div>

                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>🎁 Remise 1er mois (-10%)</span>
                          <span className="font-medium">-{pricing.discount}€</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-900">1er mois</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{pricing.finalPrice}€</span>
                          <p className="text-xs text-gray-500">puis {pricing.totalPrice}€/mois</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Accès immédiat après paiement
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Sans engagement - Résiliable à tout moment
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Paiement 100% sécurisé
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton retour */}
            <button
              onClick={() => navigate(-1)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Modifier mes choix
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPage;
