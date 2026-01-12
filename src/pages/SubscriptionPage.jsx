// src/pages/SubscriptionPage.jsx
// VERSION CORRIGÉE - Utilise RPC create_subscription (bypass RLS)
// Garde les imports de pricing de l'autre IA

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, CheckCircle2, Shield, Zap, Lock, Users, Building2,
  Clock, AlertTriangle, ArrowRight, Loader2, Check, Flame
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { computePricing } from '../utils/pricing';
import { pricingData, availableAddons } from '../data/pricingData';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, refreshSubscription, refreshUserData } = useAuth();
  
  // Récupérer les données de la demande depuis la navigation ou la démo
  const request = location.state?.request || location.state?.demoRequest || {};
  const fromDemo = location.state?.fromDemo || false;
  const demoEndCallback = location.state?.demoEndCallback;
  
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
    discount: 0
  });
  
  const orgId = userData?.organisation_id;
  const mountedRef = useRef(true);

  useEffect(() => {
    // Calculer le prix basé sur la demande
    const calculatedPricing = computePricing({
      domains: request.domaines || request.modulesInteresses || request.domaines_demandes || [],
      users: request.nb_utilisateurs || request.nombreTechniciens || 1,
      addons: selectedAddons
    });
    setPricing(calculatedPricing);
  }, [request, selectedAddons]);

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
  // SOUMISSION - UTILISE RPC create_subscription
  // ============================================================
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Création abonnement via RPC...');
      console.log('📋 Request:', request);
      console.log('💰 Pricing:', pricing);
      console.log('🔧 Addons:', selectedAddons);

      // Préparer les domaines
      const domainesMap = {
        'ssi': 'SSI', 'dsf': 'DSF', 'desenfumage': 'DSF',
        'compartimentage': 'CMP', 'baes': 'BAES',
        'extincteurs': 'EXT', 'ria': 'RIA', 'colonnes_seches': 'COLSEC'
      };
      
      const rawDomaines = request.domaines || request.modulesInteresses || request.domaines_demandes || ['SSI'];
      const domaines = rawDomaines.map(d => domainesMap[d?.toLowerCase()] || d?.toUpperCase() || 'SSI');
      
      const nbUtilisateurs = parseInt(request.nb_utilisateurs || request.nombreTechniciens || '1') || 1;

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
          payment_method: 'card'
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

      // Si on vient de la démo, terminer la session de démo
      if (fromDemo && demoEndCallback) {
        try {
          await demoEndCallback(true);
        } catch (e) {
          console.warn('Erreur demoEndCallback:', e);
        }
      }

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

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base</span>
                  <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
                </div>

                {pricing.addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Options</span>
                    <span className="font-medium">{formatPrice(pricing.addonsTotal)}</span>
                  </div>
                )}

                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise 1er mois</span>
                    <span className="font-medium">-{formatPrice(pricing.discount)}</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold">Total / mois</span>
                  <span className="font-bold text-xl">{formatPrice(pricing.totalPrice)}</span>
                </div>

                <div className="pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Accès immédiat
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Jusqu'à {request.nb_utilisateurs || request.nombreTechniciens || 1} utilisateurs
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Sans engagement
                  </div>
                </div>
              </div>

              {/* Addons */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Options</h4>
                <div className="space-y-2">
                  {availableAddons.map(addon => (
                    <label key={addon.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{addon.name}</span>
                          <span className="text-sm text-gray-600">{formatPrice(addon.price)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{addon.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPage;
