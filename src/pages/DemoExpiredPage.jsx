// src/pages/DemoExpiredPage.jsx
// Easy Sécurité - Page quand la démo de 3 minutes est terminée

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Zap, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

const DemoExpiredPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const request = location.state?.request || {};

  // Calculer le prix
  const basePrice = request.tarif_calcule || 59;
  const discount = Math.round(basePrice * 0.10);
  const finalPrice = basePrice - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black mb-2">Démo terminée !</h1>
            <p className="opacity-90">Vos 3 minutes d'essai sont écoulées</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Résumé config */}
            {request.domaines_demandes && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Votre configuration</p>
                <div className="flex flex-wrap gap-2">
                  {(request.domaines_demandes || request.modulesInteresses || []).map(d => (
                    <span key={d} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {d.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {request.nb_utilisateurs || '1'} utilisateur(s)
                </p>
              </div>
            )}

            {/* Prix */}
            <div className="text-center mb-6">
              <p className="text-gray-500 text-sm mb-1">Votre tarif personnalisé</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 line-through text-xl">{basePrice}€</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  {finalPrice}€
                </span>
                <span className="text-gray-500">/mois</span>
              </div>
              <p className="text-green-600 font-medium text-sm mt-1">-10% le premier mois</p>
            </div>

            {/* Avantages */}
            <div className="space-y-3 mb-8">
              {['Sans engagement, résiliez quand vous voulez', 'Support prioritaire inclus', 'Mises à jour automatiques', 'Application mobile incluse'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Boutons */}
            <button
              onClick={() => navigate('/subscribe', { state: { fromDemo: true, request } })}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg mb-3"
            >
              <Zap className="w-5 h-5" />
              Souscrire maintenant
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 py-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer la configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoExpiredPage;
