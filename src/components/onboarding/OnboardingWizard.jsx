// src/components/onboarding/OnboardingWizard.jsx
// Easy Sécurité - Assistant de configuration

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { 
  CheckCircle2, Building2, Upload, Users, MapPin, 
  FileText, X, ArrowRight, ArrowLeft 
} from 'lucide-react';

const OnboardingWizard = ({ onComplete, onClose }) => {
  const { orgId, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 'profil', label: 'Profil entreprise', icon: Building2 },
    { id: 'logo', label: 'Logo & identité', icon: Upload },
    { id: 'client', label: 'Premier client', icon: Users },
    { id: 'site', label: 'Premier site', icon: MapPin },
    { id: 'rapport', label: 'Premier rapport', icon: FileText },
  ];

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!orgId) throw new Error('organisation_id introuvable');
      await supabase
        .from('onboarding_progress')
        .upsert({
          organisation_id: orgId,
          completed: true,
          onboarding_complete: true,
          completed_at: new Date().toISOString()
        });
      
      if (refreshUserData) await refreshUserData();
      onComplete();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bienvenue sur Easy Sécurité !</h2>
              <p className="opacity-90">Configurons votre espace en quelques étapes</p>
            </div>
            <button 
              onClick={onClose || onComplete}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-red-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {steps[currentStep].label}
          </h3>
          
          <div className="text-center py-12">
            {React.createElement(steps[currentStep].icon, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" })}
            <p className="text-gray-500">
              Cette étape sera disponible prochainement.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Vous pouvez passer cette étape pour l'instant.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Passer
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-600"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Terminer'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
