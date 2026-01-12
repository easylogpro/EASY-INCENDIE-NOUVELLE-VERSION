// src/components/demo/DemoBanner.jsx
// Easy Sécurité - Bannière de démo avec timer

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDemo } from '../../contexts/DemoContext';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Lock, ArrowRight, X } from 'lucide-react';

const DemoBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemoMode, demoExpired, timeRemaining, formatTimeRemaining } = useDemo();
  const { isAuthenticated } = useAuth();

  // Ne pas afficher sur certaines pages
  const hiddenPaths = ['/', '/login', '/register', '/demo', '/demo-expired', '/subscribe'];
  if (hiddenPaths.includes(location.pathname)) return null;
  
  // Ne pas afficher si pas en mode démo
  if (!isDemoMode && !demoExpired) return null;

  // Si démo expirée
  if (demoExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Démo terminée</p>
              <p className="text-sm opacity-90">Souscrivez pour continuer à utiliser Easy Sécurité</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscribe')}
            className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            S'abonner maintenant
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Timer actif
  const isUrgent = timeRemaining <= 60;
  
  return (
    <div className={`${isUrgent ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-white/20 rounded-full ${isUrgent ? 'animate-pulse' : ''}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium">Mode Démo</span>
              <span className="mx-2 opacity-60">•</span>
              <span className="text-white/90">Accès en lecture seule</span>
            </div>
          </div>
          
          <div className={`px-4 py-1 bg-white/20 rounded-full font-mono text-lg font-bold ${isUrgent ? 'animate-pulse' : ''}`}>
            {formatTimeRemaining()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80 hidden sm:block">
            {isUrgent ? '⚠️ Dernière minute !' : 'Testez les fonctionnalités'}
          </span>
          <button
            onClick={() => navigate('/subscribe')}
            className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            S'abonner
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
